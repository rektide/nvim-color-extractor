#!/usr/bin/env -S node --experimental-strip-types
import fs from "node:fs"
import path from "node:path"
import { Command } from "@oclif/core"
import { retryFlag } from "../../utils/flags.ts"

import { createNvim } from "../../utils/nvim.ts"
import { prepareThemesDirectory } from "../../utils/ghostty.ts"
import { listColorschemes } from "../nvim/list.ts"
import GhosttyConvert from "./convert.ts"

export default class GhosttyRandom extends Command {
	static description =
		"Convert a random Neovim colorscheme to Ghostty theme format, and set ghostty to use"
	static examples = ["<%= config.bin %> <%= command.id %>"]

	static flags = {
		retry: retryFlag,
	}

	private async pickAndExtract(): Promise<string> {
		let nvim
		try {
			nvim = await createNvim()
			const schemes = await listColorschemes(nvim)

			if (schemes.length === 0) {
				throw new Error("No colorschemes found")
			}

			// Pick random scheme
			const randomScheme = schemes[Math.floor(Math.random() * schemes.length)]
			console.log(`Selected random colorscheme: ${randomScheme}`)

			// Check if theme already exists in Ghostty's directory
			const ghosttyDir = prepareThemesDirectory()
			const themePath = path.join(ghosttyDir, randomScheme)

			if (fs.existsSync(themePath)) {
				console.log(`Theme ${randomScheme} already exists at ${themePath}`)
			} else {
				// Convert using existing ToGhost command
				await GhosttyConvert.run([randomScheme])
			}

			// Update Ghostty config to use this theme
			await this.updateGhosttyConfig(randomScheme, ghosttyDir)
			return randomScheme
		} finally {
			nvim?.quit()
		}
	}

	public async run(): Promise<void> {
		const { flags } = await this.parse(GhosttyRandom)
		let lastError: Error | undefined
		
		for (let attempt = 1; attempt <= flags.retry; attempt++) {
			try {
				await this.pickAndExtract()
				return // Success - exit the retry loop
			} catch (error) {
				lastError = error as Error
				console.error(`Attempt ${attempt}/${flags.retry} failed: ${error}`)
				if (attempt < flags.retry) {
					await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1s between retries
				}
			}
		}
		
		console.error(`Failed after ${flags.retry} attempts: ${lastError}`, { exit: 1 })
	}

	public async updateGhosttyConfig(
		colorscheme: string,
		ghosttyDir: string = prepareThemesDirectory(),
	): Promise<void> {
		const configPath = path.join(path.dirname(ghosttyDir), "config")

		try {
			let configContent = ""
			try {
				configContent = await fs.promises.readFile(configPath, "utf-8")
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

			await fs.promises.writeFile(configPath, configContent)
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
