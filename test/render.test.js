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
const cases = [];
for (const style of STYLES) {
  cases.push({ style });
  cases.push({ style, status_colors: true, show_history: true, reset_display: "relative" });
}
cases.push({ style: "default", layout: "columns" }, { style: "default", layout: "rings" });
cases.push({ style: "default", show_title: false, show_logo: false, show_pace: false, show_forecast: false });

(async () => {
  for (const cfg of cases) {
    for (const [lang, dark] of [["en", false], ["de", true]]) {
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

  // the card rejects unknown styles
  assert.throws(() => new Card().setConfig({ style: "nope" }));

  // editor: the layout field only shows for the default style
  const fieldNames = (schema) => JSON.stringify(schema).match(/"name":"(style|layout)"/g) || [];
  for (const [style, expectLayout] of [[undefined, true], ["default", true], ["paper", false], ["eink", false]]) {
    const ed = new Editor();
    ed.hass = hassFor("en", false);
    ed.setConfig({ type: "custom:claude-usage-card", ...(style ? { style } : {}) });
    const names = fieldNames(ed.child.schema);
    assert.strictEqual(names.includes('"name":"layout"'), expectLayout, `editor layout field for ${style}`);
  }

  console.log(`render tests passed (${cases.length * 2} renders)`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
