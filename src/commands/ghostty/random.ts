#!/usr/bin/env -S node --experimental-strip-types
import fs from "node:fs/promises"
import path from "node:path"
import { Command } from "@oclif/core"
import type { Neovim } from "neovim"

import type { Zalgo } from "../../types.js"
import { listColorschemes } from "../nvim/list.ts"
import { retryFlag } from "../../utils/flags.ts"
import { type GhosttyDirs, makeGhosttyDirs } from "../../utils/ghostty.ts"
import { createNvim } from "../../utils/nvim.ts"
import GhosttyConvert from "./convert.ts"

export interface GhosttyRandomState extends GhosttyDirs {
	nvim: Neovim
	schemes: Array<string>
}

export default class GhosttyRandom extends Command {
	static description =
		"Convert a random Neovim colorscheme to Ghostty theme format, and set ghostty to use"
	static examples = ["<%= config.bin %> <%= command.id %>"]

	static flags = {
		retry: retryFlag,
	}

	private async makeState(
		base?: Partial<GhosttyRandomState>,
	): Promise<GhosttyRandomState> {
		const result = { ...base } as GhosttyRandomState
		result.nvim ??= await createNvim()

		const pending = []
		let schemes = result.schemes
		if (!schemes) {
			const buildSchemes = listColorschemes(result.nvim).then(
				(schemes) => (result.schemes = schemes),
			)
			pending.push(buildSchemes)
		}
		if (!(result.ghosttyDir && result.themesDir)) {
			const buildDirs = makeGhosttyDirs(result).then((dirs: GhosttyDirs) => {
				result.ghosttyDir = dirs.ghosttyDir
				result.themesDir = dirs.themesDir
			})
			pending.push(buildDirs)
		}

		await Promise.all(pending)
		return result
	}

	public async random(state?: Partial<GhosttyRandomState>): Promise<string> {
		let nvim
		try {
			const {
				ghosttyDir,
				nvim: nvim2,
				schemes,
				themesDir,
			} = await this.makeState(state)
			nvim = nvim2
			if (schemes?.length === 0) {
				throw new Error("No colorschemes found")
			}

			// Pick random scheme
			const randomScheme = schemes[Math.floor(Math.random() * schemes.length)]
			console.log(`Selected random colorscheme: ${randomScheme}`)

			// Check if theme already exists in Ghostty's directory
			let stat
			try {
				stat = await fs.stat(themesDir)
				if (!stat.isDirectory()) {
					throw new Error(
						`Ghostty themes directory isn't a directory: ${themesDir}`,
					)
				}
				console.log(`Theme ${randomScheme} already exists at ${themesDir}`)
			} catch (err) {
				if (stat) {
					throw err
				}
			}
			// Convert using GhosttyConvert's convert method
			const convert = new GhosttyConvert([])
			await convert.convert({
				...state,
				colorscheme: randomScheme,
			})

			// Update Ghostty config to use this theme
			await this.updateGhosttyConfig(randomScheme, ghosttyDir)
			return randomScheme
		} finally {
			nvim?.quit()
		}
	}

	public async randomAttempts(
		retry: number,
		state?: Partial<GhosttyRandomState>,
	): Promise<string> {
		const resolvedState = await this.makeState(state)

		for (let attempt = 1; attempt <= retry; attempt++) {
			try {
				return await this.random(resolvedState)
			} catch (err) {
				console.error(`Attempt ${attempt}/${retry} failed: ${err}`)
				if (attempt === retry) {
					console.error("Throwing")
					throw err
				}
			}
		}
		throw new Error("Should never reach here")
	}

	public async run(): Promise<void> {
		const { flags } = await this.parse(GhosttyRandom)
		await this.randomAttempts(flags.retry)
	}

	public async updateGhosttyConfig(
		colorscheme: string,
		ghosttyDir?: string,
	): Promise<void> {
		if (!ghosttyDir) {
			ghosttyDir = (await makeGhosttyDirs()).ghosttyDir
		}

		const configPath = path.join(path.dirname(ghosttyDir), "config")

		try {
			let configContent = ""
			try {
				configContent = await fs.readFile(configPath, "utf-8")
				// Comment out any existing theme lines
				configContent = configContent.replace(/^theme\s*=/gm, "# theme =")
			} catch (error) {
				if ((error as any)?.code !== "ENOENT") {
					throw error
				}
				// File doesn't exist yet, we'll create it
			}

			// Append new theme setting
			const sep = configContent.length ? "\n" : ""
			configContent += `${sep}theme = ${colorscheme}\n`

			await fs.writeFile(configPath, configContent)
			console.log(
				`Updated Ghostty config at ${configPath} to use colorscheme: ${colorscheme}`,
			)
		} catch (error) {
			console.error(`Failed to update Ghostty config: ${error}`)
		}
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	GhosttyRandom.run()
}
