# Changelog

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
