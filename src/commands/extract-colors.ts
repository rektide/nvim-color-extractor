import { Args, Command } from "@oclif/core"
import { createNvim } from "../utils/nvim"
import { Neovim } from "neovim"

export function colorIntToRGB(
  color?: number,
): [number, number, number] | undefined {
  return color
    ? [
      (color >> 16) & 0xff, // red
      (color >> 8) & 0xff, // green
      color & 0xff, // blue
    ]
    : undefined
}
function processHighlightGroups(hlGroups: Record<string, any>) {
  for (const key in hlGroups) {
    const color = hlGroups[key]
    color.fg = colorIntToRGB(color.fg)
    color.bg = colorIntToRGB(color.back)
    color.sp = colorIntToRGB(color.sp)
  }
  return hlGroups
}

export default class ExtractColors extends Command {
  static description =
    "Extract highlight groups from a colorscheme with RGB color values"
  static examples = [
    "<%= config.bin %> <%= command.id %> gruvbox",
    "<%= config.bin %> <%= command.id %> solarized",
  ]

  static args = {
    colorscheme: Args.string({
      description: "Name of colorscheme to extract",
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const { args } = await this.parse(ExtractColors)

    let nvim
    try {
      nvim = await createNvim()

      // Set the colorscheme
      await nvim.command(`colorscheme ${args.colorscheme}`)

      // Get all highlight groups
      const hlGroups = (await nvim.request("nvim_get_hl", [0, {}])) as Record<
        string,
        any
      >

      // Process and convert colors
      processHighlightGroups(hlGroups)

      // Output as pretty JSON
      console.log(JSON.stringify(hlGroups, null, "\t"))
    } catch (error) {
      this.error(`Failed to extract colors: ${error}`, { exit: 1 })
    }
    nvim?.quit()
  }
}
