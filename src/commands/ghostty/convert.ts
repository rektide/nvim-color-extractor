#!/usr/bin/env -S node --experimental-strip-types
import fs from "node:fs"
import path from "node:path"
import { Args, Command } from "@oclif/core"

import type { HlGroupsHex } from "../../types.ts"
import { NvimGhosttyBase } from "../../utils/nvim-ghostty.ts"
import { extractColors } from "../nvim/extract.ts"

export class GhosttyConverter extends NvimGhosttyBase {
	public static writeTheme(file: fs.WriteStream, hlGroups: HlGroupsHex): void {
		// Validate groups exists and have required colors
		const normalGroup = hlGroups.Normal
		const cursorGroup = hlGroups.Cursor
		const visualGroup = hlGroups.Visual
		if (!normalGroup) {
			throw new Error("Colorscheme has no Normal highlight group")
		}
		if (!normalGroup.fg || !normalGroup.bg) {
			throw new Error(
				"Normal group must have both foreground and background colors",
			)
		}
		if (!cursorGroup) {
			throw new Error("Colorscheme has no Cursor highlight group")
		}
		if (!cursorGroup.fg) {
			throw new Error("Cursor group must have foreground")
		}
		if (!visualGroup) {
			throw new Error("Colorscheme has no Visual highlight group")
		}
		if (!visualGroup.fg || !visualGroup.bg) {
			throw new Error(
				"Visual group must have both foreground and background colors",
			)
		}

		// Collect all unique foreground colors with no background
		const colors = new Set<string>()
		for (const [groupName, group] of Object.entries(hlGroups)) {
			if (group.bg) {
				// assuming for now these wont contrast adequately versus the default background
				continue
			}
			if (group.fg) {
				colors.add(group.fg)
			}
			if (group.sp) {
				colors.add(group.sp)
			}
		}

		// remove basic colors
		colors.delete(normalGroup.fg)
		colors.delete(cursorGroup.fg)
		colors.delete(visualGroup.fg)
		colors.delete(visualGroup.bg)

		// Write header using Normal and Visual group colors
		file.write(`foreground = ${normalGroup.fg}\n`)
		file.write(`background = ${normalGroup.bg}\n`)
		file.write(`cursor-text = ${cursorGroup.fg}\n`)
		file.write(`selection-foreground = ${visualGroup.fg}\n`)
		file.write(`selection-background = ${visualGroup.bg}\n`)
		file.write(`\n`)

		// Create palette with remaining colors
		let availableColors = Array.from(colors)
		for (let i = 0; i < 16; i++) {
			if (availableColors.length === 0) {
				console.error(`ran out of colors at: ${i}`)
				// If we run out of colors, re-use the set
				availableColors = Array.from(colors)
			}
			const randomIndex = Math.floor(Math.random() * availableColors.length)
			const color = availableColors[randomIndex]
			file.write(`palette = ${i}=${color}\n`)
			availableColors.splice(randomIndex, 1) // Remove used color
		}
	}

	public async convert(colorscheme: string): Promise<void> {
		let file: fs.WriteStream | undefined
		let themePath: string | undefined
		try {
			// Extract colors in hex format
			const hlGroups = (await extractColors(colorscheme, {
				nvim: this.nvim,
				format: "hex",
			})) as HlGroupsHex

			// Write theme
			themePath = path.join(this.ghosttyDir, colorscheme)
			file = fs.createWriteStream(themePath, { flags: "ax" })
			GhosttyConverter.writeTheme(file, hlGroups)

			console.log(`Successfully created Ghostty theme at: ${themePath}`)
		} finally {
			if (file) {
				file.end()
				if (themePath) {
					// cleanup bad file
					await fs.promises.rm(themePath)
				}
			}
		}
	}
}

export default class GhosttyConvert extends Command {
	static description = "Convert a Neovim colorscheme to Ghostty theme format"
	static examples = ["<%= config.bin %> <%= command.id %> gruvbox"]

	static args = {
		colorscheme: Args.string({
			description: "Name of colorscheme to convert",
			required: true,
		}),
	}

	public async run(): Promise<void> {
		const { args } = await this.parse(GhosttyConvert)
		const converter = new GhosttyConverter()

		try {
			await converter.convert(args.colorscheme)
		} catch (err) {
			console.error(`Failed to create Ghostty theme: ${err}`)
			throw err
		} finally {
			await converter.cleanup()
		}
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	GhosttyConvert.run()
}
