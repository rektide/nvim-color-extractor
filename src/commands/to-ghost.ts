import { Args, Command } from "@oclif/core"
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

  private static prepareThemesDirectory(): string {
    const xdgConfigDir = process.env.XDG_CONFIG_DIR || path.join(os.homedir(), ".config")
    const ghosttyDir = path.join(xdgConfigDir, "ghostty", "themes")
    if (!fs.existsSync(ghosttyDir)) {
      fs.mkdirSync(ghosttyDir, { recursive: true })
    }
    return ghosttyDir
  }

  private static openFile(ghosttyDir: string, colorscheme: string): fs.WriteStream {
    const themePath = path.join(ghosttyDir, colorscheme)
    return fs.createWriteStream(themePath)
  }

  private static writeTheme(
    file: fs.WriteStream,
    colorscheme: string,
    hlGroups: HlGroupsHex
  ): void {
    // Collect all unique foreground colors
    const colors = new Set<string>()
    for (const group of Object.values(hlGroups)) {
      if (group.fg) colors.add(group.fg)
    }

    if (colors.size === 0) {
      file.end()
      throw new Error("No colors found in colorscheme")
    }
    // Write header
    file.write(`# ${colorscheme} theme generated from Neovim colorscheme\n\n`)
    file.write(`foreground = ${getRandomColor(colors)}\n`)
    file.write(`background = #000000\n`)
    file.write(`cursor = ${getRandomColor(colors)}\n\n`)

    // Create palette with random unique colors
    const availableColors = Array.from(colors)
    for (let i = 0; i < Math.min(16, availableColors.length); i++) {
      if (availableColors.length === 0) {
        file.end()
        throw new Error('Not enough unique colors for palette')
      }
      const randomIndex = Math.floor(Math.random() * availableColors.length)
      const color = availableColors[randomIndex]
      file.write(`palette = ${i}=${color}\n`)
      availableColors.splice(randomIndex, 1) // Remove used color
    }

    file.end()
  }

  public async run(): Promise<void> {
    const { args } = await this.parse(ToGhost)
    let nvim

    try {
      nvim = await createNvim()

      // Extract colors in hex format
      const hlGroups = (await extractColors(args.colorscheme, {
        nvim,
        format: "hex",
      })) as HlGroupsHex

      const ghosttyDir = ToGhost.prepareThemesDirectory()
      const file = ToGhost.openFile(ghosttyDir, args.colorscheme)
      ToGhost.writeTheme(file, args.colorscheme, hlGroups)

      console.log(`Successfully created Ghostty theme at: ${path.join(ghosttyDir, args.colorscheme)}`)
    } catch (error) {
      console.error(`Failed to create Ghostty theme: ${error}`, { exit: 1 })
    } finally {
      nvim?.quit()
    }
  }
}
