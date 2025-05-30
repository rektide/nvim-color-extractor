import { Command } from "@oclif/core"
import { listColorschemes } from "./list-colorschemes"
import { createNvim } from "../utils/nvim"
import ToGhost from "./to-ghost"

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

      // Convert using existing ToGhost command
      ToGhost.run([randomScheme])
    } catch (error) {
      console.error(`Failed to create random theme: ${error}`, { exit: 1 })
    }
    nvim?.quit()
  }
}
