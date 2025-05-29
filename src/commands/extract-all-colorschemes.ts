import { Command } from "@oclif/core"
import { createNvim } from "../utils/nvim"
import { type Neovim } from "neovim"
import { colorIntToRGB } from "./extract-colors"

async function extractColorscheme(nvim: Neovim, name: string) {
  // Reset to default colors first
  await nvim.command('colorscheme default')
  
  // Set the target colorscheme
  await nvim.command(`colorscheme ${name}`)
  
  // Wait briefly for colorscheme to load
  await new Promise(resolve => setTimeout(resolve, 100))

  // Get all highlight groups
  const hlGroups = await nvim.call('vim.api.get_hl', [0, {}]) as Record<string, any>

  // Process colors to RGB
  const processed: Record<string, any> = {}
  for (const [group, attrs] of Object.entries(hlGroups)) {
    processed[group] = {
      fg: attrs.foreground ? colorIntToRGB(attrs.foreground) : undefined,
      bg: attrs.background ? colorIntToRGB(attrs.background) : undefined,
      sp: attrs.special ? colorIntToRGB(attrs.special) : undefined,
      bold: attrs.bold,
      italic: attrs.italic,
      underline: attrs.underline,
      undercurl: attrs.undercurl,
      reverse: attrs.reverse
    }
  }

  return {
    name,
    colors: processed
  }
}

export default class ExtractAllColorschemes extends Command {
  static description = 'Extract highlight groups for all available colorschemes'
  static examples = ['<%= config.bin %> <%= command.id %>']

  public async run(): Promise<void> {
    try {
      const nvim = await createNvim()
      
      // Get all colorschemes
      const schemes = await nvim.call('getcompletion', ['', 'color']) as string[]
      
      const results: Record<string, any> = {}
      
      for (const name of schemes) {
        try {
          this.log(`Extracting ${name}...`)
          results[name] = await extractColorscheme(nvim, name)
        } catch (error) {
          this.log(`Error extracting ${name}: ${error}`)
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
