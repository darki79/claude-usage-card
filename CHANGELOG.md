# Changelog

## 1.2.1

- **Ten new languages**: Italian, Polish, Portuguese, Swedish, Danish, Norwegian (Bokmål), Finnish, Czech, Romanian and Icelandic, for the card and the visual editor. The card now speaks 15 languages and picks the one set in Home Assistant; any other language falls back to English.
- Translations are new: if a wording sounds off in your language, please open an issue.

## 1.2.0

- **Smooth updates**: the card now updates in place instead of redrawing itself. Bars and rings glide to new values, and the Material You wave no longer restarts every minute.
- **New option `show_forecast_ok`**: turn off "Lasts until reset" and see the forecast only when the limit will be hit. Also in the visual editor.
- **New languages**: French, Spanish and Dutch, for the card and the visual editor.
- **Several accounts**: the "sign-in expired" and "no data" messages now come from the account the card shows, not from any account.
- `warning_threshold` greater than `critical_threshold` is now reported as a configuration error. Before, the warning color silently never showed.
- README: example automation for a notification at 80 % of the session limit.

## 1.1.1

Just a quick fix: the card now tells you why it is empty.

- When the sensors have no data, the card no longer says "No Claude Usage sensors found". It shows **"Claude sign-in expired"** when the integration asks you to sign in again, or **"Claude Usage has no data right now"** with the time since the last data and the reason the integration reports.
- For admins, a tap on the message opens the integration page. Other users see the message without the link, because Home Assistant shows the integration status to admins only.
- The old hint stays for the case where the integration is not installed.
- Works in every style and skin, in English and German. The render test covers the new cases.

## 1.1.0

### New skins

- **`paper`**: ink on paper with serif type, a double rule under the title and ink-blot markers on the bars.
- **`cupertino`**: Apple-style look with a translucent material, an inset grouped list, system colors and rounded numbers. Follows the light or dark mode of the theme.
- **`shell`**: a Linux terminal window with prompt, htop-style meters, reset times as comments, warnings as `warning:` lines and the history as block characters (▁▂▃▅▇). The prompt uses the Home Assistant user name and the name of the home; umlauts are spelled out (`ü` → `ue`).
- **`material`**: Material You (Material 3) with the wavy progress indicator, gap and stop dot. Colors come from the theme, including the `--md-sys-color-*` palette of the Material You utilities. The wave stands still with reduced motion.
- **`matrix`**: dot matrix display. All text and numbers use a built-in 5×7 dot font, bars are rows of 40 LED dots, the pace marker is a red dot column.
- **`eink`**: pure black and white without motion or shadows, for e-paper wall displays. Critical values are inverted, warnings get a ▲.

`status_colors: true` works with all new skins. `paper`, `cupertino`, `shell` and `matrix` use their own matching shades for OK, warning and critical.

### Changes

- Visual editor: the **Layout** field (bars, columns, rings) only shows for the default style, because the skins ignore it.
- Visual editor: the skin section is now called **Skins**, and all new skins are in the style list (English and German).
- `font: auto` picks the skin's own classic font for the new skins.
- Card picker description lists the new skins.

### Development

- New `test/render.test.js` renders every style (with and without status colors, history and relative reset times, in English and German) and checks the output. It runs in the Validate workflow.
- New `tools/screenshots/`: a gallery page with fixed sample data and `shoot.mjs`, which writes all images in `docs/images/` including the overview.
- README: sections and screenshots for all new skins, installation through the Home Assistant Marketplace (2026.11 and later) with HACS as the fallback for older versions.

## 1.0.2

- Hold action is cancelled when the pointer leaves the pressed item.
- Forecast test added to the Validate workflow.

## 1.0.1

- README images use absolute URLs, so they show in HACS.

## 1.0.0

- First public release.
