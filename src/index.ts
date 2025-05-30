#!/usr/bin/env -S npx ts-node

import { run } from "@oclif/core"
import { Command } from "@oclif/core"
import { ListColorschemes } from "./commands/list-colorschemes"
import { ParseTheme } from "./commands/parse-theme"
import { ExtractColors } from "./commands/extract-colors"
import { ExtractAllColorschemes } from "./commands/extract-all-colorschemes"
import { ToGhost } from "./commands/to-ghost"

async function main() {
  try {
    const result = await run()
    if (result === undefined) {
      // Show help if no command specified
      await Command.run(["--help"])
    }
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

main()
