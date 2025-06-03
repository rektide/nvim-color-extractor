#!/usr/bin/env -S node --experimental-strip-types
import { Command } from "@oclif/core"
import process from "node:process"
import GhosttyRandom from "./random.ts"

export default class GhosttyExec extends Command {
	static description = "Pick a random colorscheme and launch Ghostty with it"
	static examples = ["<%= config.bin %> <%= command.id %>"]

	public async run(): Promise<void> {
		try {
			console.log(process.version)
			// First run ghostty:random to select and set a theme
			await GhosttyRandom.run([])

			// Replace current process with Ghostty
			process.execve?.("ghostty", ["ghostty"], process.env)
		} catch (error) {
			console.error(`Failed to execute Ghostty: ${error}`, { exit: 1 })
		}
	}
}

if (require.main === module) {
	GhosttyExec.run()
}
