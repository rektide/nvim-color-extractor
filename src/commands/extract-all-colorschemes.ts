import { Command } from "@oclif/core"
import { createNvim } from "../utils/nvim"
import { type Neovim } from "neovim"
import { extractColors } from "./extract-colors"
import { listColorschemes } from "./list-colorschemes"
import { buildRestoreColors, restoreColors } from "../utils/restore"

export default class ExtractAllColorschemes extends Command {
  static description = "Extract highlight groups for all available colorschemes"
  static examples = ["<%= config.bin %> <%= command.id %>"]

  public async run(): Promise<void> {
    let nvim
    try {
      nvim = await createNvim()

      // Build restore function with current default colors
      await buildRestoreColors(nvim)

      // Get all colorschemes using ListColorschemes utility
      const schemes = await listColorschemes(nvim)

      const results: Record<string, any> = {}

      for (const name of schemes) {
        try {
          console.log(`Extracting ${name}...`)

          // Extract colors for this scheme
          const colors = await extractColors(name, { nvim, format: "hex" })

          // Store results
          results[name] = {
            name,
            colors,
          }
        } catch (error) {
          console.error(`Error extracting ${name}: ${error}`)
        } finally {
          // Restore to original colors
          await restoreColors(nvim)
        }
      }

      // Output all results as JSON
      console.log(JSON.stringify(results, null, 2))
    } catch (error) {
      console.error(`Failed to extract colorschemes: ${error}`, { exit: 1 })
    } finally {
      nvim?.quit()
    }
  }
}
