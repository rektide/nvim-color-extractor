#!/usr/bin/env -S node --experimental-strip-types
import { Command } from "@oclif/core"
import process from "node:process"
import { exec } from "node:child_process"
import { promisify } from "node:util"

import { retryFlag } from "../../utils/flags.ts"
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
		// First run ghostty:random to select and set a theme
		await GhosttyRandom.run(["--retry", flags.retry.toString()])

		// Find and execute ghostty
		const ghosttyPath = await this.findGhosttyPath()
		process.execve?.(ghosttyPath, [ghosttyPath], process.env)
		return // Success - exit the retry loop
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	GhosttyExec.run()
}
