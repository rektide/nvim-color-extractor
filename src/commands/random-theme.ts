import { Command } from "@oclif/core"
import { listColorschemes } from "./list-colorschemes"
import { createNvim } from "../utils/nvim"
import ToGhost from "./to-ghost"
import fs from "fs"
import path from "path"
import os from "os"

export default class RandomTheme extends Command {
  static description =
    "Convert a random Neovim colorscheme to Ghostty theme format"
  static examples = ["<%= config.bin %> <%= command.id %>"]

  public async run(): Promise<void> {
    let nvim
    try {
      nvim = await createNvim()
      const schemes = await listColorschemes(nvim)

      if (schemes.length === 0) {
        throw new Error("No colorschemes found")
      }

      // Pick random scheme
      const randomScheme = schemes[Math.floor(Math.random() * schemes.length)]
      console.log(`Selected random colorscheme: ${randomScheme}`)

      // Check if theme already exists in Ghostty's directory
      const ghosttyDir = ToGhost.prepareThemesDirectory()
      const themePath = path.join(ghosttyDir, randomScheme)
      
      if (fs.existsSync(themePath)) {
        console.log(`Theme ${randomScheme} already exists at ${themePath}`)
      } else {
        // Convert using existing ToGhost command
        ToGhost.run([randomScheme])
      }

      // Update Ghostty config to use this theme
      await this.updateGhosttyConfig(randomScheme)
    } catch (error) {
      console.error(`Failed to create random theme: ${error}`, { exit: 1 })
    }
    nvim?.quit()
  }

  private async updateGhosttyConfig(themeName: string): Promise<void> {
    const xdgConfigDir = process.env.XDG_CONFIG_DIR || path.join(os.homedir(), ".config")
    const configPath = path.join(xdgConfigDir, "ghostty", "config")
    
    try {
      let configContent = ""
      try {
        configContent = await fs.promises.readFile(configPath, "utf-8")
        // Comment out any existing theme lines
        configContent = configContent.replace(/^theme\s*=/gm, "# theme =")
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error
        }
        // File doesn't exist yet, we'll create it
      }

      // Append new theme setting
      configContent += `\ntheme = ${themeName}\n`

      await fs.promises.writeFile(configPath, configContent)
      console.log(`Updated Ghostty config at ${configPath} to use theme: ${themeName}`)
    } catch (error) {
      console.error(`Failed to update Ghostty config: ${error}`)
    }
  }
}
