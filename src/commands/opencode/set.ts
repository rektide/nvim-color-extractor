#!/usr/bin/env -S node --experimental-strip-types
import { Args, Command, Flags } from "@oclif/core"

import { OpenCodeConfigBase } from "../../opencode/config.ts"

export default class OpenCodeSet extends Command {
	static description = "Set OpenCode theme in configuration"
	static examples = ["<%= config.bin %> <%= command.id %> gruvbox"]

	static flags = {
		project: Flags.boolean({
			char: "p",
			description: "Use project-local config",
			default: false,
		}),
	}

	static args = {
		theme: Args.string({
			description: "Theme name",
			required: true,
		}),
	}

	public async run(): Promise<void> {
		const { args, flags } = await this.parse(OpenCodeSet)

		const config = new OpenCodeConfigBase({ project: flags.project })

		await config.writeTheme(args.theme)

		this.log(`Set OpenCode theme to: ${args.theme}`)
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	OpenCodeSet.run()
}
