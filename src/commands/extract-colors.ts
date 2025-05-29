import {Args, Command} from '@oclif/core'
import {createNvim} from '../utils/nvim'
import {Neovim} from 'neovim'

function colorIntToRGB(color: number): [number, number, number] {
  return [
    (color >> 16) & 0xff, // red
    (color >> 8) & 0xff,  // green
    color & 0xff          // blue
  ]
}

function processHighlightGroups(hlGroups: Record<string, any>) {
  const result: Record<string, any> = {}
  for (const [name, attrs] of Object.entries(hlGroups)) {
    const processed: Record<string, any> = {}
    if (attrs.foreground) processed.fg = colorIntToRGB(attrs.foreground)
    if (attrs.background) processed.bg = colorIntToRGB(attrs.background)
    if (attrs.special) processed.sp = colorIntToRGB(attrs.special)
    if (attrs.bold) processed.bold = attrs.bold
    if (attrs.italic) processed.italic = attrs.italic
    if (attrs.underline) processed.underline = attrs.underline
    if (attrs.undercurl) processed.undercurl = attrs.undercurl
    if (attrs.reverse) processed.reverse = attrs.reverse
    result[name] = processed
  }
  return result
}

export default class ExtractColors extends Command {
  static description = 'Extract highlight groups from a colorscheme with RGB color values'
  static examples = [
    '<%= config.bin %> <%= command.id %> gruvbox',
    '<%= config.bin %> <%= command.id %> solarized'
  ]

  static args = {
    colorscheme: Args.string({
      description: 'Name of colorscheme to extract',
      required: true
    })
  }

  public async run(): Promise<void> {
    const {args} = await this.parse(ExtractColors)

    try {
      const nvim = await createNvim()

      // Set the colorscheme
      await nvim.command(`colorscheme ${args.colorscheme}`)
      
      // Wait briefly for colorscheme to load
      await new Promise(resolve => setTimeout(resolve, 100))

      // Get all highlight groups
      const hlGroups = await nvim.call('vim.api.get_hl', [0, {}]) as Record<string, any>

      // Process and convert colors
      const processed = processHighlightGroups(hlGroups)

      // Output as pretty JSON
      this.log(JSON.stringify(processed, null, 2))

      await nvim.quit()
    } catch (error) {
      this.error(`Failed to extract colors: ${error}`, {exit: 1})
    }
  }
}
