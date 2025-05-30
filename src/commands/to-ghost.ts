import { Args, Command } from "@oclif/core"
import { createNvim } from "../utils/nvim"
import { extractColors } from "./extract-colors"
import { HlGroupsHex } from "../types"
import fs from "fs"
import path from "path"
import os from "os"

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
    const xdgConfigDir =
      process.env.XDG_CONFIG_DIR || path.join(os.homedir(), ".config")
    const ghosttyDir = path.join(xdgConfigDir, "ghostty", "themes")
    if (!fs.existsSync(ghosttyDir)) {
      fs.mkdirSync(ghosttyDir, { recursive: true })
    }
    return ghosttyDir
  }

  private static openFile(
    ghosttyDir: string,
    colorscheme: string,
  ): fs.WriteStream {
    const themePath = path.join(ghosttyDir, colorscheme)
    return fs.createWriteStream(themePath)
  }

  private static writeTheme(
    file: fs.WriteStream,
    colorscheme: string,
    hlGroups: HlGroupsHex,
  ): void {
    // Validate Normal group exists and has required colors
    const normalGroup = hlGroups.Normal
    const cursorGroup = hlGroups.Cursor
    if (!normalGroup) {
      throw new Error("Colorscheme has no Normal highlight group")
    }
    if (!normalGroup?.fg || !normalGroup?.bg) {
      throw new Error(
        "Normal group must have both foreground and background colors",
      )
    }
    if (!cursorGroup?.fg) {
      throw new Error("Cursor group must have foreground")
    }

    // Collect all unique foreground colors with no background
    const colors = new Set<string>()
    for (const [groupName, group] of Object.entries(hlGroups)) {
      if (group.fg && !group.bg) {
        colors.add(group.fg)
      }
    }

    // remove basic colors
    colors.delete(normalGroup.fg)
    colors.delete(cursorGroup.fg)

    // Write header using Normal group colors
    file.write(`# ${colorscheme} theme generated from Neovim colorscheme\n\n`)
    file.write(`foreground = ${normalGroup.fg}\n`)
    file.write(`background = ${normalGroup.bg}\n`)
    file.write(`cursor = ${cursorGroup.fg}\n\n`)

    // Create palette with remaining colors
    const availableColors = Array.from(colors)
    for (let i = 0; i < Math.min(16, availableColors.length); i++) {
      if (availableColors.length === 0) {
        throw new Error("Not enough unique colors for palette")
      }
      const randomIndex = Math.floor(Math.random() * availableColors.length)
      const color = availableColors[randomIndex]
      file.write(`palette = ${i}=${color}\n`)
      availableColors.splice(randomIndex, 1) // Remove used color
    }
  }

  public async run(): Promise<void> {
    const { args } = await this.parse(ToGhost)
    let nvim
    let file: fs.WriteStream | undefined

    try {
      nvim = await createNvim()

      // Extract colors in hex format
      const hlGroups = (await extractColors(args.colorscheme, {
        nvim,
        format: "hex",
      })) as HlGroupsHex

      const ghosttyDir = ToGhost.prepareThemesDirectory()
      file = ToGhost.openFile(ghosttyDir, args.colorscheme)
      ToGhost.writeTheme(file, args.colorscheme, hlGroups)

      console.log(
        `Successfully created Ghostty theme at: ${path.join(ghosttyDir, args.colorscheme)}`,
      )
    } catch (error) {
      console.error(`Failed to create Ghostty theme: ${error}`, { exit: 1 })
    } finally {
      file?.end()
      nvim?.quit()
    }
  }
}
