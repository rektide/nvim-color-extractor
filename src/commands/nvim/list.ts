import { Command } from "@oclif/core"
import { createNvim } from "../../utils/nvim"
import { Neovim } from "neovim"

export default class NvimList extends Command {
  static listColorschemes(nvim: Neovim) {
    return nvim.call("getcompletion", ["", "color"])
  }

  static description = "List all available Neovim color schemes"
  static examples = ["<%= config.bin %> <%= command.id %>"]

  public async run(): Promise<void> {
    try {
      const nvim = await createNvim()

      // Get all color schemes using completion
      const schemes = await NvimList.listColorschemes(nvim)

      // Convert to JSON and print
      console.log(JSON.stringify(schemes, null, "\t"))

      // Quit Neovim
      nvim.quit()
    } catch (error) {
      console.error(`Failed to list color schemes: ${error}`, { exit: 1 })
    }
  }
}

if (require.main === module) {
  NvimList.run()
}

export const listColorschemes = NvimList.listColorschemes
