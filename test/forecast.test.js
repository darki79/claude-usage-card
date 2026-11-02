// Checks the forecast math of the card in Node with minimal browser stubs.
// Run: node test/forecast.test.js
const assert = require("node:assert");

const defined = {};
global.HTMLElement = class {
  attachShadow() {
    this.shadowRoot = { addEventListener() {} };
  }
};
global.customElements = { get: (tag) => defined[tag], define: (tag, cls) => (defined[tag] = cls) };
global.window = {};
global.document = {};
console.info = () => {};
require("../dist/claude-usage-card.js");

const HOUR = 3600e3;
const S = { fc_hit: "hit {t}", fc_ok: "ok", fc_reached: "reached" };
const card = new defined["claude-usage-card"]();
card.setConfig({});
card._hass = { states: {}, locale: { language: "en" }, config: { time_zone: "UTC" } };

// kind, percent now, hours until reset, history points [hours ago, percent]
const forecast = (kind, value, resetInH, points) => {
  const now = Date.now();
  card._hist = { s: points.map(([ago, v]) => ({ t: now - ago * HOUR, v })) };
  const windowMs = kind === "session" ? 5 * HOUR : 7 * 24 * HOUR;
  const resetsAt = new Date(now + resetInH * HOUR).toISOString();
  return card._forecast({ id: "s", kind, value, resetsAt, windowMs }, S);
};

// 40 % within the last hour, 3 h left: limit is hit before the reset
let fc = forecast("session", 40, 3, [[2, 0], [0.5, 30]]);
assert.ok(fc.warn && fc.text.startsWith("hit"), JSON.stringify(fc));

// 10 % within the last hour, 3 h left: lasts until the reset
assert.deepStrictEqual(forecast("session", 10, 3, [[2, 0]]), { text: "ok", warn: false });

// no increase within the last hour
assert.deepStrictEqual(forecast("session", 20, 2, [[3, 20]]), { text: "ok", warn: false });

// weekly reset 2 h ago: the 80 % from before the reset must not count, 5 % in 2 h is too fast
fc = forecast("weekly_all", 5, 7 * 24 - 2, [[24, 80], [2, 0]]);
assert.ok(fc.warn && fc.text.startsWith("hit"), JSON.stringify(fc));

// limit used up
assert.deepStrictEqual(forecast("session", 100, 1, []), { text: "reached", warn: true });

console.log("forecast tests passed");
