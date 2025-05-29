import {Command} from '@oclif/core'
import { createNvim } from '../utils/nvim'

export default class ListColorschemes extends Command {
  static description = 'List all available Neovim color schemes'
  static examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    try {
      const nvim = await createNvim()
      
      // Get all color schemes using completion
      const schemes = await nvim.call('getcompletion', ['', 'color'])
      
      // Convert to JSON and print
      this.log(JSON.stringify(schemes, null, 2))
      
      // Quit Neovim
      await nvim.quit()
    } catch (error) {
      this.error(`Failed to list color schemes: ${error}`, {exit: 1})
    }
  }
}
