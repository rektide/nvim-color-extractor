import { Command } from "@oclif/core"
import { createNvim } from "../utils/nvim"
import { type Neovim } from "neovim"
import { ExtractColors } from "./extract-colors"
import { ListColorschemes } from "./list-colorschemes"

export default class ExtractAllColorschemes extends Command {
  static description = 'Extract highlight groups for all available colorschemes'
  static examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    try {
      const nvim = await createNvim()
      
      // Get all colorschemes using ListColorschemes utility
      const schemes = await ListColorschemes.listColorschemes(nvim)
      
      // Get default colors first
      const defaultColors = await ExtractColors.extractColors(false, { nvim })
      
      const results: Record<string, any> = {}
      
      for (const name of schemes) {
        try {
          this.log(`Extracting ${name}...`)
          
          // Extract colors for this scheme
          const colors = await ExtractColors.extractColors(name, { nvim })
          
          // Store results
          results[name] = {
            name,
            colors
          }
        } catch (error) {
          this.log(`Error extracting ${name}: ${error}`)
        } finally {
          // Restore default colors
          await nvim.request('nvim_set_hl', [0, defaultColors])
        }
      }

      // Output all results as JSON
      this.log(JSON.stringify(results, null, 2))

      await nvim.quit()
    } catch (error) {
      this.error(`Failed to extract colorschemes: ${error}`, {exit: 1})
    }
  }
}
