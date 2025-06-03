import { Flags } from "@oclif/core"

export const retryFlag = Flags.integer({
    char: "r",
    description: "Number of times to retry on failure",
    default: 1,
    min: 1,
})
