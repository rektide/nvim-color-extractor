import fs from "fs/promises"
import path from "path"
import os from "os"

export interface GhosttyDirs {
	ghosttyDir: string
	themesDir: string
}

export async function makeGhosttyDirs(
	dirs?: Partial<GhosttyDirs>,
): Promise<GhosttyDirs> {
	const result = { ...dirs } as GhosttyDirs

	// define any missing directories
	if (!result.ghosttyDir) {
		const xdgConfigDir =
			process.env.XDG_CONFIG_DIR || path.join(os.homedir(), ".config")
		result.ghosttyDir = path.join(xdgConfigDir, "ghostty")
	}
	if (!result.themesDir) {
		result.themesDir = path.join(result.ghosttyDir, "themes")
	}

	// insure all directories are created
	const allDirs = [result.ghosttyDir, result.themesDir]
	const mkAll = allDirs.map((dir) => fs.mkdir(dir, { recursive: true }))
	await Promise.all(mkAll)

	return result
}
