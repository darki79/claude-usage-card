/*
 * Claude Usage Card
 * Custom Lovelace card for the "Claude Usage" integration
 * (https://github.com/trickv/hass-claude-usage).
 * Reads the integration's sensors only; it never calls any external API.
 * License: MIT
 */
(() => {
  const CARD_VERSION = "1.1.0";
  const CARD_TAG = "claude-usage-card";
  const EDITOR_TAG = "claude-usage-card-editor";
  const INTEGRATION_DOMAIN = "hass_claude_usage";
  const STYLES = ["default", "minimal", "terminal", "retro", "synthwave", "paper", "cupertino", "shell", "material", "matrix", "eink"];

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
  const FONT_WOFF2 = "d09GMgABAAAAAAxAAA4AAAAAVFAAAAvoAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGhwbIBwqBmAAghgRCAqBnAj6EAE2AiQDgTQLgTQABCAFgnAHIBuzQVFUcbohvjzg5sDFxSxGsBCt2k6olhNttVrEUMSApbHN8YdfMcQTu4ynFc67ePjv3rxvZnZ70qlVbpVyQom2AhSB5aVPHIGAJAIBCc//1WU/0F934B65U9OjuGJX5EFPyOsCPPm+2ZPw7tCNvgZ+tPb6ElbAe2YCNAFaPQFF6qaAtltAmy2gzRVUZP+WWbV6bQHAIYI3ENNxh4fP2yPcBbIukI2SYAMspADbBZR4EGCgv/97ggkrOVdvMmm1HjyQrJwxT0LIIcf/b281O1Mb2q4jqHz8Crmt1oJTdLxn/p+eR8pNiioqzqmq+6pm+v3qSEhRcdAhO1QMSiBRaIxCyJE7DqRmk2k1lGznihIjW8VqcP+fIzAEpLfDLwW41yzgu9G3hBdwvVY0QLgCFYBy6g69wHtu/TwmhyEOUayHSjQfKIQ0Ts3A7dOPjg+iP4BWz9fR2f/O/caq4K7GVF0gr6mAMu0PEBBNIsCaICRkzAsSmBccBfvkgs1SMEiRJgOVq1qjVl16jJgybwUeuuuRp175ZjVV/9/AGg0TIh2VK0+Npm6n9ho13fZOb6kmwKfWu++Bh/66Xe+Ahr/poUoBtf+N5H/a/4xnOQLss8sErqyjw8U6PfVPG24wzSrVqtOoVINy1UpUIaxENg5OnCYBojIFngG+ADQdk0luB8NnAwATWIe6KnyM8F89hOMiR1LRhMVDrXlhdjAcDpzayQqAxSP65U7uohAborI5rinbnJ3lHs4umc24/M8TENeTsrgmof0nyBxGDI9e/bYXFCAKsvRYlC1aMc+baUYL0v4sk/njE0UeUeQHB/LFmRyLGXH5SWpmW/1RGIlmM2ZXNXWoM1HQFuZxnFZAjuM0RuTS8em1rYicry+GQm8RjzxOJr/fcfMezvjza4WGsFH4PAa7iDE42KpiLAzYgwvs6oYXe6EnP/48xMSJyv6owE7Xxcw4XOazhu7qvIB9Dw53usY4xZgYWMQyoOqbKUays4FSQoAJEdaSgdAkukyoMesYQzl3nxIxUEhJx21OObDHT4ofo5EPwYNPi6EzTEEYQk/BYwRwe6Rks2AAtjjV6mGOdMswUyRmxDFtfGQUHZAfekajcPvo82kO2Zg5fIfHCL0z8Ri+l2o25PNPlpCDcE5DeUyLIEfWXSoVd9Oc4qnEsBuhp3sfTcIvfdQdLkix+ZxtBAmmUKzLHET0nagd752cCZgdhXThZPVRipPESn80Uk+JBxhIwxY++KJzBR+yYjDWyVdL3sSF+KIPMowuRme/B3tbtSAWk0A4SvetYZ22NvS7Yo1YTWNbHN/uoad8WaNyC3YwyhnWTemF2bPGK+4cdaKngMRE3iLxLTuzoySWYGNJ6JAZU1LgziKEOzqYjaqFexaXOJ+YvW2zfc9fahbl3ZhNNLxsuIA9NE4AesmKIYMTj8wiLQ+fPI/P4v2FBN1HnAvtDr6myrFBMOM0pZtD7qHrdU0OAkMoZxwaDHhk3E1kQrZzXg44YFeHybRLqG33cluBVR+VmH6X+N7R6HecL34fB31UohGQJXA6xi+jFdQOkli8VepUnxPNklltCqJme0xW9EpVsmavxOahkpRLo52N6Fe5p6V0MH241iqJ0sihN1ClCvQ6jtzhMsRSw4YReXu+ubIQ4SO03nCCEoKUV54p0xZOaL+LPpfJoRZYCOP+i7CRfuWbZeCi9ZZTwhVHcoFy4XFlTXqxPyS9lnOB0nNEujWQ0D5FGXdBINkP9Nc7aRMXdAnYznnXHrrmg+HQJhy1I9TtEmCRRvNrRw10ugYSm7qt63qbBBhGiUwnK49vyf3MrEY59ZJZ320lvxFxH8Td6Ivcd9ufTXershHrAht1AKbIzdDk0t2DUhmPiGlxj1SuoBNGk1x5Lm+uA9KMb/PCptO8Wlc4pNy4kcc5WifKWcxmFbLKmiIMP/p7B20ITEXZj/09025C42JJDYmNo6C61BA2bvHPXZTwj2oWsYqCwq+DhgunduG1Mq/ph3Bro6uRmu2/YeJZuCZVol96EF+jOAoc7IzrspJ5HcPlI0PBgZbuMYb76lbFQxgOd69RIrZT8b9CJp0fQ8rNQ1j8gXvjA/rRcw4IEwx27DcyLv6WK8OvydBljPzcjBnNNIon7u7TZhdUAp8tg/SpgHOcSRan2OMnxzA1eRplCJEfJ1HwOMDinDBJ4Y9ipTGGu6EJnZvDmKwyNobQISSHWOjkgUFyPKf0awZxzrD0+AjjAxRv16DlEV+ciK68J7aUK8C5FFbFdqgZ5uYAcB9zLXquJDQNRmABisAZCdg2hQ6DWJgYIVA7HE2c31spK4vSiB9Z1IuQv3rBYLin+hSGOzSy7mbZQt9Fr5xCwi0MyaMXTMK2lY33jAzSH2fafDgYvBiN58YHBUGb/Wj9DoMUxFOHhoIfc5QaHwuZzBteykMnjWnvoTN8QG4h2FRjha6mRYxwGENIB0YUG3YRak3SjCHTRBfqFoBIpoOd6tQTugZjziCEmNw2569QJrY1cSDuWnUkMpTxYTDE+NhNPf1wsJFYWyIxpSLKiEBHLm4aAguQdtRKzhuBqV6LyxoullOPierfI+aeG3154Uxs6W4kDJc+b9cgIOpCYF//fSf1P6qyPb3GDMt0feLfR1qHe7TNB+b87pyxLqkItVTrZrRGo7oB3fHm2AEyDC5lqh0/1+4APd9CbgNF6ExWQlekRjYfEqI2s3hjh7T14o0uSCdjLPQ+mUvV+/1+Zz9jR3ZewEUbv3DOxZjeUlxFxCd7AZ50XlXQhcDsxlZt48Rm8NdWNjsRG4chXmkoI8/uIL/IqJSVyDzqmJi0/TXsiFkbg95WRlaQ8tykOSuLvy/BWH+ebh8v3hg1P+3hfkhP8aqt7VbO0ZV0YSmniaHHVB+pLve+S2YwIZLBpvIBlQSClMTHwqipxEIoH+JNf9TJsekukEtrEdX0tnqm2+VgO836URZCUvLW6tFSX1QaROT3j5zHIQohIP2aysfXnZHWo4C2JKqgd1BtH9NfBae7ibMpdWF4P6+vpK94V4Ul/0sPbaH5IEq9/i3XerfWyd3G+rZQ69kCqV+HxK36qtWyEjEoitVkN7GQqAoviPWmag8ScswrkOIyL7jKvCgdNItqKuJOGqXdJcLfIM5Fz1kys6mum6MutHxl97U4TzbAuP7Kf+oCojrVicBC/V5jznrQzdSGKINInQXi3c0srBhxvnHXUhz0kjkfGmEfWL2dFaCGneQpfOIfRsO1g47MdXqsyk5sXsNefHjTKo2LRYy1w4a6cGJdXrsd9iAZC9W0dbRRYqTelO+oSAnilYbnW5kcF7HoxiEv2uMXVUuotAqWvclPmMXDf1o46JzzW3rLs+ypIa4gxEQ5P+hxznXXwgTBHlHd9X83aDbwGGsoDlk6q7n9ODM29cuwZsP7BNC7L9r2f5lWILIH4zGwtnPmWOCLJep8To+QheXu0Vf8r5yUqtBJQj4GSNWWstoXhVt63e5G7zIK8kqs/144WB8DCxIfkcTRXRIF42QwjaJX4urIq2W75patSzxCwR7b0ev6vSm1n92qDexfZCpB7kYwxMoL9LfTgX2PQS/tOxIhiObgHqQOEyuJvmPc+v0tvb1cr/CLWIsIvvB67tXct7RIUbdAyFobxTta8ZqeNVr6nmdStvtJ/YzI0u8EnAYKECbDsO4WoeQXEbHqZWH3lD2iL/7ZZxJ/fv9AYu497OvaJv/h5D/g5x6+Afidpp+s+1XkXS3bgY7Usf8/op8TDcLau94R/DkxoiFbj/WKdfWou6FcvUymLlIxCOlspa4bCccd81RIlXrss11mc+SvjXPvI/X7rWrLRpgapb79cQF49lqxb6VireWeEqqXF/cqPYwA3k8PfaPTk0nj07Ndp04vFjxdbx14t97+KVblGzFqzjgvN49JciLCyspMrqF5feDwJg1sRLaNmg53HOEzoO/9l801ZZLHiHET5PRGDZg0YJzAY4qfX44RXtKTdxf0GTHEMPRG3Vq70f/6HuNEAoIgMjQqx1TJeDcsq3+yvbweYO3tvEYMkw+uHfBPCwLqiED4AwAAAA==";
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
        style_paper: "Paper",
        style_cupertino: "Cupertino",
        style_shell: "Shell (Linux terminal)",
        style_material: "Material You",
        style_matrix: "Dot matrix",
        style_eink: "E-ink",
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
        skin: "Skins",
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
        style_paper: "Papier",
        style_cupertino: "Cupertino",
        style_shell: "Shell (Linux-Terminal)",
        style_material: "Material You",
        style_matrix: "Punktmatrix",
        style_eink: "E-Ink",
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
        skin: "Skins",
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
    material: "'Google Sans Flex', 'Google Sans Text', 'Google Sans', Roboto, 'Noto Sans', system-ui, sans-serif",
    matrix: "system-ui, sans-serif",
    eink: "'Atkinson Hyperlegible', Inter, 'Helvetica Neue', Arial, system-ui, sans-serif",
    shell: "'DejaVu Sans Mono', 'Ubuntu Mono', 'Liberation Mono', ui-monospace, Menlo, Consolas, monospace",
    cupertino: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'Segoe UI', Roboto, system-ui, sans-serif",
    paper: "'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', 'URW Palladio L', Georgia, serif",
  };
  // Returns { family, pixel } for a skin; older configs may hold a CSS family directly in `font`.
  const resolveFont = (c) => {
    let mode = c.font || "auto";
    let custom = c.font_custom;
    if (!FONT_MODES.includes(mode)) {
      custom = mode;
      mode = "custom";
    }
    if (mode === "auto") mode = ["terminal", "synthwave"].includes(c.style) ? "pixel" : "classic";
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
  // GNOME/Tango-like terminal palette
  const SHELL = { green: "#4e9a06", bgreen: "#8ae234", yellow: "#fce94f", red: "#ef2929", blue: "#729fcf", cyan: "#34e2e2", dim: "#8a8a8a" };
  const SPARK_CHARS = "▁▂▃▄▅▆▇█";
  const COMBINING = new RegExp(`[${String.fromCharCode(0x300)}-${String.fromCharCode(0x36f)}]`, "g");
  // "Anna Müller" -> "annamueller": umlauts spelled out, other accents dropped, spaces removed or joined
  const shellName = (v, join) =>
    String(v)
      .toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .normalize("NFD").replace(COMBINING, "")
      .replace(/[^a-z0-9_-]+/g, join)
      .replace(/^-+|-+$/g, "");
  // 5x7 dot font: each glyph is the char plus 7 base-32 digits, one per row (5 bits, left = 16)
  const DOT_FONT = "AehhvhhhBuhhuhhuCehgggheDuhhhhhuEvgguggvFvggugggGehgnhhfHhhhvhhhIe44444eJ72222icKhikokihLggggggvMhrllhhhNhhpljhhOehhhhhePuhhugggQehhhlidRuhhukihSfgge11uTv444444UhhhhhheVhhhhha4WhhhlllaXhha4ahhYhha4444Zv1248gv0ehjlphe14c4444e2eh1248v3v2421he426aiv225vgu11he668guhhe7v1248888ehhehhe9ehhf12c 0000000%op248j3.00000cc,0000c48:0cc0cc0-000v000+044v440/01248g0(2488842)8422248!4444404?eh12404·0004000_000000v";
  const DOT_GLYPHS = {};
  for (let i = 0; i < DOT_FONT.length; i += 8)
    DOT_GLYPHS[DOT_FONT[i]] = [...DOT_FONT.slice(i + 1, i + 8)].map((d) => parseInt(d, 32));
  const MATRIX = { on: "#f4f4f4", off: "#1c1c1c", accent: "#ff3b30", ok: "#3cff7a", warning: "#ffb21e", critical: "#ff3b30" };
  const dotUpper = (t) =>
    String(t)
      .toUpperCase()
      .replace(/Ä/g, "AE").replace(/Ö/g, "OE").replace(/Ü/g, "UE").replace(/ẞ|ß/g, "SS")
      .normalize("NFD").replace(COMBINING, "");
  // one SVG path per state: every dot of the grid is drawn, lit ones in the "on" path
  const dotPaths = (cols, rows, lit) => {
    let on = "";
    let off = "";
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const d = `M${x + 0.12} ${y + 0.5}a.38 .38 0 1 0 .76 0a.38 .38 0 1 0 -.76 0`;
        if (lit(x, y)) on += d;
        else off += d;
      }
    return { on, off };
  };
  const dotText = (text, cls, color) => {
    const chars = [...dotUpper(text)].map((ch) => DOT_GLYPHS[ch] || DOT_GLYPHS["?"]);
    const cols = Math.max(1, chars.length * 6 - 1);
    const { on, off } = dotPaths(cols, 7, (x, y) => {
      const g = chars[Math.floor(x / 6)];
      const cx = x % 6;
      return cx < 5 && !!(g[y] & (16 >> cx));
    });
    return `<svg class="${cls}" viewBox="0 0 ${cols} 7" style="--dc:${esc(color)}" role="img" aria-label="${esc(text)}"><path class="dm-off" d="${off}"/><path class="dm-on" d="${on}"/></svg>`;
  };
  // Apple-style semantic system colors, light and dark variants
  const CUP = {
    light: { tint: "#007aff", ok: "#34c759", warning: "#ff9500", critical: "#ff3b30" },
    dark: { tint: "#0a84ff", ok: "#30d158", warning: "#ff9f0a", critical: "#ff453a" },
  };
  const PAPER = {
    sheet: "#f3eee3",
    ink: "#2b2620",
    faded: "#7a7064",
    rule: "#d8cebc",
    accent: "#b5532f",
    ok: "#55703f",
    warning: "#a8791c",
    critical: "#9e2a2b",
  };

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
      // pointerleave does not bubble: listen in the capture phase, react only to the pressed item
      root.addEventListener(
        "pointerleave",
        (ev) => {
          if (!ev.target.dataset || ev.target.dataset.entity !== this._downId) return;
          clearTimeout(this._holdT);
          this._release();
        },
        true
      );
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
      // keys the user actually set: a skin may only override the logo color when it is unset
      this._userConfig = config;
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
          .join(";") + `|${langOf(this._hass)}|${!!(this._hass.themes && this._hass.themes.darkMode)}`
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

    _resetParts(resetsAt, S) {
      if (!resetsAt) return [];
      const t = new Date(resetsAt);
      if (isNaN(t.getTime())) return [];
      const diff = t.getTime() - Date.now();
      const abs = this._fmtAbs(t);
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
        const resetParts = this._resetParts(resetsAt, S);
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
          reset: resetParts.join(" · "),
          resetParts,
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

    // skins with their own status shades: pal = { none, base, ok, warning, critical }
    _statusColor(it, pal) {
      const c = this._config;
      if (it.value == null) return pal.none;
      if (!c.status_colors) return pal.base;
      if (c.color_mode === "severity") return it.color;
      if (it.value >= c.critical_threshold) return pal.critical;
      if (it.value >= c.warning_threshold) return pal.warning;
      return pal.ok;
    }

    _renderPaper(items, extra, err, S) {
      const c = this._config;
      const all = [...items, ...extra];
      const rows = all
        .map((it) => {
          const col = this._statusColor(it, { ...PAPER, none: PAPER.accent, base: PAPER.accent });
          const pct = clampPct(it.value);
          return `
          <div class="p-row" data-entity="${esc(it.id)}" tabindex="0" role="button" style="--c:${esc(col)}">
            <div class="p-head">
              <span class="p-name">${esc(it.name)}</span>
              <span class="p-pct">${it.value == null ? esc(S.unavailable) : `${Math.round(it.value)}<small>%</small>`}</span>
            </div>
            <div class="p-track"><div class="p-fill" style="width:${pct}%"></div><i class="p-blot" style="left:${pct}%"></i>${this._paceMarker(it, "pace p-pace")}</div>
            ${this._spark(it, col)}
            ${c.show_reset && it.reset ? `<div class="p-sub">${esc(it.reset)}</div>` : ""}
            ${this._fcHtml(it, "p-sub p-fc")}
          </div>`;
        })
        .join("");
      const head =
        c.show_title || c.show_logo
          ? `<div class="p-titlebar">${this._logo(PAPER.ink)}${
              c.show_title ? `<span class="p-title">${esc(c.title || S.title)}</span>` : ""
            }</div><div class="p-rule"></div>`
          : "";
      return `
        <ha-card class="skin paper">
          ${head}
          ${all.length ? rows : `<div class="p-sub">${esc(S.no_sensors)}</div>`}
          ${this._staleHtml(S, "p-error p-stale")}
          ${this._errorHtml(err, S, "p-error")}
        </ha-card>`;
    }

    // ------------------------------------------------------------ material you

    _renderMaterial(items, extra, err, S) {
      const c = this._config;
      const all = [...items, ...extra];
      const rows = all
        .map((it) => {
          const col = c.status_colors ? it.color : "var(--m-primary)";
          const pct = clampPct(it.value);
          const pace = this._paceMarker(it, "mu-pace");
          return `
          <div class="mu-row" data-entity="${esc(it.id)}" tabindex="0" role="button" style="--c:${esc(col)};--p:${pct}%">
            <div class="mu-head">
              <span class="mu-name">${esc(it.name)}</span>
              <span class="mu-pct">${it.value == null ? esc(S.unavailable) : `${Math.round(it.value)}<small>%</small>`}</span>
            </div>
            <div class="mu-progress${pct <= 0 ? " mu-empty" : ""}${pct >= 100 ? " mu-full" : ""}">
              <span class="mu-wave"></span><span class="mu-rest"></span><span class="mu-stop"></span>${pace}
            </div>
            ${this._spark(it, col)}
            ${c.show_reset && it.reset ? `<div class="mu-sub">${esc(it.reset)}</div>` : ""}
            ${this._fcHtml(it, "mu-sub mu-fc")}
          </div>`;
        })
        .join("");
      const icon = c.show_logo
        ? c.logo_url
          ? this._logo()
          : `<span class="mu-icon"><ha-icon icon="${esc(c.icon || DEFAULTS.icon)}"></ha-icon></span>`
        : "";
      const head =
        c.show_title || c.show_logo
          ? `<div class="mu-header">${icon}${c.show_title ? `<span class="mu-title">${esc(c.title || S.title)}</span>` : ""}</div>`
          : "";
      return `
        <ha-card class="skin material">
          ${head}
          ${all.length ? rows : `<div class="mu-sub">${esc(S.no_sensors)}</div>`}
          ${this._staleHtml(S, "mu-note mu-stale")}
          ${this._errorHtml(err, S, "mu-note mu-error")}
        </ha-card>`;
    }

    // ------------------------------------------------------------ dot matrix

    _renderMatrix(items, extra, err, S) {
      const c = this._config;
      const all = [...items, ...extra];
      const N = 40;
      const rows = all
        .map((it) => {
          const col = this._statusColor(it, { ...MATRIX, none: MATRIX.off, base: MATRIX.on });
          const lit = Math.round((clampPct(it.value) / 100) * N);
          const paceAt = c.show_pace && it.pace != null ? Math.min(N - 1, Math.floor((it.pace / 100) * N)) : -1;
          const { on, off } = dotPaths(N, 2, (x) => x < lit && x !== paceAt);
          const pace = paceAt >= 0 ? dotPaths(N, 2, (x) => x === paceAt).on : "";
          const bar = `<svg class="dm-bar" viewBox="0 0 ${N} 2" preserveAspectRatio="xMinYMid meet" style="--dc:${esc(col)}"><path class="dm-off" d="${off}"/><path class="dm-on" d="${on}"/>${
            pace ? `<path class="dm-pace" d="${pace}"><title>${esc(fmt(S.pace_title, { p: Math.round(it.pace) }))}</title></path>` : ""
          }</svg>`;
          const value = it.value == null ? "--" : `${Math.round(it.value)}%`;
          const subs = [];
          if (c.show_reset && it.resetsAt) subs.push(dotText(this._shortReset(it.resetsAt, S), "dm-small", "#8c8c8c"));
          else if (c.show_reset && it.reset) subs.push(dotText(it.reset, "dm-small", "#8c8c8c"));
          if (it.forecast)
            subs.push(dotText(it.forecast.text, "dm-small", it.forecast.warn ? MATRIX.warning : "#8c8c8c"));
          return `
          <div class="dm-row" data-entity="${esc(it.id)}" tabindex="0" role="button">
            <div class="dm-head">${dotText(it.short, "dm-label", "#bdbdbd")}${dotText(value, "dm-big", col)}</div>
            ${bar}
            ${subs.map((x) => `<div class="dm-subline">${x}</div>`).join("")}
          </div>`;
        })
        .join("");
      const notes =
        this._staleHtml(S, "dm-note dm-stale") + this._errorHtml(err, S, "dm-note dm-error");
      return `
        <ha-card class="skin matrix">
          ${c.show_title ? `<div class="dm-title">${dotText(c.title || S.skin_title, "dm-head-text", MATRIX.accent)}</div>` : ""}
          ${all.length ? rows : `<div class="dm-note">${esc(S.no_sensors)}</div>`}
          ${notes}
        </ha-card>`;
    }

    // ------------------------------------------------------------ e-ink

    _renderEink(items, extra, err, S) {
      const c = this._config;
      const all = [...items, ...extra];
      const rows = all
        .map((it) => {
          const pct = clampPct(it.value);
          const crit = it.value != null && it.value >= c.critical_threshold;
          const pace = this._paceMarker(it, "ei-pace");
          return `
          <div class="ei-row" data-entity="${esc(it.id)}" tabindex="0" role="button">
            <div class="ei-head">
              <span class="ei-name">${esc(it.name)}</span>
              <span class="ei-pct${crit ? " ei-crit" : ""}">${it.value == null ? esc(S.unavailable) : `${Math.round(it.value)}%`}</span>
            </div>
            <div class="ei-bar"><div class="ei-fill" style="width:${pct}%"></div></div>
            <div class="ei-scale">${pace}</div>
            ${this._spark(it, "#000")}
            ${c.show_reset && it.reset ? `<div class="ei-sub">${esc(it.reset)}</div>` : ""}
            ${it.forecast ? `<div class="ei-sub${it.forecast.warn ? " ei-warn" : ""}">${it.forecast.warn ? "▲ " : ""}${esc(it.forecast.text)}</div>` : ""}
          </div>`;
        })
        .join("");
      const head =
        c.show_title || c.show_logo
          ? `<div class="ei-header">${this._logo("#000")}${c.show_title ? `<span class="ei-title">${esc(c.title || S.title)}</span>` : ""}</div>`
          : "";
      return `
        <ha-card class="skin eink">
          ${head}
          ${all.length ? rows : `<div class="ei-sub">${esc(S.no_sensors)}</div>`}
          ${this._staleHtml(S, "ei-note")}
          ${this._errorHtml(err, S, "ei-note ei-warn")}
        </ha-card>`;
    }

    // history as a line of block characters, like the `spark` CLI
    _sparkText(it) {
      if (!this._config.show_history || !this._hist || !this._hist[it.id]) return "";
      const now = Date.now();
      const span = Math.max(1, Number(this._config.history_hours) || 6) * HOUR;
      const n = 32;
      const series = this._hist[it.id];
      const vals = [];
      for (let i = 1; i <= n; i++) {
        const v = this._valueAt(series, now - span + (span * i) / n);
        vals.push(v);
      }
      if (it.value != null) vals[n - 1] = it.value;
      const known = vals.filter((v) => v != null);
      if (!known.length) return "";
      const lo = Math.min(...known);
      const range = Math.max(5, Math.max(...known) - lo);
      return vals
        .map((v) => (v == null ? " " : SPARK_CHARS[Math.min(7, Math.round(((v - lo) / range) * 7))]))
        .join("");
    }

    _renderShell(items, extra, err, S) {
      const c = this._config;
      const all = [...items, ...extra];
      const h = this._hass;
      const user = shellName((h.user && h.user.name) || "", "") || "user";
      const host = shellName((h.config && h.config.location_name) || "", "-") || "homeassistant";
      const prompt = `<span class="sh-user">${esc(user)}@${esc(host)}</span>:<span class="sh-path">~</span>$`;
      const BAR = "|".repeat(120);
      const rows = all
        .map((it) => {
          const col = this._statusColor(it, {
            none: SHELL.dim, base: SHELL.bgreen, ok: SHELL.bgreen, warning: SHELL.yellow, critical: SHELL.red,
          });
          const pct = it.value == null ? "n/a" : `${it.value.toFixed(1)}%`;
          const pace =
            this._config.show_pace && it.pace != null
              ? `<i class="sh-pace" style="left:${it.pace.toFixed(2)}%" title="${esc(fmt(S.pace_title, { p: Math.round(it.pace) }))}">¦</i>`
              : "";
          const spark = this._sparkText(it);
          const notes = [];
          if (spark) notes.push(`<div class="sh-note sh-spark" style="color:${esc(col)}">${esc(spark)}</div>`);
          if (c.show_reset && it.reset) notes.push(`<div class="sh-note"># ${esc(it.reset)}</div>`);
          if (it.forecast)
            notes.push(`<div class="sh-note ${it.forecast.warn ? "sh-warn" : ""}">${it.forecast.warn ? "warning: " : "# "}${esc(it.forecast.text)}</div>`);
          return `
          <div class="sh-row" data-entity="${esc(it.id)}" tabindex="0" role="button" style="--c:${esc(col)}">
            <span class="sh-label">${esc(it.short)}</span>
            <span class="sh-meter">[<span class="sh-track"><span class="sh-fill" style="width:${clampPct(it.value)}%">${BAR}</span>${pace}<span class="sh-pct">${esc(pct)}</span></span>]</span>
            ${notes.length ? `<div class="sh-notes">${notes.join("")}</div>` : ""}
          </div>`;
        })
        .join("");
      const title = c.title || `${user}@${host}: ~`;
      const msgs =
        this._staleHtml(S, "sh-msg sh-warn") + this._errorHtml(err, S, "sh-msg sh-err");
      return `
        <ha-card class="skin shell">
          ${
            c.show_title
              ? `<div class="sh-bar">${c.show_logo ? this._logo(SHELL.dim) : ""}<span class="sh-title">${esc(title)}</span><span class="sh-wbtns"><i>&#x2013;</i><i>&#x25A1;</i><i class="sh-x">&#x2715;</i></span></div>`
              : ""
          }
          <div class="sh-body">
            <div class="sh-line">${prompt} <span class="sh-cmd">claude-usage status</span></div>
            ${all.length ? `<div class="sh-grid">${rows}</div>` : `<div class="sh-msg sh-err">${esc(S.no_sensors)}</div>`}
            ${msgs}
            <div class="sh-line">${prompt} <span class="sh-cursor"></span></div>
          </div>
        </ha-card>`;
    }

    _renderCupertino(items, extra, err, S) {
      const c = this._config;
      const dark = !!(this._hass.themes && this._hass.themes.darkMode);
      const pal = dark ? CUP.dark : CUP.light;
      const all = [...items, ...extra];
      const rows = all
        .map((it) => {
          const col = this._statusColor(it, { ...pal, none: "var(--cu-label3)", base: pal.tint });
          const sub = c.show_reset && it.reset ? esc(it.reset) : "";
          return `
          <div class="cu-row" data-entity="${esc(it.id)}" tabindex="0" role="button" style="--c:${esc(col)}">
            <div class="cu-head">
              <span class="cu-name">${esc(it.name)}</span>
              <span class="cu-pct">${it.value == null ? esc(S.unavailable) : `${Math.round(it.value)}<small>%</small>`}</span>
            </div>
            <div class="cu-track"><div class="cu-fill" style="width:${clampPct(it.value)}%"></div>${this._paceMarker(it, "pace cu-pace")}</div>
            ${this._spark(it, col)}
            ${sub ? `<div class="cu-sub">${sub}</div>` : ""}
            ${this._fcHtml(it, "cu-sub cu-fc")}
          </div>`;
        })
        .join("");
      const icon = c.show_logo
        ? c.logo_url
          ? this._logo()
          : `<span class="cu-app" style="--a:${esc(toCss("logo_color" in this._rawConfig() ? c.logo_color : DEFAULTS.logo_color))}"><ha-icon icon="${esc(c.icon || DEFAULTS.icon)}"></ha-icon></span>`
        : "";
      const head =
        c.show_title || c.show_logo
          ? `<div class="cu-header">${icon}${c.show_title ? `<span class="cu-title">${esc(c.title || S.title)}</span>` : ""}</div>`
          : "";
      return `
        <ha-card class="skin cupertino ${dark ? "cu-dark" : "cu-light"}" style="--cu-tint:${pal.tint};--cu-red:${pal.critical};--cu-orange:${pal.warning}">
          ${head}
          ${all.length ? `<div class="cu-group">${rows}</div>` : `<div class="cu-sub">${esc(S.no_sensors)}</div>`}
          ${this._staleHtml(S, "cu-note cu-stale")}
          ${this._errorHtml(err, S, "cu-note cu-error")}
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
      else if (c.style === "paper") card = this._renderPaper(items, extra, err, S);
      else if (c.style === "cupertino") card = this._renderCupertino(items, extra, err, S);
      else if (c.style === "shell") card = this._renderShell(items, extra, err, S);
      else if (c.style === "material") card = this._renderMaterial(items, extra, err, S);
      else if (c.style === "matrix") card = this._renderMatrix(items, extra, err, S);
      else if (c.style === "eink") card = this._renderEink(items, extra, err, S);
      else card = this._renderDefault(items, extra, err, S);

      const isSkin = !["default", "minimal"].includes(c.style);
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
    /* ---------- paper ---------- */
    ha-card.paper { --p-sheet: ${PAPER.sheet}; --p-ink: ${PAPER.ink}; --p-faded: ${PAPER.faded}; --p-rule: ${PAPER.rule};
      color: var(--p-ink); padding: 18px 22px 16px; border-radius: 3px; border: none;
      background-color: var(--p-sheet);
      background-image:
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .28 0 0 0 0 .18 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"),
        radial-gradient(120% 90% at 50% 0%, rgba(255,255,255,.35), transparent 60%),
        linear-gradient(180deg, transparent 85%, rgba(120,96,60,.06));
      box-shadow: 0 1px 1px rgba(60,45,25,.18), 0 6px 18px -6px rgba(40,30,15,.35);
      font-feature-settings: "kern", "liga", "onum"; }
    .p-titlebar { display: flex; align-items: center; gap: 10px; }
    .p-titlebar .logo { color: var(--p-ink) !important; }
    .p-title { font-size: 1.6em; font-weight: 700; letter-spacing: -.005em; line-height: 1.15; }
    .p-rule { height: 4px; margin: 10px 0 4px; border-top: 1.5px solid var(--p-ink); border-bottom: .75px solid var(--p-ink); }
    .p-row { padding: 12px 0 13px; }
    .p-row + .p-row { border-top: 1px solid var(--p-rule); }
    .p-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 7px; }
    .p-name { font-style: italic; font-size: 1.12em; color: var(--p-ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .p-pct { font-size: 2.3em; line-height: 1; color: var(--c); font-feature-settings: "lnum", "tnum"; white-space: nowrap; }
    .p-pct small { font-size: .55em; margin-left: 1px; vertical-align: .55em; }
    .p-track { position: relative; height: 3px; background: var(--p-rule); border-radius: 2px; margin: 0 5px 0 0; }
    .p-fill { height: 100%; background: var(--c); border-radius: 2px; transition: width .6s ease; }
    .p-blot { position: absolute; top: 50%; width: 11px; height: 11px; margin: -5.5px 0 0 -5.5px; border-radius: 50%;
      background: var(--c); box-shadow: 0 0 0 2px var(--p-sheet); transition: left .6s ease; }
    .p-pace { top: -6px; bottom: -6px; width: 1.25px; margin-left: -.6px; background: var(--p-ink); box-shadow: none; }
    .p-sub { margin-top: 7px; font-size: .9em; color: var(--p-faded); }
    .p-fc { margin-top: 2px; font-style: italic; }
    .p-fc.fc-warn { color: var(--c); }
    .p-row .spark { margin-top: 8px; height: 20px; }
    .p-row .spark path:first-child { opacity: .08 !important; }
    .p-error { display: flex; align-items: center; gap: 6px; margin-top: 10px; font-style: italic; color: ${PAPER.critical}; }
    .p-error ha-icon { --mdc-icon-size: 18px; }
    .p-stale { color: ${PAPER.warning}; }
    .paper [role="button"]:focus-visible { outline: 1.5px dashed var(--p-ink); outline-offset: 3px; border-radius: 0; }
    /* ---------- material you (Material 3, colors from the theme) ---------- */
    ha-card.material {
      --m-primary: var(--md-sys-color-primary, var(--primary-color, #6750a4));
      --m-surface: var(--md-sys-color-surface-container, var(--ha-card-background, var(--card-background-color, #f3edf7)));
      --m-on: var(--md-sys-color-on-surface, var(--primary-text-color, #1d1b20));
      --m-on-var: var(--md-sys-color-on-surface-variant, var(--secondary-text-color, #49454f));
      --m-pc: var(--md-sys-color-primary-container, color-mix(in srgb, var(--m-primary) 24%, transparent));
      --m-onpc: var(--md-sys-color-on-primary-container, var(--m-primary));
      --m-error: var(--md-sys-color-error, var(--error-color, #b3261e));
      background: var(--m-surface); color: var(--m-on); border: none; border-radius: 24px; padding: 20px 20px 16px; box-shadow: none; }
    .mu-header { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
    .mu-icon { width: 40px; height: 40px; flex: 0 0 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
      background: var(--m-pc); color: var(--m-onpc); --mdc-icon-size: 22px; }
    .mu-title { font-size: 22px; line-height: 28px; font-weight: 400; }
    .mu-row { padding: 10px 0 12px; border-radius: 16px; }
    .mu-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 10px; }
    .mu-name { font-size: 16px; line-height: 24px; font-weight: 500; letter-spacing: .01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .mu-pct { font-size: 28px; line-height: 32px; font-weight: 500; color: var(--c); font-variant-numeric: tabular-nums; white-space: nowrap; }
    .mu-pct small { font-size: 16px; font-weight: 500; margin-left: 1px; }
    .mu-progress { position: relative; height: 12px; }
    .mu-wave { position: absolute; left: 0; top: 0; height: 12px; width: max(0px, calc(var(--p) - 4px)); background: var(--c);
      -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='12'%3E%3Cpath d='M0 6Q6 1.5 12 6T24 6' fill='none' stroke='%23000' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E") left center / 24px 12px repeat-x;
              mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='12'%3E%3Cpath d='M0 6Q6 1.5 12 6T24 6' fill='none' stroke='%23000' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E") left center / 24px 12px repeat-x;
      animation: mwave 1.8s linear infinite; transition: width .5s cubic-bezier(.2,0,0,1); }
    .mu-rest { position: absolute; top: 4px; height: 4px; right: 0; left: min(100%, calc(var(--p) + 4px)); border-radius: 2px;
      background: color-mix(in srgb, var(--c) 24%, transparent); transition: left .5s cubic-bezier(.2,0,0,1); }
    .mu-stop { position: absolute; right: 0; top: 4px; width: 4px; height: 4px; border-radius: 50%; background: var(--c); }
    .mu-empty .mu-rest { left: 0; }
    .mu-full .mu-stop, .mu-full .mu-rest { display: none; }
    .mu-full .mu-wave { width: 100%; }
    .mu-pace { position: absolute; top: -2px; width: 3px; height: 16px; margin-left: -1.5px; border-radius: 2px; background: var(--m-on); opacity: .5; }
    @keyframes mwave { to { -webkit-mask-position: 24px center; mask-position: 24px center; } }
    @media (prefers-reduced-motion: reduce) { .mu-wave { animation: none; } }
    .mu-sub { margin-top: 8px; font-size: 14px; line-height: 20px; color: var(--m-on-var); letter-spacing: .015em; }
    .mu-fc { margin-top: 0; }
    .mu-fc.fc-warn { color: var(--m-error); font-weight: 500; }
    .mu-row .spark { margin-top: 10px; height: 24px; }
    .mu-note { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 14px; color: var(--m-on-var); }
    .mu-note ha-icon { --mdc-icon-size: 18px; }
    .mu-error { color: var(--m-error); }
    .material [role="button"]:focus-visible { outline: 2px solid var(--m-primary); outline-offset: 2px; border-radius: 16px; }

    /* ---------- dot matrix ---------- */
    ha-card.matrix { background-color: #0b0b0b; color: #f4f4f4; border: 1px solid #222; border-radius: 14px; padding: 16px 18px 14px;
      background-image: radial-gradient(circle, #161616 1px, transparent 1.3px); background-size: 6px 6px; }
    .matrix svg { display: block; overflow: visible; }
    .matrix .dm-off { fill: ${MATRIX.off}; }
    .matrix .dm-on { fill: var(--dc); filter: drop-shadow(0 0 .35px var(--dc)); }
    .matrix .dm-pace { fill: ${MATRIX.accent}; }
    .dm-title { margin-bottom: 12px; }
    .dm-head-text { height: 21px; width: auto; max-width: 100%; }
    .dm-row { padding: 8px 0 10px; }
    .dm-row + .dm-row { border-top: 1px dashed #262626; }
    .dm-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 10px; margin-bottom: 8px; }
    .dm-label { height: 14px; width: auto; max-width: 60%; }
    .dm-big { height: 35px; width: auto; flex: 0 0 auto; }
    .dm-bar { width: 100%; height: auto; }
    .dm-subline { margin-top: 7px; }
    .dm-small { height: 10.5px; width: auto; max-width: 100%; }
    .dm-note { display: flex; align-items: center; gap: 6px; margin-top: 8px; font-size: 12px; color: #8c8c8c; }
    .dm-note ha-icon { --mdc-icon-size: 16px; }
    .dm-error { color: ${MATRIX.accent}; }
    .dm-stale { color: ${MATRIX.warning}; }
    .matrix [role="button"]:focus-visible { outline: 1px dashed #f4f4f4; outline-offset: 2px; border-radius: 4px; }

    /* ---------- e-ink (pure black and white, no motion) ---------- */
    ha-card.eink { background: #fff; color: #000; border: 2px solid #000; border-radius: 6px; padding: 14px 16px 12px; box-shadow: none;
      font-weight: 600; -webkit-font-smoothing: none; }
    .eink * { transition: none !important; animation: none !important; }
    .ei-header { display: flex; align-items: center; gap: 10px; padding-bottom: 8px; margin-bottom: 4px; border-bottom: 3px solid #000; }
    .ei-header .logo { color: #000 !important; }
    .ei-title { font-size: 21px; font-weight: 800; letter-spacing: -.01em; }
    .ei-row { padding: 10px 0 8px; }
    .ei-row + .ei-row { border-top: 1px solid #000; }
    .ei-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 6px; }
    .ei-name { font-size: 16px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ei-pct { font-size: 30px; line-height: 1; font-weight: 800; font-variant-numeric: tabular-nums; white-space: nowrap; padding: 0 4px; }
    .ei-pct.ei-crit { background: #000; color: #fff; border-radius: 3px; }
    .ei-bar { height: 18px; border: 2px solid #000; border-radius: 3px; background: #fff; padding: 2px; box-sizing: border-box; }
    .ei-fill { height: 100%; background: #000; border-radius: 1px; }
    .ei-scale { position: relative; height: 7px; }
    .ei-pace { position: absolute; top: 1px; width: 0; height: 0; margin-left: -6px; border: 6px solid transparent; border-top: 0; border-bottom: 6px solid #000; }
    .ei-sub { margin-top: 3px; font-size: 13px; font-weight: 600; color: #000; }
    .ei-warn { font-weight: 800; }
    .ei-row .spark { margin-top: 4px; height: 22px; }
    .ei-row .spark path:first-child { display: none; }
    .ei-row .spark .spark-line { stroke-width: 2; }
    .ei-note { display: flex; align-items: center; gap: 6px; margin-top: 8px; font-size: 13px; font-weight: 700; color: #000; }
    .ei-note ha-icon { --mdc-icon-size: 18px; color: #000; }
    .eink [role="button"]:focus-visible { outline: 3px solid #000; outline-offset: 2px; border-radius: 4px; }

    /* ---------- shell (Linux terminal emulator) ---------- */
    ha-card.shell { background: #171717; color: #d3d7cf; border: 1px solid #2e2e2e; border-radius: 10px; font-size: 13.5px;
      box-shadow: 0 10px 30px -10px rgba(0,0,0,.6); }
    .sh-bar { position: relative; display: flex; align-items: center; justify-content: center; gap: 8px; height: 34px; padding: 0 92px;
      background: #2b2b2b; border-bottom: 1px solid #111; color: #c0c0c0; font: 600 13px/1 Cantarell, "Ubuntu", "Noto Sans", system-ui, sans-serif; }
    .sh-bar .logo { position: absolute; left: 12px; width: 16px !important; height: 16px !important; --mdc-icon-size: 16px !important; }
    .sh-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .sh-wbtns { position: absolute; right: 8px; display: flex; gap: 6px; }
    .sh-wbtns i { font-style: normal; width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;
      background: #3a3a3a; color: #ddd; font-size: 11px; }
    .sh-body { padding: 10px 12px 12px; line-height: 1.45; }
    .sh-line { white-space: nowrap; overflow: hidden; }
    .sh-user { color: ${SHELL.bgreen}; font-weight: 700; }
    .sh-path { color: ${SHELL.blue}; font-weight: 700; }
    .sh-cmd { color: #eeeeec; }
    .sh-cursor { display: inline-block; width: .6em; height: 1.1em; vertical-align: -.2em; background: #d3d7cf; animation: blink 1.1s steps(1) infinite; }
    .sh-grid { display: grid; grid-template-columns: max-content 1fr; column-gap: 1ch; margin: 4px 0 6px; }
    .sh-row { display: contents; }
    .sh-label { color: ${SHELL.cyan}; white-space: nowrap; }
    .sh-meter { display: flex; min-width: 0; color: #eeeeec; font-weight: 700; }
    .sh-track { position: relative; flex: 1; min-width: 0; overflow: hidden; white-space: nowrap; }
    .sh-fill { display: inline-block; overflow: hidden; vertical-align: top; color: var(--c); font-weight: 400; transition: width .4s steps(20); }
    .sh-pace { position: absolute; top: 0; font-style: normal; color: #eeeeec; opacity: .55; transform: translateX(-50%); font-weight: 400; }
    .sh-pct { position: absolute; right: 0; top: 0; padding-left: 1ch; background: #171717; color: #eeeeec; }
    .sh-notes { grid-column: 2; margin-bottom: 4px; }
    .sh-note { color: ${SHELL.dim}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sh-spark { letter-spacing: 0; line-height: 1.2; }
    .sh-warn { color: ${SHELL.yellow}; }
    .sh-err { color: ${SHELL.red}; }
    .sh-msg { display: flex; gap: 6px; align-items: center; white-space: nowrap; }
    .sh-msg ha-icon { display: none; }
    .sh-msg.sh-warn::before { content: "warning:"; }
    .sh-msg.sh-err::before { content: "error:"; }
    .shell [role="button"]:focus-visible { outline: none; }
    .shell .sh-row:focus-visible .sh-label { background: #d3d7cf; color: #171717; }
    /* ---------- cupertino (Apple-style materials and type) ---------- */
    ha-card.cupertino { --cu-radius: 22px; padding: 16px; border: none; border-radius: var(--cu-radius);
      -webkit-backdrop-filter: saturate(180%) blur(30px); backdrop-filter: saturate(180%) blur(30px);
      -webkit-font-smoothing: antialiased; letter-spacing: -.01em; font-size: 15px; }
    ha-card.cu-light { --cu-bg: rgba(242,242,247,.78); --cu-cell: rgba(255,255,255,.92); --cu-label: #000; --cu-label2: rgba(60,60,67,.6);
      --cu-label3: rgba(60,60,67,.3); --cu-sep: rgba(60,60,67,.18); --cu-fillbg: rgba(120,120,128,.16);
      background: var(--cu-bg); color: var(--cu-label); box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08); }
    ha-card.cu-dark { --cu-bg: rgba(28,28,30,.72); --cu-cell: rgba(44,44,46,.72); --cu-label: #fff; --cu-label2: rgba(235,235,245,.6);
      --cu-label3: rgba(235,235,245,.3); --cu-sep: rgba(84,84,88,.6); --cu-fillbg: rgba(120,120,128,.32);
      background: var(--cu-bg); color: var(--cu-label); box-shadow: 0 0 0 .5px rgba(255,255,255,.08) inset, 0 8px 28px rgba(0,0,0,.35); }
    .cu-header { display: flex; align-items: center; gap: 10px; margin: 0 4px 12px; }
    .cu-app { width: 30px; height: 30px; flex: 0 0 30px; border-radius: 7px; display: inline-flex; align-items: center; justify-content: center;
      color: #fff; --mdc-icon-size: 19px; background: linear-gradient(180deg, color-mix(in srgb, var(--a) 82%, #fff), var(--a));
      box-shadow: 0 .5px 0 rgba(255,255,255,.35) inset, 0 1px 2px rgba(0,0,0,.18); }
    .cu-title { font-size: 22px; font-weight: 700; letter-spacing: -.022em; line-height: 1.15; }
    .cu-group { background: var(--cu-cell); border-radius: 12px; overflow: hidden; }
    .cu-row { padding: 11px 16px 12px; position: relative; }
    .cu-row + .cu-row::before { content: ""; position: absolute; top: 0; left: 16px; right: 0; height: .5px; background: var(--cu-sep); }
    .cu-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin-bottom: 8px; }
    .cu-name { font-size: 15px; font-weight: 400; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .cu-pct { font-family: ui-rounded, "SF Pro Rounded", -apple-system, system-ui, sans-serif; font-size: 22px; font-weight: 600;
      line-height: 1; color: var(--c); font-variant-numeric: tabular-nums; letter-spacing: -.01em; white-space: nowrap; }
    .cu-pct small { font-size: 13px; font-weight: 600; margin-left: 1px; }
    .cu-track { position: relative; height: 6px; border-radius: 3px; background: var(--cu-fillbg); }
    .cu-fill { height: 100%; border-radius: 3px; background: var(--c); transition: width .5s cubic-bezier(.25,.1,.25,1); }
    .cu-pace { top: -3px; bottom: -3px; width: 2px; margin-left: -1px; border-radius: 1px; background: var(--cu-label); box-shadow: 0 0 0 1.5px var(--cu-cell); opacity: .55; }
    .cu-sub { margin-top: 6px; font-size: 13px; color: var(--cu-label2); letter-spacing: -.005em; }
    .cu-fc { margin-top: 2px; }
    .cu-fc.fc-warn { color: var(--cu-orange); font-weight: 500; }
    .cu-row .spark { margin-top: 8px; height: 22px; }
    .cu-note { display: flex; align-items: center; gap: 6px; margin: 10px 4px 0; font-size: 13px; color: var(--cu-label2); }
    .cu-note ha-icon { --mdc-icon-size: 16px; }
    .cu-error { color: var(--cu-red); }
    .cu-stale { color: var(--cu-orange); }
    .cupertino [role="button"]:focus-visible { outline: 3px solid color-mix(in srgb, var(--cu-tint) 60%, transparent); outline-offset: -3px; border-radius: 12px; }
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

  const editorSchema = (E, nameFields, fontMode, style) => {
    const styleField = {
      name: "style",
      selector: select(STYLES.map((s) => ({ value: s, label: E[`style_${s}`] }))),
    };
    const layoutField = {
      name: "layout",
      selector: select([
        { value: "bars", label: E.layout_bars },
        { value: "columns", label: E.layout_columns },
        { value: "rings", label: E.layout_rings },
      ]),
    };
    // "layout" only applies to the default style, so the skins hide it
    return [
      !style || style === "default" ? pair(styleField, layoutField) : styleField,
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
  };

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
      this._form.schema = editorSchema(E, nameFields, fontMode, cfg.style);
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
        "Session and weekly limits from the Claude Usage integration: bars, rings, minimal and nine skins from terminal to e-ink.",
      preview: true,
    });
  }

  console.info(
    `%c CLAUDE-USAGE-CARD %c v${CARD_VERSION} `,
    "color:#fff;background:#d97757;font-weight:700;border-radius:3px 0 0 3px",
    "color:#d97757;background:#fff;font-weight:700;border-radius:0 3px 3px 0"
  );
})();
