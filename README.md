# nvim-color-extractor

> Neovim color scheme extractor and transformer, with ghostty output

````sh
$ nvim-color-extractor --help

USAGE
  $ nvim-color-extractor [COMMAND]

COMMANDS
  nvim:extract      Extract highlight groups from a colorscheme with RGB color values
  nvim:extract-all  Extract highlight groups for all available colorschemes
  nvim:list         List all available Neovim color schemes
  nvim:parse-theme  Parse a Neovim color theme file (bad, hack)
   ghostty:convert   Convert a Neovim colorscheme to Ghostty theme format
   ghostty:random    Convert a random Neovim colorscheme to Ghostty theme format, and set ghostty to use
   opencode:export   Export a Neovim colorscheme to OpenCode theme format

# OpenCode Export

Export nvim colorschemes to [OpenCode](https://opencode.ai/) theme format. OpenCode themes use a JSON format with comprehensive color definitions for UI elements, syntax highlighting, and markdown rendering.

## Usage

```sh
# Export a colorscheme to OpenCode theme format
node export-opencode-simple.js gruvbox

# Export with a custom theme name
node export-opencode-simple.js solarized --name my-solarized
````

The exported theme follows OpenCode's [theme specification](https://opencode.ai/docs/themes/) and includes:

- Color definitions for all UI elements
- Syntax highlighting colors
- Markdown rendering colors
- Dark and light variants (using the same colors by default)

## Example Output

```json
{
  "$schema": "https://opencode.ai/theme.json",
  "defs": {
    "custom0": "#282828",
    "custom1": "#ebdbb2",
    ...
  },
  "theme": {
    "primary": { "dark": "custom4", "light": "custom4" },
    "secondary": { "dark": "custom5", "light": "custom5" },
    ...
  }
}
```

# Ghostty Output

Imports `Normal`, `Cursor` and `Visual` (selection) from the colorscheme.

Then extracts all other foreground colors, and randomly assigns them to the 16-color palette. Ignoring colors with a background, since those might not have adequate contrast. This is pretty silly: suggestions for better heuristics welcome. 😅

# Details

This program relies on the npm package [`neovim`](https://www.npmjs.com/package/neovim) to work, running an embedded headless neovim for it's operation.

There's a couple reasons for this. Even just finding nvim colorschemes presents significant difficulty, as users can have all manners of configuration that could change where colorschemes are located. Further, vim/neovim colorschemes are arbitrary programs, in either vimscript or lua or even more exotic variants. Rather that attempt a partial reimplementation of these nvim tasks, we rely on the `neovim` package to find and load colorschemes.
