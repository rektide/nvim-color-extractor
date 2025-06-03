import { Flags } from "@oclif/core"

export const retryFlag = Flags.integer({
    char: "r",
    description: "Number of times to retry on failure",
    default: 7,
    min: 1,
})
