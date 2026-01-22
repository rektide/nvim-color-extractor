import fs from "node:fs/promises"
import path from "path"
import os from "os"

export class OpenCodeConfigBase {
	opencodeDir: string
	configPath: string

	constructor(base?: Partial<{ project: boolean }>) {
		const xdgConfigDir =
			process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config")

		const isProject = base?.project ?? false
		if (isProject) {
			this.opencodeDir = ".opencode"
		} else {
			this.opencodeDir = path.join(xdgConfigDir, "opencode")
		}

		this.configPath = path.join(this.opencodeDir, "opencode.json")
	}

	async readConfig(): Promise<Record<string, any>> {
		try {
			const data = await fs.readFile(this.configPath, "utf-8")
			return JSON.parse(data)
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === "ENOENT") {
				return {}
			}
			throw error
		}
	}

	async writeTheme(themeName: string): Promise<void> {
		const existingConfig = await this.readConfig()
		const newConfig = { ...existingConfig, theme: themeName }
		await fs.mkdir(path.dirname(this.configPath), { recursive: true })
		await fs.writeFile(
			this.configPath,
			JSON.stringify(newConfig, null, "\t"),
			"utf-8",
		)
	}
}
