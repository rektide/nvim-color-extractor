import { Command } from "@oclif/core"
import { createNvim } from "../utils/nvim"
import { type Neovim } from "neovim"
import { extractColors } from "./extract-colors"
import { listColorschemes } from "./list-colorschemes"

export default class ExtractAllColorschemes extends Command {
  static description = "Extract highlight groups for all available colorschemes"
  static examples = ["<%= config.bin %> <%= command.id %>"]

  public async run(): Promise<void> {
    let nvim
    try {
      nvim = await createNvim()

      // Get all colorschemes using ListColorschemes utility
      const schemes = await listColorschemes(nvim)

      // Get default colors first
      const defaultColors = await extractColors(false, { nvim, rgb: false })

      const results: Record<string, any> = {}

      for (const name of schemes) {
        try {
          console.log(`Extracting ${name}...`)

          // Extract colors for this scheme
          const colors = await extractColors(name, { nvim })

          // Store results
          results[name] = {
            name,
            colors,
          }
        } catch (error) {
          console.log(`Error extracting ${name}: ${error}`)
        } finally {
          // Restore default colors
          await nvim.request("nvim_set_hl", [0, defaultColors])
        }
      }

      // Output all results as JSON
      console.log(JSON.stringify(results, null, 2))
    } catch (error) {
      console.error(`Failed to extract colorschemes: ${error}`, { exit: 1 })
    }
    nvim?.quit()
  }
}
