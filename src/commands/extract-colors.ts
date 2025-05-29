import { Args, Command } from "@oclif/core"
import { createNvim } from "../utils/nvim"
import { Zalgo } from "../types"
import { type Neovim } from "neovim"

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
  static async extractColors(
    colorscheme: string,
    {
      nvim = createNvim() as Zalgo<Neovim>,
      rgb = true,
      ns = 0,
      link = true,
    } = {},
  ) {
    const resolved = await nvim

    // Set the colorscheme
    await resolved.command(`colorscheme ${colorscheme}`)

    // Get all highlight groups
    const hlGroups = (await resolved.request("nvim_get_hl", [
      ns,
      { link },
    ])) as Record<string, any>

    if (rgb) {
      // Process and convert colors
      processHighlightGroups(hlGroups)
    }

    return hlGroups
  }

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

      const hlGroups = await ExtractColors.extractColors(args.colorscheme, {
        nvim,
      })

      console.log(JSON.stringify(hlGroups, null, "\t"))
    } catch (error) {
      this.error(`Failed to extract colors: ${error}`, { exit: 1 })
    }
    nvim?.quit()
  }
}
