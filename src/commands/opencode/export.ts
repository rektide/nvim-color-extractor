#!/usr/bin/env -S node --experimental-strip-types
import { Args, Command, Flags } from "@oclif/core"

import type { HlGroupsHex } from "../../types.ts"
import { createNvim } from "../../utils/nvim.ts"
import NvimExtract from "../nvim/extract.ts"

interface OpenCodeTheme {
	$schema?: string
	defs?: Record<string, string>
	theme: {
		primary: { dark: string; light: string }
		secondary: { dark: string; light: string }
		accent: { dark: string; light: string }
		error: { dark: string; light: string }
		warning: { dark: string; light: string }
		success: { dark: string; light: string }
		info: { dark: string; light: string }
		text: { dark: string; light: string }
		textMuted: { dark: string; light: string }
		background: { dark: string; light: string }
		backgroundPanel: { dark: string; light: string }
		backgroundElement: { dark: string; light: string }
		border: { dark: string; light: string }
		borderActive: { dark: string; light: string }
		borderSubtle: { dark: string; light: string }
		diffAdded: { dark: string; light: string }
		diffRemoved: { dark: string; light: string }
		diffContext: { dark: string; light: string }
		diffHunkHeader: { dark: string; light: string }
		diffHighlightAdded: { dark: string; light: string }
		diffHighlightRemoved: { dark: string; light: string }
		diffAddedBg: { dark: string; light: string }
		diffRemovedBg: { dark: string; light: string }
		diffContextBg: { dark: string; light: string }
		diffLineNumber: { dark: string; light: string }
		diffAddedLineNumberBg: { dark: string; light: string }
		diffRemovedLineNumberBg: { dark: string; light: string }
		markdownText: { dark: string; light: string }
		markdownHeading: { dark: string; light: string }
		markdownLink: { dark: string; light: string }
		markdownLinkText: { dark: string; light: string }
		markdownCode: { dark: string; light: string }
		markdownBlockQuote: { dark: string; light: string }
		markdownEmph: { dark: string; light: string }
		markdownStrong: { dark: string; light: string }
		markdownHorizontalRule: { dark: string; light: string }
		markdownListItem: { dark: string; light: string }
		markdownListEnumeration: { dark: string; light: string }
		markdownImage: { dark: string; light: string }
		markdownImageText: { dark: string; light: string }
		markdownCodeBlock: { dark: string; light: string }
		syntaxComment: { dark: string; light: string }
		syntaxKeyword: { dark: string; light: string }
		syntaxFunction: { dark: string; light: string }
		syntaxVariable: { dark: string; light: string }
		syntaxString: { dark: string; light: string }
		syntaxNumber: { dark: string; light: string }
		syntaxType: { dark: string; light: string }
		syntaxOperator: { dark: string; light: string }
		syntaxPunctuation: { dark: string; light: string }
	}
}

