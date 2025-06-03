#!/usr/bin/env -S node --experimental-strip-types
import { Command } from "@oclif/core"
import process from "node:process"
import { exec } from "node:child_process"
import { promisify } from "node:util"
import GhosttyRandom from "./random.ts"

const execAsync = promisify(exec)

export default class GhosttyExec extends Command {
	static description = "Pick a random colorscheme and launch Ghostty with it"
	static examples = ["<%= config.bin %> <%= command.id %>"]

	private async findGhosttyPath(): Promise<string> {
		try {
			const { stdout } = await execAsync("which ghostty")
			return stdout.trim()
		} catch (error) {
			throw new Error("Could not find ghostty in PATH")
		}
	}

	public async run(): Promise<void> {
		try {
			// First run ghostty:random to select and set a theme
			await GhosttyRandom.run([])

			// Find and execute ghostty
			const ghosttyPath = await this.findGhosttyPath()
			process.execve?.(ghosttyPath, [ghosttyPath], process.env)
		} catch (error) {
			console.error(`Failed to execute Ghostty: ${error}`, { exit: 1 })
		}
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	GhosttyExec.run()
}
