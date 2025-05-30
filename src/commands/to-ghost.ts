import { Command } from "@oclif/core"
import { createNvim } from "../utils/nvim"
import { extractColors } from "./extract-colors"
import { HlGroupsHex } from "../types"
import fs from "fs"
import path from "path"
import os from "os"

function getRandomColor(colors: Set<string>): string {
  const arr = Array.from(colors)
  return arr[Math.floor(Math.random() * arr.length)]
}

export default class ToGhost extends Command {
  static description = "Convert a Neovim colorscheme to Ghostty theme format"
  static examples = ["<%= config.bin %> <%= command.id %> gruvbox"]

  static args = {
    colorscheme: Args.string({
      description: "Name of colorscheme to convert",
      required: true,
    }),
  }

  public async run(): Promise<void> {
    const { args } = await this.parse(ToGhost)
    let nvim

    try {
      nvim = await createNvim()

      // Extract colors in hex format
      const hlGroups = await extractColors(args.colorscheme, {
        nvim,
        format: "hex",
      }) as HlGroupsHex

      // Collect all unique foreground colors
      const colors = new Set<string>()
      for (const group of Object.values(hlGroups)) {
        if (group.fg) colors.add(group.fg)
      }

      if (colors.size === 0) {
        throw new Error("No colors found in colorscheme")
      }

      // Generate Ghostty theme content
      let themeContent = `# ${args.colorscheme} theme generated from Neovim colorscheme\n\n`
      themeContent += `foreground = ${getRandomColor(colors)}\n`
      themeContent += `background = #000000\n`
      themeContent += `cursor = ${getRandomColor(colors)}\n\n`

      // Add some sample color definitions
      const colorArray = Array.from(colors)
      for (let i = 0; i < Math.min(16, colorArray.length); i++) {
        themeContent += `color${i} = ${colorArray[i]}\n`
      }

      // Ensure Ghostty config directory exists
      const ghosttyDir = path.join(os.homedir(), ".config", "ghostty")
      if (!fs.existsSync(ghosttyDir)) {
        fs.mkdirSync(ghosttyDir, { recursive: true })
      }

      // Write theme file
      const themePath = path.join(ghosttyDir, `${args.colorscheme}.conf`)
      fs.writeFileSync(themePath, themeContent)

      this.log(`Successfully created Ghostty theme at: ${themePath}`)
    } catch (error) {
      this.error(`Failed to create Ghostty theme: ${error}`, { exit: 1 })
    } finally {
      nvim?.quit()
    }
  }
}
