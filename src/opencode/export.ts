import fs from "node:fs/promises"
import path from "node:path"
import type { Neovim } from "neovim"
import OpenCodeExport from "../commands/opencode/export.ts"
import { extractColors } from "../commands/nvim/extract.ts"
import { getThemePath } from "./theme.ts"
import type { HlGroupsHex } from "../types.ts"

export async function exportThemeFromNvim(
	colorscheme: string,
	themeName: string,
	isProject: boolean = false,
	nvim?: Neovim,
): Promise<string> {
	const themePath = getThemePath(themeName, isProject)

	const hlGroups = (await extractColors(colorscheme, {
		nvim,
		format: "hex",
	})) as HlGroupsHex

	const openCodeTheme = await OpenCodeExport.convertToOpenCodeTheme(
		hlGroups,
		themeName,
	)

	await fs.mkdir(path.dirname(themePath), { recursive: true })
	await fs.writeFile(
		themePath,
		JSON.stringify(openCodeTheme, null, "\t"),
		"utf-8",
	)

	return themePath
}
