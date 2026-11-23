// Renders every style once in Node with minimal browser stubs and checks the output.
// Run: node test/render.test.js
const assert = require("node:assert");

const defined = {};
global.HTMLElement = class {
  attachShadow() {
    this.shadowRoot = { addEventListener() {}, innerHTML: "", activeElement: null, querySelectorAll: () => [] };
  }
  appendChild(el) {
    this.child = el;
  }
  dispatchEvent() {}
};
global.customElements = { get: (tag) => defined[tag], define: (tag, cls) => (defined[tag] = cls) };
global.window = {};
global.document = {
  head: { appendChild() {} },
  getElementById: () => null,
  createElement: () => ({ addEventListener() {}, style: {} }),
};
global.getComputedStyle = () => ({ getPropertyValue: () => "" });
console.info = () => {};
require("../dist/claude-usage-card.js");

const Card = defined["claude-usage-card"];
const Editor = defined["claude-usage-card-editor"];
assert.ok(Card && Editor, "card and editor are registered");

const HOUR = 3600e3;
const now = Date.now();
const P = "sensor.claude_usage_test_";
const limit = (key, value, kind, resetH, model) => ({
  [P + key]: {
    state: String(value),
    last_updated: new Date(now - 60e3).toISOString(),
    attributes: {
      kind,
      model: model || null,
      resets_at: new Date(now + resetH * HOUR).toISOString(),
      unit_of_measurement: "%",
      severity: "normal",
      friendly_name: "x",
    },
  },
});
const states = {
  ...limit("session_limit_usage", 46, "session", 2),
  ...limit("weekly_all_models_limit_usage", 63, "weekly_all", 80),
  ...limit("weekly_opus_limit_usage", 88, "weekly_opus", 80, "Opus"),
  [P + "extra_usage_enabled"]: { state: "on", attributes: {} },
  [P + "extra_usage"]: { state: "12", attributes: {} },
  [P + "extra_usage_credits"]: { state: "6", attributes: {} },
  [P + "extra_usage_limit"]: { state: "50", attributes: {} },
  [P + "api_error"]: { state: "2", attributes: {} },
};
const ids = Object.keys(states).filter((id) => states[id].attributes.kind);
const series = (id) => [6, 4, 2, 1, 0.2].map((h, i) => ({ s: String(10 + i * 8), lu: (now - h * HOUR) / 1000 }));

const hassFor = (lang, dark) => ({
  language: lang,
  locale: { language: lang },
  config: { time_zone: "Europe/Berlin", location_name: "Haus Größe" },
  user: { name: "Anna Müller" },
  themes: { darkMode: dark },
  states,
  entities: {},
  devices: {},
  callWS: async (msg) => Object.fromEntries(msg.entity_ids.map((id) => [id, series(id)])),
});

const STYLES = ["default", "minimal", "terminal", "retro", "synthwave", "paper", "cupertino", "shell", "material", "matrix", "eink"];
const LANGS = [["en", false], ["de", true], ["fr", false], ["es", true], ["nl", false], ["it", true], ["pl", false], ["pt", true], ["sv", false], ["da", true], ["nb", false], ["fi", true], ["cs", false], ["ro", true], ["is", false]];
const cases = [];
for (const style of STYLES) {
  cases.push({ style });
  cases.push({ style, status_colors: true, show_history: true, reset_display: "relative" });
}
cases.push({ style: "default", layout: "columns" }, { style: "default", layout: "rings" });
cases.push({ style: "default", show_title: false, show_logo: false, show_pace: false, show_forecast: false });

