import fs from "node:fs/promises"
import path from "node:path"
import OpenCodeExport from "../commands/opencode/export.ts"
import { getThemePath } from "./theme.ts"

export async function exportThemeFromNvim(
	colorscheme: string,
	themeName: string,
	isProject: boolean = false,
): Promise<string> {
	const themePath = getThemePath(themeName, isProject)

	const hlGroups = JSON.parse(
		await fs.readFile(`/tmp/nvim-colors-${colorscheme}.json`, "utf-8"),
	)

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
