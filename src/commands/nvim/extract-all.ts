#!/usr/bin/env -S node --experimental-strip-types
import { Command } from "@oclif/core"
import { createNvim } from "../../utils/nvim.ts"
import { buildRestoreColors, restoreColors } from "../../utils/restore.ts"
import { extractColors } from "./extract.ts"
import { listColorschemes } from "./list.ts"

export default class NvimExtractAll extends Command {
	static description = "Extract highlight groups for all available colorschemes"
	static examples = ["<%= config.bin %> <%= command.id %>"]

	public async run(): Promise<void> {
		let nvim
		try {
			nvim = await createNvim()

			// Build restore function with current default colors
			await buildRestoreColors(nvim)

			// Get all colorschemes using ListColorschemes utility
			const schemes = await listColorschemes(nvim)

			const results: Record<string, any> = {}

			for (const name of schemes) {
				try {
					// Extract colors for this scheme
					const colors = await extractColors(name, { nvim, format: "hex" })

					// Store results
					results[name] = colors

					console.error(`Extracted ${name}... (${Object.keys(colors).length})`)
				} catch (error) {
					console.error(`Error extracting ${name}: ${error}`)
				} finally {
					// Restore to original colors
					await restoreColors(nvim)
				}
			}

			// Output all results as JSON
			console.log(JSON.stringify(results, null, "\t"))
		} catch (error) {
			console.error(`Failed to extract colorschemes: ${error}`, { exit: 1 })
		} finally {
			nvim?.quit()
		}
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	NvimExtractAll.run()
}
