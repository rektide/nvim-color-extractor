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

	public async randomAttempts(retry: number): Promise<string> {
		const randomer = new GhosttyRandomer()
		randomer.schemes = await listColorschemes(await randomer.nvim)

		for (let attempt = 1; attempt <= retry; attempt++) {
			try {
				return await randomer.random()
			} catch (err) {
				console.error(`Attempt ${attempt}/${retry} failed: ${err}`)
				if (attempt === retry) {
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
}

if (import.meta.url === `file://${process.argv[1]}`) {
	GhosttyRandom.run()
}
