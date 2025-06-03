#!/usr/bin/env -S node --experimental-strip-types
import { Command } from "@oclif/core"
import process from "node:process"
import { execSync } from "node:child_process"
import GhosttyRandom from "./random.ts"

export default class GhosttyExec extends Command {
	static description = "Pick a random colorscheme and launch Ghostty with it"
	static examples = ["<%= config.bin %> <%= command.id %>"]

	private findGhosttyPath(): string {
		try {
			return execSync("which ghostty", { encoding: "utf8" }).trim()
		} catch (error) {
			throw new Error("Could not find ghostty in PATH")
		}
	}

	public async run(): Promise<void> {
		try {
			console.log(process.version)
			// First run ghostty:random to select and set a theme
			await GhosttyRandom.run([])

			// Find and execute ghostty
			const ghosttyPath = this.findGhosttyPath()
			process.execve(ghosttyPath, [ghosttyPath], process.env)
		} catch (error) {
			console.error(`Failed to execute Ghostty: ${error}`, { exit: 1 })
		}
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	GhosttyExec.run()
}
