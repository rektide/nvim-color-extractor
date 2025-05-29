interface ColorScheme {
  name: string;
  colors: Record<string, string>;
  highlights: Record<string, HighlightGroup>;
}

interface HighlightGroup {
  fg?: string;
  bg?: string;
  sp?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  undercurl?: boolean;
  reverse?: boolean;
}

class ColorSchemeParser {
  private content: string;
  private isLua: boolean;

  constructor(content: string, isLua = false) {
    this.content = content;
    this.isLua = isLua;
  }

  parse(): ColorScheme {
    const theme: Partial<ColorScheme> = {
      name: 'unknown',
      colors: {},
      highlights: {}
    };

    if (this.isLua) {
      this.parseLuaTheme(theme);
    } else {
      this.parseVimTheme(theme);
    }

    return theme as ColorScheme;
  }

  private parseLuaTheme(theme: Partial<ColorScheme>) {
    // Basic Lua parsing - would need to be expanded
    const colorMatches = this.content.matchAll(/colors\.([a-zA-Z0-9_]+)\s*=\s*["']([^"']+)["']/g);
    for (const match of colorMatches) {
      theme.colors![match[1]] = match[2];
    }

    const hlMatches = this.content.matchAll(/hl\(["']([^"']+)["']\s*,\s*{([^}]+)}/g);
    for (const match of hlMatches) {
      const group = match[1];
      const attrs = match[2];
      theme.highlights![group] = this.parseHighlightAttributes(attrs);
    }
  }

  private parseVimTheme(theme: Partial<ColorScheme>) {
    // Basic Vimscript parsing - would need to be expanded
    const colorMatches = this.content.matchAll(/(?:let\s+)?(g:)?colors_name\s*=\s*["']([^"']+)["']/g);
    for (const match of colorMatches) {
      theme.name = match[2];
    }

    const hlMatches = this.content.matchAll(/hi(ghlight)?\s+([a-zA-Z0-9_]+)\s+(.+)/g);
    for (const match of hlMatches) {
      const group = match[2];
      const attrs = match[3];
      theme.highlights![group] = this.parseHighlightAttributes(attrs);
    }
  }

  private parseHighlightAttributes(attrs: string): HighlightGroup {
    const result: HighlightGroup = {};
    const parts = attrs.split(/\s+/);

    for (const part of parts) {
      if (part.startsWith('guifg=')) {
        result.fg = part.substring(6);
      } else if (part.startsWith('guibg=')) {
        result.bg = part.substring(6);
      } else if (part.startsWith('guisp=')) {
        result.sp = part.substring(6);
      } else if (part === 'bold') {
        result.bold = true;
      } else if (part === 'italic') {
        result.italic = true;
      } else if (part === 'underline') {
        result.underline = true;
      } else if (part === 'undercurl') {
        result.undercurl = true;
      } else if (part === 'reverse') {
        result.reverse = true;
      }
    }

    return result;
  }
}

export function parseColorScheme(content: string, isLua = false): ColorScheme {
  return new ColorSchemeParser(content, isLua).parse();
}
