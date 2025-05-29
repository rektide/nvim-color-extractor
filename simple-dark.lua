-- Simple dark color scheme for Neovim
local M = {}

M.colors = {
  black = "#1a1a1a",
  white = "#f0f0f0",
  red = "#ff5555",
  green = "#55ff55",
  yellow = "#ffff55",
  blue = "#5555ff",
  purple = "#ff55ff",
  cyan = "#55ffff",
  gray = "#888888",
}

M.setup = function()
  vim.g.colors_name = "simple-dark"

  -- Set background
  vim.opt.background = "dark"

  -- Set basic colors
  vim.api.nvim_set_hl(0, "Normal", { fg = M.colors.white, bg = M.colors.black })
  vim.api.nvim_set_hl(0, "Comment", { fg = M.colors.gray, italic = true })
  vim.api.nvim_set_hl(0, "Constant", { fg = M.colors.cyan })
  vim.api.nvim_set_hl(0, "String", { fg = M.colors.green })
  vim.api.nvim_set_hl(0, "Identifier", { fg = M.colors.blue })
  vim.api.nvim_set_hl(0, "Function", { fg = M.colors.yellow })
  vim.api.nvim_set_hl(0, "Statement", { fg = M.colors.purple })
  vim.api.nvim_set_hl(0, "Error", { fg = M.colors.white, bg = M.colors.red })
  vim.api.nvim_set_hl(0, "Todo", { fg = M.colors.black, bg = M.colors.yellow, bold = true })
end

return M
