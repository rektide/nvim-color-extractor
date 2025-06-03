import { Args, Command } from "@oclif/core"
import { type Neovim } from "neovim"

import type { Zalgo, HlGroupsNum, ColorFormat } from "../../types.ts"
import { createNvim } from "../../utils/nvim.ts"
import { toColorFormat } from "../../utils/colors.ts"

export default class NvimExtract extends Command {
	static async extractColors(
		colorscheme: string | false,
		{
			nvim = createNvim() as Zalgo<Neovim>,
			format = "hex" as ColorFormat,
			ns = 0,
			link = true,
		} = {},
	) {
		const resolved = await nvim

		// Set the colorscheme
		if (colorscheme) {
			await resolved.command(`colorscheme ${colorscheme}`)
		}

		// Get all highlight groups
		const hlGroups = (await resolved.request("nvim_get_hl", [
			ns,
			{ link },
		])) as HlGroupsNum

		// `highlight clear` leaves a bunch of empty hlgroups in it's wake! boo.
		const keys = Object.keys(hlGroups)
		for (const key of keys) {
			const entry = hlGroups[key]

			if (Object.keys(entry).length === 0) {
				delete hlGroups[key]
			}
		}

		return format ? toColorFormat(hlGroups, format) : hlGroups
	}

	static description =
		"Extract highlight groups from a colorscheme with RGB color values"
	static examples = [
		"<%= config.bin %> <%= command.id %> gruvbox",
		"<%= config.bin %> <%= command.id %> solarized",
	]

	static args = {
		colorscheme: Args.string({
			description: "Name of colorscheme to extract",
			required: true,
		}),
	}

	public async run(): Promise<void> {
		const { args } = await this.parse(NvimExtract)

		let nvim
		try {
			nvim = await createNvim()

			const hlGroups = await NvimExtract.extractColors(args.colorscheme, {
				nvim,
			})

			console.log(JSON.stringify(hlGroups, null, "\t"))
		} catch (error) {
			console.error(`Failed to extract colors: ${error}`, { exit: 1 })
		}
		nvim?.quit()
	}
}

if (require.main === module) {
	NvimExtract.run()
}

export const extractColors = NvimExtract.extractColors
