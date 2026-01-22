import fs from "node:fs/promises"
import path from "path"
import os from "os"

export async function themeExists(
	themeName: string,
	isProject: boolean = false,
): Promise<boolean> {
	try {
		const themePath = getThemePath(themeName, isProject)
		await fs.access(themePath)
		return true
	} catch {
		return false
	}
}

export function getThemePath(
	themeName: string,
	isProject: boolean = false,
): string {
	const xdgConfigDir =
		process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config")

	const themesDir = isProject
		? path.join(".opencode", "themes")
		: path.join(xdgConfigDir, "opencode", "themes")

	return path.join(themesDir, `${themeName}.json`)
}

export async function listThemes(
	isProject: boolean = false,
): Promise<string[]> {
	const themesDir = path.dirname(getThemePath("dummy", isProject))

	try {
		const files = await fs.readdir(themesDir)
		return files
			.filter((f) => f.endsWith(".json"))
			.map((f) => path.basename(f, ".json"))
	} catch {
		return []
	}
}
