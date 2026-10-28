# Claude Usage Card

A Lovelace card that shows your Claude subscription limits (5-hour session, weekly limits, per-model limits, extra usage) as bars or rings, with a countdown to each reset.

![Claude Usage Card: default, terminal, retro and synthwave styles](https://raw.githubusercontent.com/darki79/claude-usage-card/main/docs/images/overview.png)

The card only reads sensors. The data comes from the **[Claude Usage integration](https://github.com/trickv/hass-claude-usage)**, which you need to install first.

> This is a community project. It is not affiliated with or endorsed by Anthropic.

## Features

- Detects all limit sensors of the integration automatically, including new model limits
- Three layouts: `bars` (stacked), `columns` (side by side) and `rings`
- Minimal style: one compact line per limit
- Three retro skins: `terminal` (amber CRT), `retro` (90s desktop window) and `synthwave` (neon sunset)
- Countdown and/or local time of the next reset
- Colors by your own thresholds or by the `severity` the API reports
- Configurable logo: any MDI icon or your own image
- Extra usage (only when enabled) and API error hint
- Visual editor, English and German
- Pace marker: shows where you would be with even usage across the period
- Forecast: when the limit will be reached at the current rate (from HA history)
- Mini history: sparkline of the last hours
- Configurable tap, hold and double tap actions (default: more-info)
- Hint when the data is stale, for example during an API rate limit
- Several accounts in one card: labels, extra usage and API errors show the account name (or use `filter` for one card per account)

## Requirements

- Home Assistant with the **[Claude Usage integration](https://github.com/trickv/hass-claude-usage)** installed and set up. It is a custom integration and is available through HACS as a custom repository. This card shows nothing without it.
- The recorder (enabled by default) for the forecast and the mini history.

## Installation

### HACS

1. HACS → three-dot menu → **Custom repositories** → add this repository's URL, type **Dashboard**
2. Search for **Claude Usage Card** and download it
3. Reload the browser

### Manual

1. Copy `dist/claude-usage-card.js` to `/config/www/`
2. Settings → Dashboards → three-dot menu → **Resources** → add `/local/claude-usage-card.js` as **JavaScript module**

## Usage

Add the card in the dashboard editor (search for **Claude Usage Card**) or in YAML. Without any options it detects all limit sensors of the integration:

```yaml
type: custom:claude-usage-card
```

All screenshots below use the same data: session 46 %, weekly 63 %, Opus 88 %.

## Styles

### Bars (default)

Stacked bars that follow your Home Assistant theme. Shown here with the optional mini history.

<img src="https://raw.githubusercontent.com/darki79/claude-usage-card/main/docs/images/bars.png" alt="Bars layout" width="400">

```yaml
type: custom:claude-usage-card
show_history: true
history_hours: 6
```

### Columns

Bars side by side, one column per limit. Good for wide cards.

<img src="https://raw.githubusercontent.com/darki79/claude-usage-card/main/docs/images/columns.png" alt="Columns layout" width="520">

```yaml
type: custom:claude-usage-card
layout: columns
```

### Rings

<img src="https://raw.githubusercontent.com/darki79/claude-usage-card/main/docs/images/rings.png" alt="Rings layout" width="460">

```yaml
type: custom:claude-usage-card
layout: rings
```

### Minimal

One compact line per limit with percentage and time to reset. A warning icon appears when the forecast says the limit will be reached before the reset.

<img src="https://raw.githubusercontent.com/darki79/claude-usage-card/main/docs/images/minimal.png" alt="Minimal style" width="360">

```yaml
type: custom:claude-usage-card
style: minimal
title: Claude
```

### Terminal

Amber CRT look with scanlines and the embedded pixel font.

<img src="https://raw.githubusercontent.com/darki79/claude-usage-card/main/docs/images/terminal.png" alt="Terminal skin" width="380">

```yaml
type: custom:claude-usage-card
style: terminal
```

### Retro window

A 90s desktop window with segmented progress bars.

<img src="https://raw.githubusercontent.com/darki79/claude-usage-card/main/docs/images/retro.png" alt="Retro window skin" width="380">

```yaml
type: custom:claude-usage-card
style: retro
```

### Synthwave

Neon sunset with a perspective grid.

<img src="https://raw.githubusercontent.com/darki79/claude-usage-card/main/docs/images/synthwave.png" alt="Synthwave skin" width="380">

```yaml
type: custom:claude-usage-card
style: synthwave
```

The skins use their own colors. With `status_colors: true` they use the threshold colors (green, orange, red) instead. `font` switches the font, for example `font: monospace` or `font: custom` with `font_custom: "'Press Start 2P'"`.

## More examples

Custom names, thresholds and a countdown only:

```yaml
type: custom:claude-usage-card
title: Claude
warning_threshold: 50
critical_threshold: 80
reset_display: relative
names:
  sensor.claude_usage_my_account_session_limit_usage: Session
  sensor.claude_usage_my_account_weekly_all_models_limit_usage: Week
```

One card per account when you have several:

```yaml
type: custom:claude-usage-card
filter: my_account
```

Open the history on hold instead of the more-info dialog on tap:

```yaml
type: custom:claude-usage-card
tap_action:
  action: none
hold_action:
  action: navigate
  navigation_path: /history
```

Hide the pace marker and forecast, show only the bars:

```yaml
type: custom:claude-usage-card
show_pace: false
show_forecast: false
show_reset: false
```

## Options

| Option | Default | Description |
|---|---|---|
| `title` | localized "Claude Usage" | Card title |
| `show_title` | `true` | Show the title |
| `style` | `default` | `default` (follows your theme), `minimal` (one compact line per limit), `terminal`, `retro` or `synthwave` |
| `layout` | `bars` | `bars` (stacked), `columns` (side by side) or `rings` (style `default` only) |
| `show_logo` | `true` | Show the logo |
| `icon` | `mdi:creation` | MDI icon used as logo |
| `logo_url` | – | Image used as logo instead of the icon, e.g. `/local/my-logo.svg` |
| `logo_color` | `#d97757` | Icon color (any CSS color or `[r, g, b]`) |
| `logo_size` | `28` | Logo size in px |
| `entities` | auto | List of limit sensors; empty means auto-detect. Items can be strings or `{entity, name}` |
| `exclude` | `[]` | Sensors to hide in auto mode |
| `filter` | – | Only auto-detect sensors whose entity ID contains this text (useful with several accounts) |
| `names` | `{}` | Custom labels per entity ID (also editable in the visual editor) |
| `color_mode` | `threshold` | `threshold` or `severity` |
| `warning_threshold` | `60` | Percent from which the warning color is used |
| `critical_threshold` | `85` | Percent from which the critical color is used |
| `color_ok` / `color_warning` / `color_critical` | theme colors | Any CSS color or `[r, g, b]`. The visual editor shows the current theme colors and only writes `[r, g, b]` when you change a color |
| `status_colors` | `false` | Skins: use threshold/severity colors instead of the skin palette |
| `font` | `auto` | Skins: `auto` (pixel for terminal and synthwave, classic for retro), `pixel` (embedded VT323 subset), `classic`, `theme`, `monospace` or `custom` |
| `font_custom` | – | CSS `font-family` used when `font: custom` |
| `color_values` | `true` | Color the percentages like the bars |
| `show_reset` | `true` | Show the reset line |
| `reset_display` | `both` | `relative`, `absolute` or `both` |
| `show_extra_usage` | `true` | Show extra usage when it is enabled on the account |
| `show_api_error` | `true` | Show a hint when the integration reports API errors |
| `show_pace` | `true` | Marker for even usage (session = 5 h, weekly = 7 days) |
| `show_forecast` | `true` | Projected time the limit is reached; rate from the last hour (session) or last 24 h (weekly) |
| `show_history` | `false` | Sparkline of the last hours from HA history |
| `stale_minutes` | `30` | Show "Last update … ago" when no fresh data arrived for this many minutes (`0` = off) |
| `tap_action` / `hold_action` / `double_tap_action` | `more-info` / `none` / `none` | Standard Home Assistant actions; `entity` is the tapped sensor |
| `history_hours` | `6` | Time span of the sparkline in hours |

## Logo

The card ships without any third-party logo. To use your own image, put it into `/config/www/` and set `logo_url: /local/<file>`. Make sure you have the right to use the image.

## Font

The terminal and synthwave styles embed a subset of [VT323](https://github.com/phoikoi/VT323) (SIL Open Font License 1.1, see `fonts-OFL-VT323.txt`). The font is bundled in the JS file, so no external request is made.

## License

MIT (card code). The embedded font is licensed under the SIL Open Font License 1.1.
