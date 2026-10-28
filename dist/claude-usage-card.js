/*
 * Claude Usage Card
 * Custom Lovelace card for the "Claude Usage" integration
 * (https://github.com/trickv/hass-claude-usage).
 * Reads the integration's sensors only; it never calls any external API.
 * License: MIT
 */
(() => {
  const CARD_VERSION = "1.0.0";
  const CARD_TAG = "claude-usage-card";
  const EDITOR_TAG = "claude-usage-card-editor";
  const INTEGRATION_DOMAIN = "hass_claude_usage";
  const STYLES = ["default", "minimal", "terminal", "retro", "synthwave"];

  const DEFAULTS = {
    title: "",
    show_title: true,
    style: "default", // default | minimal | terminal | retro | synthwave
    layout: "bars", // bars | columns | rings (style "default" only)
    show_logo: true,
    icon: "mdi:creation",
    logo_url: "",
    logo_color: "#d97757",
    logo_size: 28,
    entities: [],
    exclude: [],
    filter: "",
    names: {},
    color_mode: "threshold", // threshold | severity
    warning_threshold: 60,
    critical_threshold: 85,
    color_ok: "var(--success-color, #43a047)",
    color_warning: "var(--warning-color, #ffa000)",
    color_critical: "var(--error-color, #db4437)",
    status_colors: false, // skins: use threshold/severity colors instead of the skin palette
    font: "auto", // skins: auto | pixel | classic | theme | monospace | custom
    font_custom: "", // skins: CSS font-family when font = custom
    color_values: true, // color the percentage text like the bar
    show_reset: true,
    reset_display: "both", // relative | absolute | both
    show_extra_usage: true,
    show_api_error: true,
    show_pace: true, // marker for even usage across the period
    show_forecast: true, // projected time the limit is reached (needs history)
    show_history: false, // sparkline of the last hours (needs history)
    history_hours: 6,
    stale_minutes: 30, // hint when data is older than this (0 = off)
    tap_action: { action: "more-info" },
    hold_action: { action: "none" },
    double_tap_action: { action: "none" },
  };

  // VT323 (SIL Open Font License 1.1, (c) The VT323 Project Authors), subset to the glyphs the card uses.
  const FONT_FAMILY = "ClaudeUsageVT323";
  const FONT_WOFF2 = "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";
  const ensureFont = () => {
    if (!FONT_WOFF2 || document.getElementById("claude-usage-card-font")) return;
    const st = document.createElement("style");
    st.id = "claude-usage-card-font";
    st.textContent = `@font-face{font-family:"${FONT_FAMILY}";src:url(data:font/woff2;base64,${FONT_WOFF2}) format("woff2");font-display:swap;}`;
    (document.head || document.documentElement).appendChild(st);
  };

  const COLOR_KEYS = ["logo_color", "color_ok", "color_warning", "color_critical"];
  const toCss = (v) => (Array.isArray(v) && v.length === 3 ? `rgb(${v.map((n) => Math.round(n)).join(",")})` : v);
  const hexToRgb = (v) => {
    const m = typeof v === "string" && v.trim().match(/^#([0-9a-f]{6})$/i);
    if (!m) return undefined;
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  const HOUR = 3600e3;
  const WINDOWS = { session: 5 * HOUR, weekly: 7 * 24 * HOUR };
  const windowOf = (kind) =>
    kind === "session" ? WINDOWS.session : String(kind || "").startsWith("weekly") ? WINDOWS.weekly : null;
  const LOOKBACK = { session: HOUR, weekly: 24 * HOUR };

  const STRINGS = {
    en: {
      title: "Claude Usage",
      skin_title: "Claude",
      usage_word: "Usage",
      session: "Session (5 h)",
      weekly_all: "Week · all models",
      week: "Week",
      s_session: "Session",
      s_weekly: "Weekly",
      used: "used",
      resets_in: "Reset in {t}",
      resets_in_short: "Resets in {t}",
      resets_now: "Resetting now",
      unavailable: "unavailable",
      no_sensors:
        "No Claude Usage sensors found. Install the Claude Usage integration or select sensors in the card editor.",
      extra_usage: "Extra usage",
      credits: "{used} of {limit} credits",
      api_error: "API error ({v})",
      fc_hit: "Limit hit {t}",
      fc_ok: "Lasts until reset",
      fc_reached: "Limit used up",
      pace_title: "{p}% of the period has passed",
      stale: "Last update {t} ago",
      d: "d",
      h: "h",
      min: "min",
      ed: {
        title: "Title",
        show_title: "Show title",
        style: "Style",
        style_default: "Default (theme)",
        style_minimal: "Minimal (compact)",
        style_terminal: "Terminal",
        style_retro: "Retro window",
        style_synthwave: "Synthwave",
        layout: "Layout (default style)",
        layout_bars: "Bars stacked",
        layout_columns: "Bars side by side",
        layout_rings: "Rings",
        color_mode: "Colors",
        color_threshold: "By thresholds",
        color_severity: "By severity from the API",
        logo: "Logo and title",
        show_logo: "Show logo",
        icon: "Icon",
        logo_url: "Image URL (overrides icon, e.g. /local/logo.svg)",
        logo_color: "Icon color",
        logo_size: "Logo size (px)",
        sensors: "Sensors",
        entities: "Sensors (empty = detect automatically)",
        filter: "Auto-detect filter (part of entity ID)",
        display: "Display",
        color_values: "Color percentages",
        show_reset: "Show reset time",
        reset_display: "Reset format",
        reset_relative: "Countdown",
        reset_absolute: "Date and time",
        reset_both: "Both",
        show_extra_usage: "Show extra usage",
        show_api_error: "Show API errors",
        warning_threshold: "Warning from (%)",
        critical_threshold: "Critical from (%)",
        status_colors: "Status colors instead of skin colors",
        skin: "Skin (terminal, retro, synthwave)",
        font: "Font",
        font_auto: "Matching the skin",
        font_pixel: "Pixel (built in)",
        font_classic: "Classic",
        font_theme: "Theme font",
        font_monospace: "Monospace",
        font_custom_opt: "Custom",
        font_custom: "Custom font (CSS font-family)",
        analysis: "Pace, forecast and history",
        show_pace: "Pace marker",
        show_forecast: "Forecast",
        show_history: "Mini history",
        history_hours: "History (hours)",
        stale_minutes: "Old data hint after (min, 0 = off)",
        colors: "Colors",
        color_ok: "Color OK",
        color_warning: "Color warning",
        color_critical: "Color critical",
        names: "Names",
        actions: "Actions",
        tap_action: "Tap action",
        hold_action: "Hold action",
        double_tap_action: "Double tap action",
      },
    },
    de: {
      title: "Claude Nutzung",
      skin_title: "Claude",
      usage_word: "Nutzung",
      session: "Session (5 h)",
      weekly_all: "Woche · alle Modelle",
      week: "Woche",
      s_session: "Session",
      s_weekly: "Woche",
      used: "genutzt",
      resets_in: "Reset in {t}",
      resets_in_short: "Reset in {t}",
      resets_now: "Reset läuft",
      unavailable: "nicht verfügbar",
      no_sensors:
        "Keine Claude-Usage-Sensoren gefunden. Installiere die Integration Claude Usage oder wähle Sensoren im Karteneditor.",
      extra_usage: "Extra Usage",
      credits: "{used} von {limit} Credits",
      api_error: "API-Fehler ({v})",
      fc_hit: "Limit erreicht {t}",
      fc_ok: "Reicht bis zum Reset",
      fc_reached: "Limit ausgeschöpft",
      pace_title: "{p} % des Zeitraums sind vergangen",
      stale: "Stand vor {t}",
      d: "T",
      h: "Std",
      min: "Min",
      ed: {
        title: "Titel",
        show_title: "Titel anzeigen",
        style: "Stil",
        style_default: "Standard (Theme)",
        style_minimal: "Minimal (kompakt)",
        style_terminal: "Terminal",
        style_retro: "Retro-Fenster",
        style_synthwave: "Synthwave",
        layout: "Darstellung (Stil Standard)",
        layout_bars: "Balken untereinander",
        layout_columns: "Balken nebeneinander",
        layout_rings: "Ringe",
        color_mode: "Farben",
        color_threshold: "Nach Schwellwerten",
        color_severity: "Nach Schweregrad der API",
        logo: "Logo und Titel",
        show_logo: "Logo anzeigen",
        icon: "Icon",
        logo_url: "Bild-URL (ersetzt das Icon, z. B. /local/logo.svg)",
        logo_color: "Icon-Farbe",
        logo_size: "Logogröße (px)",
        sensors: "Sensoren",
        entities: "Sensoren (leer = automatisch erkennen)",
        filter: "Filter für Auto-Erkennung (Teil der Entity-ID)",
        display: "Anzeige",
        color_values: "Prozentwerte einfärben",
        show_reset: "Reset-Zeit anzeigen",
        reset_display: "Reset-Format",
        reset_relative: "Countdown",
        reset_absolute: "Datum und Uhrzeit",
        reset_both: "Beides",
        show_extra_usage: "Extra Usage anzeigen",
        show_api_error: "API-Fehler anzeigen",
        warning_threshold: "Warnung ab (%)",
        critical_threshold: "Kritisch ab (%)",
        status_colors: "Statusfarben statt Skin-Farben",
        skin: "Skin (Terminal, Retro, Synthwave)",
        font: "Schriftart",
        font_auto: "Passend zum Skin",
        font_pixel: "Pixel (eingebaut)",
        font_classic: "Klassisch",
        font_theme: "Theme-Schrift",
        font_monospace: "Monospace",
        font_custom_opt: "Eigene",
        font_custom: "Eigene Schrift (CSS font-family)",
        analysis: "Tempo, Prognose und Verlauf",
        show_pace: "Tempo-Markierung",
        show_forecast: "Prognose",
        show_history: "Mini-Verlauf",
        history_hours: "Verlauf (Stunden)",
        stale_minutes: "Hinweis auf alte Daten ab (Min, 0 = aus)",
        colors: "Farben",
        color_ok: "Farbe OK",
        color_warning: "Farbe Warnung",
        color_critical: "Farbe kritisch",
        names: "Namen",
        actions: "Aktionen",
        tap_action: "Aktion bei Tippen",
        hold_action: "Aktion bei Halten",
        double_tap_action: "Aktion bei Doppeltippen",
      },
    },
  };

  const FONT_MODES = ["auto", "pixel", "classic", "theme", "monospace", "custom"];
  const CLASSIC_FONTS = {
    terminal: "'Courier New', ui-monospace, monospace",
    retro: "'W95FA', 'MS Sans Serif', 'Microsoft Sans Serif', Tahoma, Verdana, sans-serif",
    synthwave: "'Courier New', ui-monospace, monospace",
  };
  // Returns { family, pixel } for a skin; older configs may hold a CSS family directly in `font`.
  const resolveFont = (c) => {
    let mode = c.font || "auto";
    let custom = c.font_custom;
    if (!FONT_MODES.includes(mode)) {
      custom = mode;
      mode = "custom";
    }
    if (mode === "auto") mode = c.style === "retro" ? "classic" : "pixel";
    if (mode === "pixel") return { family: `'${FONT_FAMILY}', 'VT323', ui-monospace, monospace`, pixel: true };
    if (mode === "theme") return { family: "inherit", pixel: false };
    if (mode === "monospace")
      return { family: "ui-monospace, 'SF Mono', Menlo, Consolas, 'Courier New', monospace", pixel: false };
    if (mode === "custom" && custom) return { family: custom, pixel: false };
    return { family: CLASSIC_FONTS[c.style] || "inherit", pixel: false };
  };
  const SYNTH_COLORS = ["#ff6ec7", "#4cc9f0", "#f9c80e", "#b388ff"];
  const TERMINAL_COLOR = "#e8875a";
  const RETRO_COLOR = "#18b818";

  const langOf = (hass) =>
    ((hass && ((hass.locale && hass.locale.language) || hass.language)) || "en").split("-")[0];
  const strings = (hass) => STRINGS[langOf(hass)] || STRINGS.en;
  const fmt = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : ""));
  const esc = (v) =>
    String(v == null ? "" : v).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  const BAD = ["unavailable", "unknown", "", null, undefined];
  const num = (s) => {
    if (!s || BAD.includes(s.state)) return null;
    const n = parseFloat(s.state);
    return Number.isFinite(n) ? n : null;
  };
  const truthy = (s) => !!s && ["true", "on", "1"].includes(String(s.state).toLowerCase());
  const clampPct = (v) => (v == null ? 0 : Math.min(100, Math.max(0, v)));
  const pctText = (v) => (v == null ? "–" : `${Math.round(v)}%`);

  const isLimitSensor = (id, st) =>
    id.startsWith("sensor.") &&
    !!st &&
    !!st.attributes &&
    "kind" in st.attributes &&
    "resets_at" in st.attributes &&
    st.attributes.unit_of_measurement === "%";

  const kindOrder = (k) => (k === "session" ? 0 : k === "weekly_all" ? 1 : 2);

  const commonPrefix = (ids) => {
    if (!ids.length) return "";
    if (ids.length === 1) {
      const m = ids[0].match(/^(sensor\..*?_)(session|weekly|extra)/);
      return m ? m[1] : "";
    }
    let p = ids[0];
    for (const id of ids) {
      let i = 0;
      while (i < p.length && p[i] === id[i]) i++;
      p = p.slice(0, i);
    }
    return p.slice(0, p.lastIndexOf("_") + 1);
  };

  const cleanName = (friendly) =>
    String(friendly || "")
      .replace(/^Claude Usage\s*\([^)]*\)\s*/i, "")
      .replace(/^Claude Usage\s*/i, "")
      .replace(/\s*Limit Usage$/i, "")
      .replace(/\s*Usage$/i, "")
      .trim();

  const autoLabel = (id, st, S) => {
    if (!st) return id;
    const a = st.attributes;
    if (a.kind === "session") return S.session;
    if (a.kind === "weekly_all") return S.weekly_all;
    if (a.model && String(a.kind || "").startsWith("weekly")) return `${S.week} · ${a.model}`;
    return cleanName(a.friendly_name) || id;
  };

  const detectIds = (hass, c) => {
    if (!hass) return [];
    let ids;
    if (c.entities && c.entities.length) {
      ids = c.entities.map((e) => (typeof e === "string" ? e : e && e.entity)).filter(Boolean);
    } else {
      ids = Object.keys(hass.states).filter(
        (id) => isLimitSensor(id, hass.states[id]) && (!c.filter || id.includes(c.filter))
      );
      ids.sort((a, b) => {
        const ka = kindOrder(hass.states[a].attributes.kind);
        const kb = kindOrder(hass.states[b].attributes.kind);
        return ka !== kb ? ka - kb : a.localeCompare(b);
      });
    }
    const excl = c.exclude || [];
    return ids.filter((id) => !excl.includes(id));
  };

  class ClaudeUsageCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this._sig = "";
      const root = this.shadowRoot;
      root.addEventListener("pointerdown", (ev) => this._onDown(ev));
      root.addEventListener("pointerup", (ev) => {
        this._onUp(ev);
        this._release();
      });
      root.addEventListener("pointercancel", () => {
        clearTimeout(this._holdT);
        this._release();
      });
      root.addEventListener("pointerleave", () => clearTimeout(this._holdT));
      root.addEventListener("contextmenu", (ev) => {
        if (this._hasAction("hold_action")) ev.preventDefault();
      });
      root.addEventListener("keydown", (ev) => {
        if (ev.key !== "Enter" && ev.key !== " ") return;
        const id = this._targetId(ev);
        if (id) {
          ev.preventDefault();
          this._fire(id, "tap");
        }
      });
    }

    static getConfigElement() {
      return document.createElement(EDITOR_TAG);
    }

    static getStubConfig() {
      return { style: "default" };
    }

    setConfig(config) {
      if (!config || typeof config !== "object") throw new Error("Invalid configuration");
      if (config.layout && !["bars", "columns", "rings"].includes(config.layout))
        throw new Error("layout must be 'bars', 'columns' or 'rings'");
      if (config.style && !STYLES.includes(config.style))
        throw new Error(`style must be one of: ${STYLES.join(", ")}`);
      if (config.entities && !Array.isArray(config.entities))
        throw new Error("entities must be a list");
      this._config = { ...DEFAULTS, ...config };
      this._sig = "";
      this._html = "";
      this._render();
    }

    set hass(hass) {
      this._hass = hass;
      const sig = this._signature();
      if (sig !== this._sig) {
        const first = !this._sig;
        this._sig = sig;
        this._render();
        this._fetchHistory(!first);
      }
    }

    connectedCallback() {
      clearInterval(this._timer);
      this._timer = setInterval(() => {
        this._render();
        this._fetchHistory(false);
      }, 30000);
    }

    // ------------------------------------------------------------ history

    _needsHistory() {
      const c = this._config;
      return !!(c && (c.show_forecast || c.show_history));
    }

    async _fetchHistory(force) {
      if (!this._needsHistory() || !this._hass || typeof this._hass.callWS !== "function") return;
      const now = Date.now();
      if (this._histLoading) return;
      if (!force && this._histAt && now - this._histAt < 10 * 60e3) return;
      if (force && this._histAt && now - this._histAt < 60e3) return;
      const ids = this._limitIds();
      if (!ids.length) return;
      const c = this._config;
      let start = now - Math.max(1, Number(c.history_hours) || 6) * HOUR;
      if (c.show_forecast) {
        for (const id of ids) {
          const st = this._hass.states[id];
          const lb = st && LOOKBACK[st.attributes.kind === "session" ? "session" : "weekly"];
          if (lb) start = Math.min(start, now - lb);
        }
      }
      this._histLoading = true;
      try {
        const res = await this._hass.callWS({
          type: "history/history_during_period",
          start_time: new Date(start).toISOString(),
          end_time: new Date(now).toISOString(),
          entity_ids: ids,
          minimal_response: true,
          no_attributes: true,
          significant_changes_only: false,
        });
        const hist = {};
        for (const id of ids) {
          hist[id] = ((res && res[id]) || [])
            .map((e) => ({ t: (e.lu != null ? e.lu : e.lc) * 1000, v: parseFloat(e.s) }))
            .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v))
            .sort((a, b) => a.t - b.t);
        }
        this._hist = hist;
        this._histAt = Date.now();
      } catch (e) {
        this._histAt = Date.now();
      } finally {
        this._histLoading = false;
        this._render();
      }
    }

    _valueAt(series, t) {
      let v = null;
      for (const p of series) {
        if (p.t <= t) v = p.v;
        else break;
      }
      return v;
    }

    _forecast(it, S) {
      if (!this._config.show_forecast || it.value == null || !it.resetsAt || !it.windowMs) return null;
      if (it.value >= 100) return { text: S.fc_reached, warn: true };
      const series = this._hist && this._hist[it.id];
      if (!series) return null;
      const now = Date.now();
      const reset = new Date(it.resetsAt).getTime();
      const periodStart = reset - it.windowMs;
      const lookback = it.kind === "session" ? LOOKBACK.session : LOOKBACK.weekly;
      const start = Math.max(periodStart, now - lookback);
      let v0 = start === periodStart ? 0 : this._valueAt(series, start);
      if (v0 == null) v0 = series.length ? series[0].v : null;
      if (v0 == null || v0 > it.value) v0 = start > periodStart ? null : 0;
      if (v0 == null) return null;
      const rate = (it.value - v0) / Math.max(1, now - start); // percent per ms
      if (rate <= 0) return { text: S.fc_ok, warn: false };
      const hit = now + (100 - it.value) / rate;
      if (hit >= reset) return { text: S.fc_ok, warn: false };
      return { text: fmt(S.fc_hit, { t: this._fmtAbs(new Date(hit)) }), warn: true };
    }

    _spark(it, color) {
      if (!this._config.show_history || !this._hist || !this._hist[it.id]) return "";
      const now = Date.now();
      const span = Math.max(1, Number(this._config.history_hours) || 6) * HOUR;
      const start = now - span;
      const series = this._hist[it.id];
      const startV = this._valueAt(series, start);
      const pts = [];
      if (startV != null) pts.push({ t: start, v: startV });
      for (const p of series) if (p.t > start) pts.push(p);
      if (it.value != null) pts.push({ t: now, v: it.value });
      if (pts.length < 2) return "";
      const maxV = Math.max(20, ...pts.map((p) => p.v));
      const x = (t) => (((t - start) / span) * 100).toFixed(2);
      const y = (v) => (24 - (v / maxV) * 22).toFixed(2);
      let d = `M${x(pts[0].t)},${y(pts[0].v)}`;
      for (let i = 1; i < pts.length; i++) d += ` H${x(pts[i].t)} V${y(pts[i].v)}`;
      const area = `${d} V24 H${x(pts[0].t)} Z`;
      return `<svg class="spark" viewBox="0 0 100 24" preserveAspectRatio="none" aria-hidden="true">
          <path d="${area}" style="fill:${esc(color)};opacity:.18"></path>
          <path d="${d}" style="stroke:${esc(color)}" class="spark-line"></path>
        </svg>`;
    }

    _paceMarker(it, cls) {
      if (!this._config.show_pace || it.pace == null) return "";
      return `<div class="${cls || "pace"}" style="left:${it.pace.toFixed(2)}%" title="${esc(
        fmt(strings(this._hass).pace_title, { p: Math.round(it.pace) })
      )}"></div>`;
    }

    _fcHtml(it, cls) {
      if (!it.forecast) return "";
      return `<div class="${cls}${it.forecast.warn ? " fc-warn" : ""}">${esc(it.forecast.text)}</div>`;
    }

    _fmtAbs(t) {
      const lang = langOf(this._hass);
      const tz = this._hass && this._hass.config && this._hass.config.time_zone;
      const opts = { weekday: "short", hour: "2-digit", minute: "2-digit" };
      try {
        return t.toLocaleString(lang, tz ? { ...opts, timeZone: tz } : opts);
      } catch (e) {
        return t.toLocaleString(lang, opts);
      }
    }

    disconnectedCallback() {
      clearInterval(this._timer);
    }

    getCardSize() {
      const n = this._itemsCount || 2;
      const c = this._config || {};
      if (c.style === "minimal") return 1 + Math.ceil(n / 2);
      if (c.style && c.style !== "default") return 5;
      return c.layout === "rings" ? 3 : 1 + n;
    }

    getGridOptions() {
      return { columns: 12, min_columns: 6 };
    }

    // ------------------------------------------------------------ data

    _limitIds() {
      return detectIds(this._hass, this._config);
    }

    _extraIds(prefix) {
      return {
        enabled: `${prefix}extra_usage_enabled`,
        usage: `${prefix}extra_usage`,
        credits: `${prefix}extra_usage_credits`,
        limit: `${prefix}extra_usage_limit`,
        error: `${prefix}api_error`,
      };
    }

    // Groups the limit sensors by account (device, else entity ID prefix) and
    // finds each account's extra usage and API error sensors.
    _accounts(ids) {
      const ents = (this._hass && this._hass.entities) || {};
      const devs = (this._hass && this._hass.devices) || {};
      const groups = new Map();
      for (const id of ids) {
        const dev = ents[id] && ents[id].device_id;
        const m = id.match(/^(sensor\..*?_)(session|weekly)/);
        const key = dev || (m ? m[1] : "");
        if (!groups.has(key)) groups.set(key, { device: dev, prefix: m ? m[1] : null, ids: [] });
        groups.get(key).ids.push(id);
      }
      return [...groups.values()].map((g) => {
        const prefix = g.prefix || commonPrefix(g.ids);
        let ex = this._extraIds(prefix);
        if (g.device && !this._hass.states[ex.enabled]) {
          const same = Object.keys(ents).filter((e) => ents[e].device_id === g.device);
          const find = (suf) => same.find((e) => e.endsWith(suf));
          const byDev = {
            enabled: find("_extra_usage_enabled"),
            usage: find("_extra_usage"),
            credits: find("_extra_usage_credits"),
            limit: find("_extra_usage_limit"),
            error: find("_api_error"),
          };
          ex = Object.fromEntries(Object.entries(ex).map(([k, v]) => [k, byDev[k] || v]));
        }
        const d = g.device && devs[g.device];
        const dn = d ? d.name_by_user || d.name || "" : "";
        const pm = dn.match(/\(([^)]+)\)/);
        return { ex, ids: g.ids, name: pm ? pm[1] : cleanName(dn) || dn };
      });
    }

    _signature() {
      if (!this._hass || !this._config) return "";
      const ids = this._limitIds();
      const ex = this._accounts(ids).flatMap((a) => Object.values(a.ex));
      return (
        [...ids, ...ex]
          .map((id) => {
            const s = this._hass.states[id];
            return s
              ? `${id}=${s.state}|${s.attributes.resets_at || ""}|${s.attributes.severity || ""}`
              : id;
          })
          .join(";") + `|${langOf(this._hass)}`
      );
    }

    _customName(id) {
      const c = this._config;
      if (c.names && c.names[id]) return c.names[id];
      const obj = (c.entities || []).find(
        (e) => e && typeof e === "object" && e.entity === id && e.name
      );
      return obj ? obj.name : null;
    }

    _label(id, st, S) {
      return this._customName(id) || autoLabel(id, st, S);
    }

    _shortLabel(id, st, S) {
      const custom = this._customName(id);
      if (custom) return custom;
      if (!st) return id;
      const a = st.attributes;
      if (a.kind === "session") return S.s_session;
      if (a.kind === "weekly_all") return S.s_weekly;
      if (a.model) return String(a.model);
      return cleanName(a.friendly_name) || id;
    }

    _color(value, severity) {
      const c = this._config;
      if (value == null) return "var(--disabled-text-color, #9e9e9e)";
      if (c.color_mode === "severity" && severity) {
        const s = String(severity).toLowerCase();
        if (/(crit|exceed|block|error|limit)/.test(s)) return toCss(c.color_critical);
        if (/(warn|high|elevated)/.test(s)) return toCss(c.color_warning);
        return toCss(c.color_ok);
      }
      if (value >= c.critical_threshold) return toCss(c.color_critical);
      if (value >= c.warning_threshold) return toCss(c.color_warning);
      return toCss(c.color_ok);
    }

    _duration(ms, S) {
      const totalMin = Math.max(0, Math.round(ms / 60000));
      const d = Math.floor(totalMin / 1440);
      const h = Math.floor((totalMin % 1440) / 60);
      const m = totalMin % 60;
      if (d > 0) return `${d} ${S.d} ${h} ${S.h}`;
      if (h > 0) return `${h} ${S.h} ${m} ${S.min}`;
      return `${m} ${S.min}`;
    }

    _compactDuration(ms) {
      const totalMin = Math.max(0, Math.round(ms / 60000));
      const d = Math.floor(totalMin / 1440);
      const h = Math.floor((totalMin % 1440) / 60);
      const m = totalMin % 60;
      if (d > 0) return `${d}d ${h}h`;
      return `${h}h ${m}m`;
    }

    _resetText(resetsAt, S) {
      return this._resetParts(resetsAt, S).join(" · ");
    }

    _resetParts(resetsAt, S) {
      if (!resetsAt) return [];
      const t = new Date(resetsAt);
      if (isNaN(t.getTime())) return [];
      const diff = t.getTime() - Date.now();
      const lang = langOf(this._hass);
      const tz = this._hass && this._hass.config && this._hass.config.time_zone;
      const opts = { weekday: "short", hour: "2-digit", minute: "2-digit" };
      let abs;
      try {
        abs = t.toLocaleString(lang, tz ? { ...opts, timeZone: tz } : opts);
      } catch (e) {
        abs = t.toLocaleString(lang, opts);
      }
      const rel = diff <= 0 ? S.resets_now : fmt(S.resets_in, { t: this._duration(diff, S) });
      const mode = this._config.reset_display;
      if (mode === "absolute") return [abs];
      if (mode === "relative" || diff <= 0) return [rel];
      return [rel, abs];
    }

    _shortReset(resetsAt, S) {
      if (!resetsAt) return "";
      const t = new Date(resetsAt);
      if (isNaN(t.getTime())) return "";
      const diff = t.getTime() - Date.now();
      return diff <= 0 ? S.resets_now : fmt(S.resets_in_short, { t: this._compactDuration(diff) });
    }

    _items() {
      const S = strings(this._hass);
      return this._limitIds().map((id) => {
        const st = this._hass.states[id];
        const value = num(st);
        const resetsAt = st ? st.attributes.resets_at : null;
        const kind = st ? st.attributes.kind : null;
        const windowMs = windowOf(kind);
        let pace = null;
        if (windowMs && resetsAt) {
          const left = new Date(resetsAt).getTime() - Date.now();
          if (Number.isFinite(left)) pace = Math.min(100, Math.max(0, (1 - left / windowMs) * 100));
        }
        const it = {
          id,
          kind,
          windowMs,
          pace,
          name: this._label(id, st, S),
          short: this._shortLabel(id, st, S),
          value,
          color: this._color(value, st && st.attributes.severity),
          resetsAt,
          reset: this._resetText(resetsAt, S),
          resetParts: this._resetParts(resetsAt, S),
        };
        it.forecast = this._forecast(it, S);
        return it;
      });
    }

    _extraItem(acc, S, multi) {
      const c = this._config;
      const st = this._hass.states;
      const ex = acc.ex;
      if (!c.show_extra_usage || !truthy(st[ex.enabled])) return null;
      const label = multi && acc.name ? `${S.extra_usage} · ${acc.name}` : S.extra_usage;
      const lang = langOf(this._hass);
      const value = num(st[ex.usage]);
      const used = num(st[ex.credits]);
      const limit = num(st[ex.limit]);
      const item = {
        id: ex.usage,
        name: label,
        short: label,
        value,
        color: this._color(value, null),
        resetsAt: null,
        reset:
          used != null && limit != null
            ? fmt(S.credits, { used: used.toLocaleString(lang), limit: limit.toLocaleString(lang) })
            : "",
      };
      item.resetParts = item.reset ? [item.reset] : [];
      return item;
    }

    _apiError(acc, multi) {
      const c = this._config;
      const err = this._hass.states[acc.ex.error];
      if (!c.show_api_error || !err || BAD.includes(err.state) || parseFloat(err.state) === 0)
        return null;
      return { id: acc.ex.error, value: multi && acc.name ? `${err.state}, ${acc.name}` : err.state };
    }

    // ------------------------------------------------------------ shared bits

    _logo(defaultColor) {
      const c = this._config;
      if (!c.show_logo) return "";
      const size = Number(c.logo_size) || 28;
      if (c.logo_url) {
        return `<img class="logo" src="${esc(c.logo_url)}" alt="" style="width:${size}px;height:${size}px">`;
      }
      const color = toCss(defaultColor && !("logo_color" in this._rawConfig()) ? defaultColor : c.logo_color);
      return `<ha-icon class="logo" icon="${esc(c.icon || DEFAULTS.icon)}" style="color:${esc(
        color
      )};--mdc-icon-size:${size}px;width:${size}px;height:${size}px"></ha-icon>`;
    }

    _rawConfig() {
      return this._userConfig || {};
    }

    _staleHtml(S, cls) {
      const c = this._config;
      const limit = Number(c.stale_minutes) || 0;
      if (!limit || !this._hass) return "";
      let newest = 0;
      for (const id of this._limitIds()) {
        const st = this._hass.states[id];
        if (!st || BAD.includes(st.state)) continue;
        const t = new Date(st.last_updated || st.last_changed).getTime();
        if (Number.isFinite(t)) newest = Math.max(newest, t);
      }
      if (!newest) return "";
      const age = Date.now() - newest;
      if (age < limit * 60e3) return "";
      return `<div class="${cls}" title="${esc(this._fmtAbs(new Date(newest)))}"><ha-icon icon="mdi:clock-alert-outline"></ha-icon><span>${esc(
        fmt(S.stale, { t: this._duration(age, S) })
      )}</span></div>`;
    }

    _errorHtml(err, S, cls) {
      if (Array.isArray(err)) return err.map((e) => this._errorHtml(e, S, cls)).join("");
      if (!err) return "";
      return `<div class="${cls}" data-entity="${esc(err.id)}"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><span>${esc(
        fmt(S.api_error, { v: err.value })
      )}</span></div>`;
    }

    // ------------------------------------------------------------ default style

    _bar(it, S) {
      const pct = clampPct(it.value);
      const txt = it.value == null ? esc(S.unavailable) : `${Math.round(it.value)}&nbsp;%`;
      return `
        <div class="row" data-entity="${esc(it.id)}" tabindex="0" role="button">
          <div class="row-head">
            <span class="name">${esc(it.name)}</span>
            <span class="pct" style="color:${esc(this._valueColor(it))}">${txt}</span>
          </div>
          <div class="bar"><div class="fill" style="width:${pct}%;background:${esc(it.color)}"></div>${this._paceMarker(it)}</div>
          ${this._spark(it, it.color)}
          ${this._config.show_reset && it.reset ? `<div class="sub">${esc(it.reset)}</div>` : ""}
          ${this._fcHtml(it, "fc")}
        </div>`;
    }

    _ring(it) {
      const r = 36;
      const circ = 2 * Math.PI * r;
      const dash = (clampPct(it.value) / 100) * circ;
      return `
        <div class="ring-item" data-entity="${esc(it.id)}" tabindex="0" role="button">
          <div class="ring">
            <svg viewBox="0 0 88 88" aria-hidden="true">
              <circle cx="44" cy="44" r="${r}" class="track"></circle>
              <circle cx="44" cy="44" r="${r}" class="arc"
                style="stroke:${esc(it.color)};stroke-dasharray:${dash.toFixed(2)} ${circ.toFixed(2)}"></circle>
              ${
                this._config.show_pace && it.pace != null
                  ? `<circle cx="44" cy="44" r="${r}" class="pace-tick"
                      style="stroke-dasharray:2 ${circ.toFixed(2)};stroke-dashoffset:${(-(it.pace / 100) * circ + 1).toFixed(2)}"></circle>`
                  : ""
              }
            </svg>
            <span class="ring-pct">${pctText(it.value)}</span>
          </div>
          <div class="ring-name">${esc(it.name)}</div>
          ${this._spark(it, it.color)}
          ${this._config.show_reset && it.reset ? `<div class="sub center">${esc(it.reset)}</div>` : ""}
          ${this._fcHtml(it, "fc center")}
        </div>`;
    }

    _col(it, S) {
      const txt = it.value == null ? esc(S.unavailable) : `${Math.round(it.value)}&nbsp;%`;
      let subs =
        this._config.show_reset && it.resetParts && it.resetParts.length
          ? it.resetParts.map((p) => `<span>${esc(p)}</span>`).join("")
          : "";
      subs = this._spark(it, it.color) + subs + this._fcHtml(it, "fc");
      return `
        <div class="col" data-entity="${esc(it.id)}" tabindex="0" role="button">
          <div class="col-name">${esc(it.name)}</div>
          <div class="col-pct" style="color:${esc(this._valueColor(it))}">${txt}</div>
          <div class="bar"><div class="fill" style="width:${clampPct(it.value)}%;background:${esc(it.color)}"></div>${this._paceMarker(it)}</div>
          <div class="col-sub">${subs}</div>
        </div>`;
    }

    _renderDefault(items, extra, err, S) {
      const c = this._config;
      const title = c.title || S.title;
      const header =
        c.show_title || c.show_logo
          ? `<div class="header">${this._logo()}${
              c.show_title ? `<span class="title">${esc(title)}</span>` : ""
            }</div>`
          : "";
      let body;
      if (!items.length) body = `<div class="empty">${esc(S.no_sensors)}</div>`;
      else if (c.layout === "rings")
        body = `<div class="rings">${items.map((it) => this._ring(it)).join("")}</div>`;
      else if (c.layout === "columns") {
        const all = [...items, ...extra];
        body = `<div class="cols">${all.map((it) => this._col(it, S)).join("")}</div>`;
      } else body = `<div class="bars">${items.map((it) => this._bar(it, S)).join("")}</div>`;
      const extras =
        (c.layout !== "columns" ? extra.map((x) => this._bar(x, S)).join("") : "") +
        this._staleHtml(S, "error stale") +
        this._errorHtml(err, S, "error");
      return `<ha-card class="default">${header}${body}${extras}</ha-card>`;
    }

    // ------------------------------------------------------------ skins

    _valueColor(it) {
      return this._config.color_values ? it.color : "var(--primary-text-color)";
    }

    _skinColor(it, palette, i) {
      if (this._config.status_colors) return it.color;
      return Array.isArray(palette) ? palette[i % palette.length] : palette;
    }

    _renderMinimal(items, extra, err, S) {
      const c = this._config;
      const all = [...items, ...extra];
      const header =
        c.show_title || c.show_logo
          ? `<div class="m-head">${this._logo()}${
              c.show_title ? `<span class="m-title">${esc(c.title || S.title)}</span>` : ""
            }</div>`
          : "";
      const rows = all
        .map((it) => {
          let reset = "";
          if (c.show_reset && it.resetsAt) {
            const left = new Date(it.resetsAt).getTime() - Date.now();
            reset = left > 0 ? this._compactDuration(left) : S.resets_now;
          }
          const warn =
            it.forecast && it.forecast.warn
              ? `<ha-icon class="m-warn" icon="mdi:alert-outline" title="${esc(it.forecast.text)}"></ha-icon>`
              : "";
          return `
          <div class="m-row" data-entity="${esc(it.id)}" tabindex="0" role="button">
            <span class="m-name" title="${esc(it.name)}">${esc(it.short)}</span>
            <div class="bar m-bar"><div class="fill" style="width:${clampPct(it.value)}%;background:${esc(it.color)}"></div>${this._paceMarker(it)}</div>
            <span class="m-pct" style="color:${esc(this._valueColor(it))}">${warn}${pctText(it.value)}</span>
            ${c.show_reset ? `<span class="m-reset" title="${esc(it.reset)}">${esc(reset)}</span>` : ""}
          </div>`;
        })
        .join("");
      const cols = c.show_reset ? "auto 1fr auto auto" : "auto 1fr auto";
      return `
        <ha-card class="minimal">
          ${header}
          ${
            all.length
              ? `<div class="m-grid" style="grid-template-columns:${cols}">${rows}</div>`
              : `<div class="empty">${esc(S.no_sensors)}</div>`
          }
          ${this._staleHtml(S, "error stale m-error")}
          ${this._errorHtml(err, S, "error m-error")}
        </ha-card>`;
    }

    _renderTerminal(items, extra, err, S) {
      const c = this._config;
      const all = [...items, ...extra];
      const title = c.title || S.skin_title;
      const cols = Math.min(2, Math.max(1, all.length));
      const cells = all
        .map((it, i) => {
          const col = this._skinColor(it, TERMINAL_COLOR, i);
          return `
          <div class="t-item" data-entity="${esc(it.id)}" tabindex="0" role="button" style="--c:${esc(col)}">
            <div class="t-label">${esc(it.short)}</div>
            <div class="t-val">${pctText(it.value)}</div>
            <div class="t-used">${esc(S.used)}</div>
            ${this._spark(it, col)}
            ${this._fcHtml(it, "t-fc")}
          </div>`;
        })
        .join("");
      const first = items.find((it) => it.resetsAt);
      const foot =
        c.show_reset && first
          ? `<div class="t-foot">${esc(this._shortReset(first.resetsAt, S))}<span class="t-cursor">_</span></div>`
          : "";
      return `
        <ha-card class="skin terminal">
          <div class="t-screen">
            ${c.show_title ? `<div class="t-title">${esc(title)}</div>` : ""}
            ${
              all.length
                ? `<div class="t-grid" style="grid-template-columns:repeat(${cols},1fr)">${cells}</div>`
                : `<div class="t-empty">${esc(S.no_sensors)}</div>`
            }
            ${c.show_logo ? `<div class="t-logo">${this._logo(TERMINAL_COLOR)}</div>` : ""}
            ${this._staleHtml(S, "t-error t-stale")}
            ${this._errorHtml(err, S, "t-error")}
            ${foot}
          </div>
        </ha-card>`;
    }

    _renderRetro(items, extra, err, S) {
      const c = this._config;
      const all = [...items, ...extra];
      const title = c.title || S.skin_title;
      const rows = all
        .map((it, i) => {
          const col = this._skinColor(it, RETRO_COLOR, i);
          return `
          <div class="w-row" data-entity="${esc(it.id)}" tabindex="0" role="button">
            <div class="w-label">${esc(it.short)} ${esc(S.used)}</div>
            <div class="w-line">
              <div class="w-track"><div class="w-fill" style="width:${clampPct(it.value)}%;--c:${esc(col)}"></div>${this._paceMarker(it, "pace w-pace")}</div>
              <span class="w-pct">${pctText(it.value)}</span>
            </div>
            ${this._spark(it, col)}
            ${c.show_reset && it.reset ? `<div class="w-sub">${esc(it.reset)}</div>` : ""}
            ${this._fcHtml(it, "w-sub w-fc")}
          </div>`;
        })
        .join("");
      return `
        <ha-card class="skin retro">
          <div class="w-frame">
            <div class="w-titlebar">
              <span class="w-title">${c.show_title ? esc(title) : ""}</span>
              <span class="w-btns"><i>_</i><i>□</i><i>×</i></span>
            </div>
            <div class="w-body">
              ${c.show_logo ? `<div class="w-logo">${this._logo("#808080")}</div><div class="w-sep"></div>` : ""}
              ${all.length ? rows : `<div class="w-sub">${esc(S.no_sensors)}</div>`}
              ${this._staleHtml(S, "w-error w-stale")}
              ${this._errorHtml(err, S, "w-error")}
            </div>
          </div>
        </ha-card>`;
    }

    _renderSynthwave(items, extra, err, S) {
      const c = this._config;
      const all = [...items, ...extra];
      const custom = !!c.title;
      const rows = all
        .map((it, i) => {
          const col = this._skinColor(it, SYNTH_COLORS, i);
          return `
          <div class="s-row" data-entity="${esc(it.id)}" tabindex="0" role="button" style="--c:${esc(col)}">
            <div class="s-label">${esc(it.short)} ${esc(S.used)}</div>
            <div class="s-line">
              <div class="s-track"><div class="s-fill" style="width:${clampPct(it.value)}%"></div>${this._paceMarker(it, "pace s-pace")}</div>
              <span class="s-pct">${pctText(it.value)}</span>
            </div>
            ${this._spark(it, col)}
            ${c.show_reset && it.resetsAt ? `<div class="s-sub">${esc(this._shortReset(it.resetsAt, S))}</div>` : ""}
            ${this._fcHtml(it, "s-sub s-fc")}
          </div>`;
        })
        .join("");
      const titleHtml = c.show_title
        ? `<div class="s-title">${
            custom ? esc(c.title) : `${esc(S.skin_title)}<br><span>${esc(S.usage_word)}</span>`
          }</div>`
        : "";
      return `
        <ha-card class="skin synth">
          <div class="s-sky">
            ${titleHtml}
            <div class="s-horizon">
              ${c.show_logo && (c.logo_url || "icon" in this._rawConfig()) ? `<div class="s-logo">${this._logo("#ff6ec7")}</div>` : `<div class="s-sun"></div>`}
              <div class="s-grid"></div>
            </div>
          </div>
          <div class="s-rows">${all.length ? rows : `<div class="s-sub">${esc(S.no_sensors)}</div>`}</div>
          ${this._staleHtml(S, "s-error s-stale")}
          ${this._errorHtml(err, S, "s-error")}
        </ha-card>`;
    }

    // ------------------------------------------------------------ render

    _render() {
      if (!this._config || !this._hass) return;
      const c = this._config;
      const S = strings(this._hass);
      const items = this._items();
      this._itemsCount = items.length;
      const accs = items.length ? this._accounts(items.map((i) => i.id)) : [];
      const multi = accs.length > 1;
      if (multi) {
        // same limits from several accounts: add the account to the automatic labels
        for (const a of accs) {
          if (!a.name) continue;
          for (const it of items) {
            if (!a.ids.includes(it.id) || this._customName(it.id)) continue;
            it.name = `${it.name} · ${a.name}`;
            it.short = `${it.short} · ${a.name}`;
          }
        }
      }
      const extra = accs.map((a) => this._extraItem(a, S, multi)).filter(Boolean);
      const err = accs.map((a) => this._apiError(a, multi)).filter(Boolean);

      let card;
      if (c.style === "minimal") card = this._renderMinimal(items, extra, err, S);
      else if (c.style === "terminal") card = this._renderTerminal(items, extra, err, S);
      else if (c.style === "retro") card = this._renderRetro(items, extra, err, S);
      else if (c.style === "synthwave") card = this._renderSynthwave(items, extra, err, S);
      else card = this._renderDefault(items, extra, err, S);

      const isSkin = ["terminal", "retro", "synthwave"].includes(c.style);
      const f = isSkin ? resolveFont(c) : { family: "inherit", pixel: false };
      if (f.pixel) ensureFont();
      const font = String(f.family).replace(/[;{}<>]/g, "");
      const vt = f.pixel;
      const html = `<style>${CSS}.skin{font-family:${font};}${
        vt ? ".skin{font-size:1.25em;}.t-title,.s-title{letter-spacing:.04em;}" : ""
      }</style>${card}`;
      if (html === this._html) return;
      // never swap the DOM under a finger or mouse button; catch up on release
      if (this._pressing) {
        this._pending = true;
        return;
      }
      const focused = this.shadowRoot.activeElement;
      const focusId = focused && focused.dataset ? focused.dataset.entity : null;
      this._html = html;
      this.shadowRoot.innerHTML = html;
      if (focusId) {
        const el = [...this.shadowRoot.querySelectorAll("[data-entity]")].find(
          (n) => n.dataset.entity === focusId
        );
        if (el) el.focus({ preventScroll: true });
      }
    }

    _release() {
      clearTimeout(this._pressT);
      this._pressing = false;
      if (this._pending) {
        this._pending = false;
        this._render();
      }
    }

    // ------------------------------------------------------------ actions

    _targetId(ev) {
      const el = ev.composedPath().find((n) => n.dataset && n.dataset.entity);
      return el ? el.dataset.entity : null;
    }

    _hasAction(key) {
      const a = this._config && this._config[key];
      return !!(a && a.action && a.action !== "none");
    }

    _onDown(ev) {
      const id = this._targetId(ev);
      if (!id) return;
      this._downId = id;
      this._held = false;
      this._pressing = true;
      clearTimeout(this._pressT);
      this._pressT = setTimeout(() => this._release(), 3000);
      clearTimeout(this._holdT);
      if (this._hasAction("hold_action")) {
        this._holdT = setTimeout(() => {
          this._held = true;
          this._fire(id, "hold");
        }, 500);
      }
    }

    _onUp(ev) {
      clearTimeout(this._holdT);
      const id = this._targetId(ev);
      if (!id || id !== this._downId || this._held) return;
      if (this._hasAction("double_tap_action")) {
        if (this._tapT && this._tapId === id) {
          clearTimeout(this._tapT);
          this._tapT = null;
          this._fire(id, "double_tap");
          return;
        }
        this._tapId = id;
        this._tapT = setTimeout(() => {
          this._tapT = null;
          this._fire(id, "tap");
        }, 250);
        return;
      }
      this._fire(id, "tap");
    }

    _fire(entity, action) {
      const c = this._config;
      const ev = new Event("hass-action", { bubbles: true, composed: true });
      ev.detail = {
        action,
        config: {
          entity,
          tap_action: c.tap_action,
          hold_action: c.hold_action,
          double_tap_action: c.double_tap_action,
        },
      };
      this.dispatchEvent(ev);
    }
  }

  // Remember which keys the user actually set (needed to know if a skin may
  // override the logo color with its own palette).
  const origSetConfig = ClaudeUsageCard.prototype.setConfig;
  ClaudeUsageCard.prototype.setConfig = function (config) {
    this._userConfig = config || {};
    return origSetConfig.call(this, config);
  };

  const CSS = `
    :host { display: block; }
    ha-card { display: block; box-sizing: border-box; height: 100%; overflow: hidden; }
    [data-entity] { cursor: pointer; }

    /* ---------- default ---------- */
    ha-card.default { padding: 16px; }
    .header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .logo { flex: 0 0 auto; display: inline-flex; object-fit: contain; }
    .title { font-size: 1.15em; font-weight: 500; color: var(--primary-text-color); }
    .bars { display: flex; flex-direction: column; gap: 14px; }
    .row-head { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; margin-bottom: 6px; }
    .name { color: var(--primary-text-color); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .pct { font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .bar { position: relative; height: 8px; border-radius: 4px; background: var(--divider-color, rgba(127,127,127,.25)); overflow: hidden; }
    .pace { position: absolute; top: 0; bottom: 0; width: 2px; margin-left: -1px; background: var(--primary-text-color, #fff);
      box-shadow: 0 0 0 1px rgba(0,0,0,.35); pointer-events: auto; }
    .ring .pace-tick { stroke: var(--primary-text-color, #fff); stroke-width: 14; }
    .spark { display: block; width: 100%; height: 24px; margin-top: 6px; overflow: visible; }
    .spark-line { fill: none; stroke-width: 1.5; vector-effect: non-scaling-stroke; stroke-linejoin: round; }
    .fc { margin-top: 3px; font-size: .85em; color: var(--secondary-text-color); }
    .fc.fc-warn { color: var(--warning-color, #ffa000); font-weight: 500; }
    .fc.center { text-align: center; }
    .fill { height: 100%; border-radius: 4px; transition: width .6s ease, background-color .3s; }
    .sub { margin-top: 5px; font-size: .85em; color: var(--secondary-text-color); }
    .sub.center { text-align: center; margin-top: 2px; }
    .rings { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 16px 12px; }
    .ring-item { display: flex; flex-direction: column; align-items: center; min-width: 0; }
    .ring { position: relative; width: 88px; height: 88px; }
    .ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
    .ring circle { fill: none; stroke-width: 8; }
    .ring .track { stroke: var(--divider-color, rgba(127,127,127,.25)); }
    .ring .arc { stroke-linecap: round; transition: stroke-dasharray .6s ease; }
    .ring-pct { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
                font-size: 1.15em; font-weight: 600; color: var(--primary-text-color); font-variant-numeric: tabular-nums; }
    .ring-name { margin-top: 6px; font-weight: 500; text-align: center; color: var(--primary-text-color); }
    .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(115px, 1fr)); column-gap: 16px; row-gap: 16px; }
    .col { display: grid; grid-row: span 4; grid-template-rows: subgrid; row-gap: 6px; min-width: 0; }
    .col-name { color: var(--primary-text-color); font-weight: 500; line-height: 1.25; align-self: end; overflow-wrap: anywhere; }
    .col-pct { font-size: 1.6em; font-weight: 600; line-height: 1.1; font-variant-numeric: tabular-nums; }
    .col-sub { display: flex; flex-direction: column; gap: 1px; font-size: .85em; color: var(--secondary-text-color); }
    .error { display: flex; align-items: center; gap: 6px; margin-top: 14px; color: var(--error-color, #db4437); font-size: .9em; }
    .error ha-icon, .stale ha-icon, .t-error ha-icon, .w-error ha-icon, .s-error ha-icon { --mdc-icon-size: 18px; }
    .rings + .row, .bars + .row { margin-top: 14px; }
    .empty { color: var(--secondary-text-color); font-size: .9em; }
    .stale { color: var(--warning-color, #ffa000); }
    .t-stale { color: #ffb35c; }
    .w-stale { color: #303030; }
    .s-stale { color: #f9c80e; }
    [role="button"]:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; border-radius: 4px; }
    .m-row[role="button"]:focus-visible { outline: none; }

    /* ---------- minimal ---------- */
    ha-card.minimal { padding: 10px 14px; }
    .m-head { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .m-head .logo { width: 18px !important; height: 18px !important; --mdc-icon-size: 18px !important; }
    .m-title { font-size: .95em; font-weight: 500; color: var(--primary-text-color); }
    .m-grid { display: grid; align-items: center; column-gap: 10px; row-gap: 7px; }
    .m-row { display: contents; }
    .m-name { font-size: .9em; color: var(--primary-text-color); white-space: nowrap; }
    .m-bar { height: 4px; border-radius: 2px; min-width: 40px; }
    .m-bar .fill { border-radius: 2px; }
    .m-pct { display: inline-flex; align-items: center; justify-content: flex-end; gap: 3px; min-width: 3em;
      font-size: .9em; font-weight: 600; font-variant-numeric: tabular-nums; }
    .m-warn { --mdc-icon-size: 14px; width: 14px; height: 14px; flex: 0 0 14px; display: inline-flex; overflow: hidden; color: var(--warning-color, #ffa000); }
    .m-reset { font-size: .8em; color: var(--secondary-text-color); text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
    .m-error { margin-top: 8px; }

    /* ---------- terminal ---------- */
    ha-card.terminal { background: #0f0a07; border: 1px solid #2a1a12; color: ${TERMINAL_COLOR}; }
    .t-screen { position: relative; padding: 14px 18px 12px; text-shadow: 0 0 6px rgba(232,135,90,.45); }
    .t-screen::after { content: ""; position: absolute; inset: 0; pointer-events: none;
      background: repeating-linear-gradient(0deg, rgba(0,0,0,.22) 0 1px, transparent 1px 3px); }
    .t-title { text-align: center; font-size: 2.1em; line-height: 1; margin-bottom: 8px; }
    .t-grid { display: grid; gap: 6px 16px; }
    .t-item { color: var(--c); }
    .t-item:nth-child(even) { text-align: right; }
    .t-label { font-size: 1.25em; font-weight: 700; letter-spacing: .02em; }
    .t-val { font-size: 3.2em; line-height: .95; font-variant-numeric: tabular-nums; }
    .t-used { font-size: 1.05em; opacity: .9; }
    .t-logo { display: flex; justify-content: center; margin: 10px 0 6px; }
    .t-foot { margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(232,135,90,.6); text-align: center; font-size: 1.6em; }
    .t-cursor { animation: blink 1s steps(1) infinite; margin-left: 2px; }
    .t-error { display: flex; align-items: center; justify-content: center; gap: 6px; color: #ff5f56; margin-top: 6px; font-size: 1.05em; }
    .t-empty { text-align: center; font-size: 1.1em; }
    .t-fc { font-size: 1em; opacity: .85; }
    .t-fc.fc-warn { opacity: 1; color: #ffb35c; }
    .t-item .spark { height: 22px; }
    @keyframes blink { 50% { opacity: 0; } }

    /* ---------- retro window ---------- */
    ha-card.retro { background: transparent; border: none; box-shadow: none; border-radius: 0; }
    .w-frame { background: #c0c0c0; color: #000; padding: 3px;
      border: 2px solid; border-color: #ffffff #404040 #404040 #ffffff;
      box-shadow: inset -1px -1px 0 #808080, inset 1px 1px 0 #dfdfdf; }
    .w-titlebar { display: flex; align-items: center; justify-content: space-between; gap: 8px;
      padding: 3px 4px 3px 8px; background: linear-gradient(90deg, #000080, #1084d0); color: #fff; }
    .w-title { font-weight: 700; font-size: 1.35em; letter-spacing: .01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .w-btns { display: flex; gap: 2px; flex: 0 0 auto; }
    .w-btns i { font-style: normal; width: 20px; height: 18px; display: inline-flex; align-items: center; justify-content: center;
      background: #c0c0c0; color: #000; font-size: 12px; font-weight: 700; line-height: 1;
      border: 1px solid; border-color: #ffffff #404040 #404040 #ffffff; box-shadow: inset -1px -1px 0 #808080; }
    .w-body { padding: 12px 12px 10px; }
    .w-logo { display: flex; justify-content: center; padding: 6px 0 10px; }
    .w-sep { height: 0; border-top: 1px solid #808080; border-bottom: 1px solid #ffffff; margin: 0 10% 10px; }
    .w-row + .w-row { margin-top: 10px; padding-top: 8px; border-top: 1px solid #808080; box-shadow: inset 0 1px 0 #fff; }
    .w-label { font-size: 1.05em; margin-bottom: 4px; }
    .w-line { display: flex; align-items: center; gap: 10px; }
    .w-track { position: relative; flex: 1; height: 18px; background: #fff; padding: 2px; box-sizing: border-box;
      border: 1px solid; border-color: #808080 #ffffff #ffffff #808080; box-shadow: inset 1px 1px 0 #404040; }
    .w-fill { height: 100%; background: repeating-linear-gradient(90deg, var(--c) 0 7px, transparent 7px 9px); transition: width .6s ease; }
    .w-pct { font-size: 1.9em; font-weight: 700; min-width: 3.2em; text-align: right; font-variant-numeric: tabular-nums; }
    .w-sub { font-size: .85em; color: #303030; margin-top: 3px; }
    .w-pace { background: #000080; box-shadow: none; top: -2px; bottom: -2px; }
    .w-fc.fc-warn { color: #a00000; font-weight: 700; }
    .w-row .spark { margin-top: 4px; }
    .w-error { display: flex; align-items: center; gap: 6px; margin-top: 10px; color: #a00000; }

    /* ---------- synthwave ---------- */
    ha-card.synth { background: #0b0420; border: 1px solid #2b145e; color: #fff; padding-bottom: 14px; }
    .s-sky { position: relative; padding-top: 14px;
      background:
        radial-gradient(1px 1px at 12% 18%, #fff 50%, transparent 51%),
        radial-gradient(1px 1px at 28% 40%, #fff 50%, transparent 51%),
        radial-gradient(1.5px 1.5px at 78% 14%, #ffd6f5 50%, transparent 51%),
        radial-gradient(1px 1px at 88% 46%, #fff 50%, transparent 51%),
        radial-gradient(1px 1px at 64% 30%, #fff 50%, transparent 51%),
        radial-gradient(1.5px 1.5px at 8% 60%, #c9f2ff 50%, transparent 51%),
        linear-gradient(#0b0420, #1a0838 70%, #2a0b4a); }
    .s-title { text-align: center; color: #ff6ec7; font-size: 2em; line-height: 1.05; font-weight: 700;
      text-shadow: 0 0 8px rgba(255,110,199,.7); }
    .s-title span { text-transform: uppercase; }
    .s-horizon { position: relative; height: 92px; margin-top: 4px; overflow: hidden; }
    .s-sun { position: absolute; left: 50%; bottom: 34px; width: 92px; height: 46px; transform: translateX(-50%);
      border-radius: 46px 46px 0 0; background: linear-gradient(#ffd319, #ff8c42 45%, #ff2975);
      box-shadow: 0 0 24px rgba(255,41,117,.45);
      -webkit-mask: linear-gradient(#000 0 48%, transparent 48% 56%, #000 56% 66%, transparent 66% 73%, #000 73% 81%, transparent 81% 87%, #000 87% 93%, transparent 93%);
              mask: linear-gradient(#000 0 48%, transparent 48% 56%, #000 56% 66%, transparent 66% 73%, #000 73% 81%, transparent 81% 87%, #000 87% 93%, transparent 93%); }
    .s-logo { position: absolute; left: 50%; bottom: 38px; transform: translateX(-50%); filter: drop-shadow(0 0 8px rgba(255,110,199,.7)); }
    .s-grid { position: absolute; left: -30%; right: -30%; bottom: 0; height: 34px; border-top: 2px solid #b026ff;
      background-image: linear-gradient(#b026ff 1px, transparent 1px), linear-gradient(90deg, #b026ff 1px, transparent 1px);
      background-size: 100% 8px, 28px 100%; transform: perspective(60px) rotateX(35deg); transform-origin: top;
      box-shadow: 0 -2px 10px rgba(176,38,255,.6); }
    .s-rows { padding: 12px 16px 0; display: flex; flex-direction: column; gap: 10px; }
    .s-label { color: var(--c); font-size: 1.2em; margin-bottom: 3px; text-shadow: 0 0 6px var(--c); }
    .s-line { display: flex; align-items: center; gap: 12px; }
    .s-track { position: relative; flex: 1; height: 18px; border: 2px solid var(--c); background: #12062e; box-sizing: border-box; }
    .s-fill { height: 100%; background: var(--c); box-shadow: 0 0 10px var(--c); transition: width .6s ease; }
    .s-pct { color: var(--c); font-size: 2em; font-weight: 700; min-width: 2.6em; text-align: right;
      text-shadow: 0 0 8px var(--c); font-variant-numeric: tabular-nums; }
    .s-sub { color: #c9b8ff; font-size: .95em; margin-top: 2px; }
    .s-pace { background: #fff; box-shadow: 0 0 6px #fff; }
    .s-fc.fc-warn { color: #f9c80e; text-shadow: 0 0 6px #f9c80e; }
    .s-error { display: flex; align-items: center; gap: 6px; margin: 10px 16px 0; color: #ff5f8a; }
  `;

  // ---------------------------------------------------------------- Editor

  const select = (options) => ({ select: { mode: "dropdown", options } });
  const bool = (name) => ({ name, selector: { boolean: {} } });
  const pair = (...schema) => ({ type: "grid", name: "", schema });
  const numField = (name, min, max, unit) => ({
    name,
    selector: { number: { min, max, step: 1, mode: "box", unit_of_measurement: unit } },
  });
  const rgb = (name) => ({ name, selector: { color_rgb: {} } });
  const section = (title, icon, schema) => ({ type: "expandable", name: "", flatten: true, title, icon, schema });
  const NAME_PREFIX = "name::";

  const editorSchema = (E, nameFields, fontMode) => [
    pair(
      {
        name: "style",
        selector: select([
          { value: "default", label: E.style_default },
          { value: "minimal", label: E.style_minimal },
          { value: "terminal", label: E.style_terminal },
          { value: "retro", label: E.style_retro },
          { value: "synthwave", label: E.style_synthwave },
        ]),
      },
      {
        name: "layout",
        selector: select([
          { value: "bars", label: E.layout_bars },
          { value: "columns", label: E.layout_columns },
          { value: "rings", label: E.layout_rings },
        ]),
      }
    ),
    section(E.logo, "mdi:image-outline", [
      pair(bool("show_title"), bool("show_logo")),
      { name: "title", selector: { text: {} } },
      { name: "icon", selector: { icon: {} } },
      { name: "logo_url", selector: { text: {} } },
      pair(rgb("logo_color"), numField("logo_size", 12, 96, "px")),
    ]),
    section(E.sensors, "mdi:gauge", [
      {
        name: "entities",
        selector: {
          entity: { multiple: true, filter: { domain: "sensor", integration: INTEGRATION_DOMAIN } },
        },
      },
      { name: "filter", selector: { text: {} } },
    ]),
    ...(nameFields.length ? [section(E.names, "mdi:rename-outline", nameFields)] : []),
    section(E.display, "mdi:tune-variant", [
      pair(bool("color_values"), bool("show_reset")),
      {
        name: "reset_display",
        selector: select([
          { value: "both", label: E.reset_both },
          { value: "relative", label: E.reset_relative },
          { value: "absolute", label: E.reset_absolute },
        ]),
      },
      pair(bool("show_extra_usage"), bool("show_api_error")),
      numField("stale_minutes", 0, 1440, "min"),
    ]),
    section(E.colors, "mdi:palette-outline", [
      {
        name: "color_mode",
        selector: select([
          { value: "threshold", label: E.color_threshold },
          { value: "severity", label: E.color_severity },
        ]),
      },
      pair(numField("warning_threshold", 0, 100, "%"), numField("critical_threshold", 0, 100, "%")),
      { type: "grid", name: "", column_min_width: "100px", schema: [rgb("color_ok"), rgb("color_warning"), rgb("color_critical")] },
    ]),
    section(E.skin, "mdi:palette-swatch-outline", [
      {
        name: "font",
        selector: select([
          { value: "auto", label: E.font_auto },
          { value: "pixel", label: E.font_pixel },
          { value: "classic", label: E.font_classic },
          { value: "theme", label: E.font_theme },
          { value: "monospace", label: E.font_monospace },
          { value: "custom", label: E.font_custom_opt },
        ]),
      },
      ...(fontMode === "custom" ? [{ name: "font_custom", selector: { text: {} } }] : []),
      bool("status_colors"),
    ]),
    section(E.analysis, "mdi:chart-timeline-variant", [
      pair(bool("show_pace"), bool("show_forecast")),
      pair(bool("show_history"), numField("history_hours", 1, 48, "h")),
    ]),
    section(E.actions, "mdi:gesture-tap", [
      { name: "tap_action", selector: { ui_action: {} } },
      { name: "hold_action", selector: { ui_action: {} } },
      { name: "double_tap_action", selector: { ui_action: {} } },
    ]),
  ];

  const EDITOR_KEYS = [
    "title", "style", "layout", "color_mode", "show_logo", "icon", "logo_url", "logo_color", "logo_size",
    "entities", "filter", "show_title", "show_reset", "reset_display", "show_extra_usage",
    "show_api_error", "warning_threshold", "critical_threshold", "status_colors", "font",
    "show_pace", "show_forecast", "show_history", "history_hours", "color_values", "stale_minutes",
    "color_ok", "color_warning", "color_critical", "tap_action", "hold_action", "double_tap_action",
    "font_custom",
  ];

  // Any CSS color string (hex, rgb(), var(--x, fallback)) -> [r,g,b], resolved against the current theme.
  const cssToRgb = (v, el) => {
    if (Array.isArray(v)) return v;
    if (typeof v !== "string" || !v.trim()) return undefined;
    let s = v.trim();
    const m = s.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/);
    if (m) {
      const live = el ? getComputedStyle(el).getPropertyValue(m[1]).trim() : "";
      s = live || (m[2] || "").trim();
    }
    const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hex) {
      const h = hex[1].length === 3 ? hex[1].replace(/./g, (x) => x + x) : hex[1];
      return hexToRgb(`#${h}`);
    }
    const rgbm = s.match(/^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)/i);
    if (rgbm) return [+rgbm[1], +rgbm[2], +rgbm[3]];
    return undefined;
  };

  class ClaudeUsageCardEditor extends HTMLElement {
    connectedCallback() {
      // theme colors can only be read once the element is attached
      requestAnimationFrame(() => this._render());
    }

    setConfig(config) {
      this._config = { ...config };
      this._render();
    }

    set hass(hass) {
      const first = !this._hass;
      this._hass = hass;
      if (this._form && !first) this._form.hass = hass;
      else this._render();
    }

    _render() {
      if (!this._hass || !this._config) return;
      const S = strings(this._hass);
      const E = S.ed;
      if (!this._form) {
        this._form = document.createElement("ha-form");
        this._form.addEventListener("value-changed", (ev) => this._changed(ev));
        this.appendChild(this._form);
      }
      const cfg = { ...DEFAULTS, ...this._config };
      const ids = detectIds(this._hass, cfg);
      const names = cfg.names || {};
      this._labels = {};
      const nameFields = ids.map((id) => {
        const key = NAME_PREFIX + id;
        this._labels[key] = autoLabel(id, this._hass.states[id], S);
        return { name: key, selector: { text: {} } };
      });
      this._colorDefaults = {};
      for (const k of COLOR_KEYS) this._colorDefaults[k] = cssToRgb(DEFAULTS[k], this);
      const data = {};
      for (const k of EDITOR_KEYS) {
        const v = k in this._config ? this._config[k] : DEFAULTS[k];
        data[k] = COLOR_KEYS.includes(k) ? cssToRgb(v, this) : v;
      }
      let fontMode = this._config.font || "auto";
      if (!FONT_MODES.includes(fontMode)) {
        data.font_custom = fontMode;
        fontMode = "custom";
      }
      data.font = fontMode;
      for (const id of ids) data[NAME_PREFIX + id] = names[id] || "";
      this._form.hass = this._hass;
      this._form.data = data;
      this._form.schema = editorSchema(E, nameFields, fontMode);
      this._form.computeLabel = (s) => this._labels[s.name] || E[s.name] || s.name;
    }

    _changed(ev) {
      ev.stopPropagation();
      const v = ev.detail.value || {};
      const config = { ...this._config };
      for (const k of EDITOR_KEYS) {
        const val = v[k];
        if (COLOR_KEYS.includes(k)) {
          const shown = cssToRgb(k in this._config ? this._config[k] : DEFAULTS[k], this);
          // untouched picker: keep whatever the config had (theme variable, hex, ...)
          if (val === undefined || JSON.stringify(val) === JSON.stringify(shown)) continue;
          if (JSON.stringify(val) === JSON.stringify(this._colorDefaults[k])) delete config[k];
          else config[k] = val;
          continue;
        }
        const isEmpty = val === undefined || val === "" || (Array.isArray(val) && !val.length);
        if (isEmpty || JSON.stringify(val) === JSON.stringify(DEFAULTS[k])) delete config[k];
        else config[k] = val;
      }
      if (config.font !== "custom") delete config.font_custom;
      const names = { ...(this._config.names || {}) };
      for (const key of Object.keys(v)) {
        if (!key.startsWith(NAME_PREFIX)) continue;
        const id = key.slice(NAME_PREFIX.length);
        const name = String(v[key] || "").trim();
        if (name) names[id] = name;
        else delete names[id];
      }
      if (Object.keys(names).length) config.names = names;
      else delete config.names;
      config.type = this._config.type || `custom:${CARD_TAG}`;
      const changed = JSON.stringify(config) !== JSON.stringify(this._config);
      this._config = config;
      if (changed)
        this.dispatchEvent(
          new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true })
        );
    }
  }

  if (!customElements.get(CARD_TAG)) customElements.define(CARD_TAG, ClaudeUsageCard);
  if (!customElements.get(EDITOR_TAG)) customElements.define(EDITOR_TAG, ClaudeUsageCardEditor);

  window.customCards = window.customCards || [];
  if (!window.customCards.some((c) => c.type === CARD_TAG)) {
    window.customCards.push({
      type: CARD_TAG,
      name: "Claude Usage Card",
      description:
        "Session and weekly limits from the Claude Usage integration: bars, rings, terminal, retro window or synthwave.",
      preview: true,
    });
  }

  console.info(
    `%c CLAUDE-USAGE-CARD %c v${CARD_VERSION} `,
    "color:#fff;background:#d97757;font-weight:700;border-radius:3px 0 0 3px",
    "color:#d97757;background:#fff;font-weight:700;border-radius:0 3px 3px 0"
  );
})();