export default class OpenCodeExport extends Command {
	static async convertToOpenCodeTheme(
		hlGroups: HlGroupsHex,
		themeName: string = "custom",
	): Promise<OpenCodeTheme> {
		// Extract common colors from nvim highlight groups
		const colors = {
			normalFg: hlGroups.Normal?.fg || "#ffffff",
			normalBg: hlGroups.Normal?.bg || "#000000",
			comment: hlGroups.Comment?.fg || "#808080",
			constant: hlGroups.Constant?.fg || "#ffa0a0",
			identifier: hlGroups.Identifier?.fg || "#40ffff",
			statement: hlGroups.Statement?.fg || "#ffff60",
			preproc: hlGroups.PreProc?.fg || "#ff80ff",
			type: hlGroups.Type?.fg || "#60ff60",
			special: hlGroups.Special?.fg || "#ffa500",
			error: hlGroups.Error?.fg || "#ff0000",
			todo: hlGroups.Todo?.fg || "#ffff00",
		}

		// Create a simple mapping from nvim colors to OpenCode theme
		// For simplicity, we'll use the same colors for dark and light variants
		// Users can customize this further
		return {
			$schema: "https://opencode.ai/theme.json",
			defs: {
				[`${themeName}0`]: colors.normalBg,
				[`${themeName}1`]: colors.normalFg,
				[`${themeName}2`]: colors.comment,
				[`${themeName}3`]: colors.constant,
				[`${themeName}4`]: colors.identifier,
				[`${themeName}5`]: colors.statement,
				[`${themeName}6`]: colors.preproc,
				[`${themeName}7`]: colors.type,
				[`${themeName}8`]: colors.special,
				[`${themeName}9`]: colors.error,
				[`${themeName}10`]: colors.todo,
			},
			theme: {
				primary: { dark: `${themeName}4`, light: `${themeName}4` },
				secondary: { dark: `${themeName}5`, light: `${themeName}5` },
				accent: { dark: `${themeName}8`, light: `${themeName}8` },
				error: { dark: `${themeName}9`, light: `${themeName}9` },
				warning: { dark: `${themeName}10`, light: `${themeName}10` },
				success: { dark: `${themeName}7`, light: `${themeName}7` },
				info: { dark: `${themeName}4`, light: `${themeName}4` },
				text: { dark: `${themeName}1`, light: `${themeName}0` },
				textMuted: { dark: `${themeName}2`, light: `${themeName}2` },
				background: { dark: `${themeName}0`, light: `${themeName}1` },
				backgroundPanel: { dark: `${themeName}0`, light: `${themeName}1` },
				backgroundElement: { dark: `${themeName}0`, light: `${themeName}1` },
				border: { dark: `${themeName}2`, light: `${themeName}2` },
				borderActive: { dark: `${themeName}4`, light: `${themeName}4` },
				borderSubtle: { dark: `${themeName}2`, light: `${themeName}2` },
				diffAdded: { dark: `${themeName}7`, light: `${themeName}7` },
				diffRemoved: { dark: `${themeName}9`, light: `${themeName}9` },
				diffContext: { dark: `${themeName}2`, light: `${themeName}2` },
				diffHunkHeader: { dark: `${themeName}2`, light: `${themeName}2` },
				diffHighlightAdded: { dark: `${themeName}7`, light: `${themeName}7` },
				diffHighlightRemoved: { dark: `${themeName}9`, light: `${themeName}9` },
				diffAddedBg: { dark: `${themeName}0`, light: `${themeName}1` },
				diffRemovedBg: { dark: `${themeName}0`, light: `${themeName}1` },
				diffContextBg: { dark: `${themeName}0`, light: `${themeName}1` },
				diffLineNumber: { dark: `${themeName}2`, light: `${themeName}2` },
				diffAddedLineNumberBg: {
					dark: `${themeName}0`,
					light: `${themeName}1`,
				},
				diffRemovedLineNumberBg: {
					dark: `${themeName}0`,
					light: `${themeName}1`,
				},
				markdownText: { dark: `${themeName}1`, light: `${themeName}0` },
				markdownHeading: { dark: `${themeName}4`, light: `${themeName}4` },
				markdownLink: { dark: `${themeName}5`, light: `${themeName}5` },
				markdownLinkText: { dark: `${themeName}8`, light: `${themeName}8` },
				markdownCode: { dark: `${themeName}7`, light: `${themeName}7` },
				markdownBlockQuote: { dark: `${themeName}2`, light: `${themeName}2` },
				markdownEmph: { dark: `${themeName}10`, light: `${themeName}10` },
				markdownStrong: { dark: `${themeName}10`, light: `${themeName}10` },
				markdownHorizontalRule: {
					dark: `${themeName}2`,
					light: `${themeName}2`,
				},
				markdownListItem: { dark: `${themeName}4`, light: `${themeName}4` },
				markdownListEnumeration: {
					dark: `${themeName}8`,
					light: `${themeName}8`,
				},
				markdownImage: { dark: `${themeName}5`, light: `${themeName}5` },
				markdownImageText: { dark: `${themeName}8`, light: `${themeName}8` },
				markdownCodeBlock: { dark: `${themeName}1`, light: `${themeName}0` },
				syntaxComment: { dark: `${themeName}2`, light: `${themeName}2` },
				syntaxKeyword: { dark: `${themeName}5`, light: `${themeName}5` },
				syntaxFunction: { dark: `${themeName}4`, light: `${themeName}4` },
				syntaxVariable: { dark: `${themeName}8`, light: `${themeName}8` },
				syntaxString: { dark: `${themeName}7`, light: `${themeName}7` },
				syntaxNumber: { dark: `${themeName}10`, light: `${themeName}10` },
				syntaxType: { dark: `${themeName}8`, light: `${themeName}8` },
				syntaxOperator: { dark: `${themeName}5`, light: `${themeName}5` },
				syntaxPunctuation: { dark: `${themeName}1`, light: `${themeName}0` },
			},
		}
	}

	static description = "Export nvim colorscheme to OpenCode theme format"
	static examples = [
		"<%= config.bin %> <%= command.id %> gruvbox",
		"<%= config.bin %> <%= command.id %> solarized --name my-theme",
	]

	static flags = {
		name: Flags.string({
			char: "n",
			description: "Name for the OpenCode theme",
			default: "custom",
		}),
	}

	static args = {
		colorscheme: Args.string({
			description: "Name of colorscheme to extract",
			required: true,
		}),
	}

	public async run(): Promise<void> {
		const { args, flags } = await this.parse(OpenCodeExport)

		let nvim
		try {
			nvim = await createNvim()

			// Extract colors from nvim
			const hlGroups = (await NvimExtract.extractColors(
				args.colorscheme as string,
				{
					nvim,
					format: "hex",
				},
			)) as HlGroupsHex

			// Convert to OpenCode theme format
			const openCodeTheme = await OpenCodeExport.convertToOpenCodeTheme(
				hlGroups,
				flags.name as string,
			)

			// Output the theme JSON
			console.log(JSON.stringify(openCodeTheme, null, "\t"))
		} catch (error) {
			console.error(`Failed to export OpenCode theme: ${error}`, { exit: 1 })
		}
		nvim?.quit()
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	OpenCodeExport.run()
}

export const convertToOpenCodeTheme = OpenCodeExport.convertToOpenCodeTheme
