import { Args, Command, Flags } from "@oclif/core"
import { Neovim } from "neovim"
import fs from "fs"
import { parseColorScheme } from "../../colorscheme-parser"

export default class NvimParseTheme extends Command {
  static description = "Parse a Neovim color theme file (bad, hack)"
  static examples = [
    "<%= config.bin %> <%= command.id %> simple-dark.vim",
    "<%= config.bin %> <%= command.id %> simple-dark.lua",
  ]

  static flags = {
    pretty: Flags.boolean({
      char: "p",
      description: "Pretty-print JSON output",
      default: true,
    }),
  }

  static args = {
    file: Args.file({
      description: "Path to theme file (.vim or .lua)",
      required: true,
      exists: true,
    }),
  }

  public async run(): Promise<void> {
    const { args, flags } = await this.parse(NvimParseTheme)

    try {
      const content = fs.readFileSync(args.file, "utf-8")
      const isLua = args.file.endsWith(".lua")
      const theme = parseColorScheme(content, isLua)

      if (flags.pretty) {
        console.log(JSON.stringify(theme, null, 2))
      } else {
        console.log(JSON.stringify(theme))
      }
    } catch (error) {
      console.error(`Error parsing theme: ${error}`, { exit: 1 })
    }
  }
}
