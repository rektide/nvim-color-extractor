import { Command } from "@oclif/core"
import { exec } from "node:child_process"
import GhosttyRandom from "./random"

export default class GhosttyExec extends Command {
  static description = "Pick a random colorscheme and launch Ghostty with it"
  static examples = ["<%= config.bin %> <%= command.id %>"]

  public async run(): Promise<void> {
    try {
      // First run ghostty:random to select and set a theme
      await GhosttyRandom.run([])

      // Then launch Ghostty
      exec("ghostty", (error) => {
        if (error) {
          console.error(`Failed to launch Ghostty: ${error.message}`)
          this.exit(1)
        }
      })
    } catch (error) {
      console.error(`Failed to execute Ghostty: ${error}`, { exit: 1 })
    }
  }
}
