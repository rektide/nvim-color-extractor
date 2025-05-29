-- Convert Neovim color integer to RGB components
-- @param color The color integer (e.g., from vim.api.nvim_get_hl())
-- @return table with r, g, b values (0-255)
local function color_int_to_rgb(color)
  if type(color) ~= 'number' then return nil end
  return {
    r = bit.band(bit.rshift(color, 16), 0xFF),
    g = bit.band(bit.rshift(color, 8), 0xFF),
    b = bit.band(color, 0xFF)
  }
end

local bit = require('bit')

-- Create a new buffer to display the results
local buf = vim.api.nvim_create_buf(true, false)
vim.api.nvim_set_current_buf(buf)

-- Get all highlight groups
local highlights = vim.api.nvim_get_hl(0, {})

-- Filter and collect color-related highlight group names
local color_groups = {}
for hl_name, _ in pairs(highlights) do
  if not hl_name:match('^@') and  -- Skip treesitter groups if desired
     not hl_name:match('^%.') then -- Skip special groups
    table.insert(color_groups, hl_name)
  end
end

-- Sort alphabetically
table.sort(color_groups)

-- Add header and results to buffer
local lines = {
  "=== Color Highlight Groups ===",
  "Count: " .. #color_groups,
  ""
}
for _, name in ipairs(color_groups) do
  table.insert(lines, name)
end

-- Set buffer content
vim.api.nvim_buf_set_lines(buf, 0, -1, false, lines)

-- Set some buffer options
vim.api.nvim_buf_set_option(buf, 'filetype', 'markdown')
vim.api.nvim_buf_set_option(buf, 'buftype', 'nofile')
vim.api.nvim_buf_set_name(buf, 'Color Highlight Groups')

-- Optional: Add syntax highlighting
vim.cmd('syntax match Title /^===.*===$/')
vim.cmd('syntax match Comment /^Count:.*$/')
