#!/usr/bin/env -S node --experimental-strip-types
import { Command, Flags } from "@oclif/core"

import { OpenCodeConfigBase } from "../../opencode/config.ts"
import { themeExists } from "../../opencode/theme.ts"
import { exportThemeFromNvim } from "../../opencode/export.ts"
import { getThemeFromCwd } from "../../nvim/projectconfig.ts"

export default class OpenCodeProjectConfig extends Command {
	static description = "Sync OpenCode theme from nvim project-color-nvim config"
	static examples = ["<%= config.bin %> <%= command.id %>"]

	static flags = {
		project: Flags.boolean({
			char: "p",
			description: "Use project-local config",
			default: false,
		}),
		forceExport: Flags.boolean({
			char: "f",
			description: "Force export even if theme exists",
			default: false,
		}),
	}

	public async run(): Promise<void> {
		const { flags } = await this.parse(OpenCodeProjectConfig)

		const cwd = process.cwd()
		const themeName = await getThemeFromCwd(cwd)

		if (!themeName) {
			this.error(
				"No theme found in projectconfig. Use 'opencode:set <theme>' instead.",
			)
		}

		this.log(`Found theme in projectconfig: ${themeName}`)

		const exists = await themeExists(themeName, flags.project)

		if (!exists || flags.forceExport) {
			this.log(`Exporting theme from nvim: ${themeName}`)
			await exportThemeFromNvim(themeName, themeName, flags.project)
		}

		const config = new OpenCodeConfigBase({ project: flags.project })
		await config.writeTheme(themeName)

		this.log(`Set OpenCode theme to: ${themeName}`)
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	OpenCodeProjectConfig.run()
}
