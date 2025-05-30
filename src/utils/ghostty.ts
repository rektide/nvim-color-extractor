import fs from "fs"
import path from "path"
import os from "os"

export function prepareThemesDirectory(): string {
  const xdgConfigDir = process.env.XDG_CONFIG_DIR || path.join(os.homedir(), ".config")
  const ghosttyDir = path.join(xdgConfigDir, "ghostty", "themes")
  if (!fs.existsSync(ghosttyDir)) {
    fs.mkdirSync(ghosttyDir, { recursive: true })
  }
  return ghosttyDir
}
