import { Args, Command } from "@oclif/core"
import { createNvim } from "../utils/nvim"
import type { Zalgo, HlGroups, HlGroupsNum, ColorFormat } from "../types"
import { type Neovim } from "neovim"
import { toColorFormat } from "../utils/colors"

export default class ExtractColors extends Command {
  static async extractColors(
    colorscheme: string | false,
    {
      nvim = createNvim() as Zalgo<Neovim>,
      format = "rgb" as ColorFormat,
      ns = 0,
      link = true,
    } = {},
  ) {
    const resolved = await nvim

    // Set the colorscheme
    if (colorscheme) {
      await resolved.command(`colorscheme ${colorscheme}`)
    }

    // Get all highlight groups
    const hlGroups = (await resolved.request("nvim_get_hl", [
      ns,
      { link },
    ])) as HlGroupsNum

    return format ? toColorFormat(hlGroups, format) : hlGroups
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

export const extractColors = ExtractColors.extractColors