(async () => {
  for (const cfg of cases) {
    for (const [lang, dark] of LANGS) {
      const card = new Card();
      card.setConfig({ type: "custom:claude-usage-card", ...cfg });
      card.hass = hassFor(lang, dark);
      await new Promise((r) => setTimeout(r, 0)); // let the history request resolve
      card._render();
      const html = card.shadowRoot.innerHTML;
      const label = `${JSON.stringify(cfg)} ${lang}`;
      assert.ok(html.includes("<ha-card"), `${label}: renders a card`);
      for (const bad of ["undefined", "NaN", "[object Object]"])
        assert.ok(!html.includes(bad), `${label}: output contains "${bad}"`);
      for (const id of ids) assert.ok(html.includes(`data-entity="${id}"`), `${label}: shows ${id}`);
      assert.ok(html.includes(`data-entity="${P}extra_usage"`), `${label}: shows extra usage`);
      assert.ok(html.includes(`data-entity="${P}api_error"`), `${label}: shows the API error`);
      if (cfg.style === "shell") assert.ok(html.includes("annamueller@haus-groesse"), `${label}: shell prompt`);
      card.disconnectedCallback();
    }
  }

  // colors from the config are escaped in every skin
  for (const style of STYLES) {
    const card = new Card();
    card.setConfig({ style, status_colors: true, color_mode: "severity", color_ok: 'red"><b id="x">' });
    card.hass = hassFor("en", false);
    assert.ok(!card.shadowRoot.innerHTML.includes('<b id="x">'), `${style}: color is escaped`);
    card.disconnectedCallback();
  }

  // switching the theme between light and dark re-renders cupertino
  const cup = new Card();
  cup.setConfig({ style: "cupertino" });
  cup.hass = hassFor("en", false);
  cup.hass = hassFor("en", true);
  assert.ok(cup.shadowRoot.innerHTML.includes("cu-dark"), "cupertino follows dark mode");
  cup.disconnectedCallback();

  // no data: the card explains why (expired sign-in, integration down, not installed)
  const down = {};
  for (const id of ids) down[id] = { state: "unavailable", last_changed: new Date(now - 2 * HOUR).toISOString(), attributes: {} };
  const registry = Object.fromEntries(ids.map((id) => [id, { entity_id: id, platform: "hass_claude_usage" }]));
  const statusHass = (lang, { admin = true, reauth = false, entries = [{ state: "loaded" }], reg = registry, devices = {} } = {}) => ({
    ...hassFor(lang, false),
    states: down,
    entities: reg,
    devices,
    user: { name: "Anna Müller", is_admin: admin },
    callWS: async (msg) => {
      if (msg.type === "config_entries/get") return entries;
      if (msg.type === "config_entries/flow/progress")
        return reauth ? [{ handler: "hass_claude_usage", context: { source: "reauth", entry_id: reauth } }] : [];
      return {};
    },
  });
  const statusHtml = async (style, opts, lang = "en") => {
    const card = new Card();
    card.setConfig({ style });
    card.hass = statusHass(lang, opts);
    for (let i = 0; i < 3; i++) await new Promise((r) => setTimeout(r, 0)); // let the status requests resolve
    const html = card.shadowRoot.innerHTML;
    card.disconnectedCallback();
    for (const bad of ["undefined", "NaN", "[object Object]"])
      assert.ok(!html.includes(bad), `${style} status: output contains "${bad}"`);
    return html;
  };
  const NAV = 'data-nav="/config/integrations/integration/hass_claude_usage"';
  for (const style of STYLES) {
    let html = await statusHtml(style, { reauth: true });
    assert.ok(html.includes("Claude sign-in expired") && html.includes(NAV), `${style}: reauth message`);
    for (const id of ids) assert.ok(!html.includes(`data-entity="${id}"`), `${style}: no empty rows`);
    html = await statusHtml(style, { reauth: true }, "de");
    assert.ok(html.includes("Claude-Anmeldung abgelaufen"), `${style}: German reauth message`);
    html = await statusHtml(style, { entries: [{ state: "setup_retry", reason: "Timeout" }] });
    assert.ok(html.includes("Claude Usage has no data right now"), `${style}: integration down`);
    assert.ok(html.includes("The integration reports: Timeout"), `${style}: reason from the config entry`);
    assert.ok(html.includes("No data for 2"), `${style}: time since the last data`);
    html = await statusHtml(style, { admin: false });
    assert.ok(html.includes("Claude Usage has no data right now") && !html.includes("data-nav=\""), `${style}: non-admin`);
    html = await statusHtml(style, { reg: {} });
    assert.ok(!html.includes('class="st"'), `${style}: not installed keeps the old hint`);
  }

  // two accounts: a card for one account ignores the other account's broken entry and reauth flow
  const own = await statusHtml("default", {
    reg: Object.fromEntries(ids.map((id) => [id, { entity_id: id, platform: "hass_claude_usage", device_id: "d1" }])),
    devices: { d1: { config_entries: ["e1"] } },
    entries: [{ entry_id: "e1", state: "loaded" }, { entry_id: "e2", state: "setup_retry", reason: "Other account" }],
    reauth: "e2",
  });
  assert.ok(own.includes("has no data right now"), "own account: no data message");
  assert.ok(!own.includes("Other account") && !own.includes("sign-in expired"), "own account: other account ignored");

  // unchanged values: last_updated is old, the hint only shows when last_reported is old too
  const ago = (min) => new Date(Date.now() - min * 60e3).toISOString();
  const old = Object.fromEntries(Object.entries(states).map(([id, s]) => [id, { ...s, last_updated: ago(120) }]));
  const stale = async (hass) => {
    const card = new Card();
    card.setConfig({});
    card.hass = { ...hassFor("en", false), ...hass };
    assert.ok(!card.shadowRoot.innerHTML.includes("Last update"), "stale: no hint before last_reported is checked");
    for (let i = 0; i < 3; i++) await new Promise((r) => setTimeout(r, 0));
    card.disconnectedCallback();
    return (card.shadowRoot.innerHTML.match(/Last update [^<]*/) || [""])[0];
  };
  const asked = [];
  const api = (min) => async (method, path) => (asked.push(`${method} ${path}`), { last_reported: ago(min) });
  assert.strictEqual(await stale({ callApi: api(5) }), "", "stale: fresh data, nothing to ask");
  assert.deepStrictEqual(asked, [], "stale: no request while last_updated is fresh");
  assert.strictEqual(await stale({ states: old, callApi: api(5) }), "", "stale: reported recently");
  assert.deepStrictEqual(asked, ids.map((id) => `GET states/${id}`), "stale: asks once per limit sensor");
  assert.ok((await stale({ states: old, callApi: api(90) })).includes("1 h 30 min"), "stale: age from last_reported");
  for (const callApi of [undefined, async () => { throw new Error("404"); }, async () => ({})])
    assert.ok((await stale({ states: old, callApi })).includes("2 h 0 min"), "stale: falls back to last_updated");

  // every language has exactly the keys of English
  const src = require("node:fs").readFileSync(require.resolve("../dist/claude-usage-card.js"), "utf8");
  const STRINGS = eval(`(${src.match(/const STRINGS = (\{[\s\S]*?\n  \});/)[1]})`);
  const keys = (o) => Object.keys(o).flatMap((k) => (typeof o[k] === "object" ? keys(o[k]).map((x) => `${k}.${x}`) : [k])).sort();
  for (const lang of Object.keys(STRINGS)) assert.deepStrictEqual(keys(STRINGS[lang]), keys(STRINGS.en), `strings: ${lang}`);
  assert.deepStrictEqual(Object.keys(STRINGS), LANGS.map((l) => l[0]), "render test covers every language");

  // the card rejects unknown styles and thresholds in the wrong order
  assert.throws(() => new Card().setConfig({ style: "nope" }));
  assert.throws(() => new Card().setConfig({ warning_threshold: 90 }));

  // editor: the layout field only shows for the default style
  const fieldNames = (schema) => JSON.stringify(schema).match(/"name":"(style|layout)"/g) || [];
  for (const [style, expectLayout] of [[undefined, true], ["default", true], ["paper", false], ["eink", false]]) {
    const ed = new Editor();
    ed.hass = hassFor("en", false);
    ed.setConfig({ type: "custom:claude-usage-card", ...(style ? { style } : {}) });
    const names = fieldNames(ed.child.schema);
    assert.strictEqual(names.includes('"name":"layout"'), expectLayout, `editor layout field for ${style}`);
  }

  console.log(`render tests passed (${cases.length * LANGS.length} renders)`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
