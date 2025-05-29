import { Command } from "@oclif/core"
import { createNvim } from "../utils/nvim"
import { Neovim } from "neovim"

function colorIntToRGB(color: number): [number, number, number] {
  return [
    (color >> 16) & 0xff, // red
    (color >> 8) & 0xff, // green
    color & 0xff, // blue
  ]
}

function processHighlightGroups(hlGroups: Record<string, any>) {
  const result: Record<string, any> = {}
  for (const [name, attrs] of Object.entries(hlGroups)) {
    const processed: Record<string, any> = {}
    if (attrs.foreground) processed.fg = colorIntToRGB(attrs.foreground)
    if (attrs.background) processed.bg = colorIntToRGB(attrs.background)
    if (attrs.special) processed.sp = colorIntToRGB(attrs.special)
    if (attrs.bold) processed.bold = attrs.bold
    if (attrs.italic) processed.italic = attrs.italic
    if (attrs.underline) processed.underline = attrs.underline
    if (attrs.undercurl) processed.undercurl = attrs.undercurl
    if (attrs.reverse) processed.reverse = attrs.reverse
    result[name] = processed
  }
  return result
}

export default class ExtractColors extends Command {
  static description = "Extract current highlight groups with RGB color values"
  static examples = ["<%= config.bin %> <%= command.id %>"]

  public async run(): Promise<void> {
    try {
      const nvim = await createNvim()

      // Get all highlight groups
      const hlGroups = (await nvim.call("vim.api.get_hl", [0, {}])) as Record<
        string,
        any
      >

      // Process and convert colors
      const processed = processHighlightGroups(hlGroups)

      // Output as pretty JSON
      console.log(JSON.stringify(processed, null, 2))

      await nvim.quit()
    } catch (error) {
      this.error(`Failed to extract colors: ${error}`, { exit: 1 })
    }
  }
}
