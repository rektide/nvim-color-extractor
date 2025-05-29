" Simple dark color scheme for Vim/Neovim
let g:colors_name = "simple-dark"

set background=dark

highlight clear
if exists("syntax_on")
  syntax reset
endif

" Color definitions
let s:black = "#1a1a1a"
let s:white = "#f0f0f0"
let s:red = "#ff5555"
let s:green = "#55ff55"
let s:yellow = "#ffff55"
let s:blue = "#5555ff"
let s:purple = "#ff55ff"
let s:cyan = "#55ffff"
let s:gray = "#888888"

" Basic highlight groups
hi Normal guifg=#f0f0f0 guibg=#1a1a1a
hi Comment guifg=#888888 gui=italic
hi Constant guifg=#55ffff
hi String guifg=#55ff55
hi Identifier guifg=#5555ff
hi Function guifg=#ffff55
hi Statement guifg=#ff55ff
hi Error guifg=#f0f0f0 guibg=#ff5555
hi Todo guifg=#1a1a1a guibg=#ffff55 gui=bold
