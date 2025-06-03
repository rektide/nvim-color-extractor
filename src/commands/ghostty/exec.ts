#!/usr/bin/env -S node --experimental-strip-types
import { Command } from "@oclif/core"
import { retryFlag } from "../../utils/flags.ts"
import process from "node:process"
import { exec } from "node:child_process"
import { promisify } from "node:util"
import GhosttyRandom from "./random.ts"

const execAsync = promisify(exec)

export default class GhosttyExec extends Command {
	static description = "Pick a random colorscheme and launch Ghostty with it"
	static examples = ["<%= config.bin %> <%= command.id %>"]

	static flags = {
		retry: retryFlag,
	}

	private async findGhosttyPath(): Promise<string> {
		try {
			const { stdout } = await execAsync("which ghostty")
			return stdout.trim()
		} catch (error) {
			throw new Error("Could not find ghostty in PATH")
		}
	}

	public async run(): Promise<void> {
		const { flags } = await this.parse(GhosttyExec)
		let lastError: Error | undefined
		
		for (let attempt = 1; attempt <= flags.retry; attempt++) {
			try {
			// First run ghostty:random to select and set a theme
			await GhosttyRandom.run(["--retry", flags.retry.toString()])

			// Find and execute ghostty
			const ghosttyPath = await this.findGhosttyPath()
			process.execve?.(ghosttyPath, [ghosttyPath], process.env)
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
}

if (import.meta.url === `file://${process.argv[1]}`) {
	GhosttyExec.run()
}
