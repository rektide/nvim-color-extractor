#!/usr/bin/env -S node --experimental-strip-types
import fs from "node:fs/promises"
import path from "node:path"
import { Command } from "@oclif/core"

import { GhosttyConverter } from "./convert.ts"
import { retryFlag } from "../../utils/flags.ts"
import {
	NvimGhosttyBase,
	type NvimGhosttyComposite,
} from "../../utils/nvim-ghostty.ts"
import NvimList, { listColorschemes } from "../nvim/list.ts"
import type { NvimGhosttyOptions, Zalgo } from "../../types.ts"

export interface GhosttyRandomerOptions extends NvimGhosttyOptions {
	schemes: Zalgo<string[]>
	converter: GhosttyConverter
}

export class GhosttyRandomer extends NvimGhosttyBase {
	static async ready(
		self: GhosttyRandomer,
	): Promise<GhosttyRandomer & NvimGhosttyComposite> {
		self.schemes = await self.schemes
		return self as unknown as GhosttyRandomer & NvimGhosttyComposite
	}

	schemes: Zalgo<string[]>
	converter: GhosttyConverter

	constructor(base?: Partial<GhosttyRandomerOptions>) {
		super(base)
		this.converter = new GhosttyConverter(this)

		this.schemes = base?.schemes as string[]
		if (!this.schemes) {
			this.schemes = Promise.resolve(this.nvim).then(NvimList.listColorschemes)
		}
		this.ready = GhosttyRandomer.ready(this)
	}

	async random(): Promise<string> {
		const schemes = await this.schemes
		if (schemes.length === 0) {
			throw new Error("No colorschemes found")
		}

		// Pick random scheme
		const randomScheme = schemes[Math.floor(Math.random() * schemes.length)]
		console.log(`Selected random colorscheme: ${randomScheme}`)

		const themePath = this.getThemesPath(randomScheme)

		// Check if theme already exists in Ghostty's directory
		let stat
		try {
			stat = await fs.stat(themePath)
			console.log(`Theme ${randomScheme} already exists at ${themePath}`)
		} catch (err) {
			if (stat) {
				throw err
			}

			await this.converter.convert(randomScheme)
		}

		// Update Ghostty config to use this theme
		await this.updateGhosttyConfig(randomScheme)
		return randomScheme
	}

	async randomAttempts(retry: number): Promise<string> {
		for (let attempt = 1; attempt <= retry; attempt++) {
			try {
				return await this.random()
			} catch (err) {
				console.error(`Attempt ${attempt}/${retry} failed:`, err)
				console.error()
				if (attempt === retry) {
					throw err
				}
			}
		}
		throw new Error("All attempts failed")
	}

	async updateGhosttyConfig(colorscheme: string): Promise<void> {
		const configPath = path.join(this.ghosttyDir, "config")

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
			const sep = configContent.at(-1) === "\n" ? "" : "\n"
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

export default class GhosttyRandom extends Command {
	static description =
		"Convert a random Neovim colorscheme to Ghostty theme format, and set ghostty to use"
	static examples = ["<%= config.bin %> <%= command.id %>"]

	static flags = {
		retry: retryFlag,
	}

	public async run(): Promise<void> {
		const { flags } = await this.parse(GhosttyRandom)
		const randomer = new GhosttyRandomer()
		try {
			await randomer.randomAttempts(flags.retry)
		} finally {
			await randomer.cleanup()
		}
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	GhosttyRandom.run()
}
