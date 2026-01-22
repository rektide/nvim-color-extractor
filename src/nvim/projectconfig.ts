import fs from "node:fs/promises"
import path from "path"
import os from "os"

export function getProjectName(cwd: string): string {
	return path.basename(path.dirname(cwd))
}

export async function readProjectConfig(
	projectName: string,
): Promise<Record<string, any> | null> {
	const configPath = path.join(
		os.homedir(),
		".config",
		"nvim",
		"projects",
		`${projectName}.json`,
	)

	try {
		const data = await fs.readFile(configPath, "utf-8")
		return JSON.parse(data)
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") {
			return null
		}
		throw error
	}
}

export async function getThemeFromProjectConfig(
	projectName: string,
): Promise<string | null> {
	const config = await readProjectConfig(projectName)
	return config?.["color-persist"] ?? null
}

export async function getThemeFromCwd(cwd: string): Promise<string | null> {
	const projectName = getProjectName(cwd)
	return await getThemeFromProjectConfig(projectName)
}
