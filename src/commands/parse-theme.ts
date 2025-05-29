import {Args, Command, Flags} from '@oclif/core'
import {Neovim} from 'neovim'
import fs from 'fs'
import {parseColorScheme} from '../colorscheme-parser'

export default class ParseTheme extends Command {
  static description = 'Parse a Neovim color theme file'

  static examples = [
    '<%= config.bin %> <%= command.id %> simple-dark.vim',
    '<%= config.bin %> <%= command.id %> simple-dark.lua',
  ]

  static flags = {
    pretty: Flags.boolean({
      char: 'p',
      description: 'Pretty-print JSON output',
      default: true,
    }),
  }

  static args = {
    file: Args.file({
      description: 'Path to theme file (.vim or .lua)',
      required: true,
      exists: true,
    }),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(ParseTheme)

    try {
      const content = fs.readFileSync(args.file, 'utf-8')
      const isLua = args.file.endsWith('.lua')
      const theme = parseColorScheme(content, isLua)

      if (flags.pretty) {
        this.log(JSON.stringify(theme, null, 2))
      } else {
        this.log(JSON.stringify(theme))
      }
    } catch (error) {
      this.error(`Error parsing theme: ${error}`, {exit: 1})
    }
  }
}
