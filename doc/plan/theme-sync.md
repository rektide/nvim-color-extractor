# OPENCODE Plan

## Overview

Add OpenCode theme synchronization commands to nvim-color-extractor, enabling automatic theme management between Neovim's project-color-nvim plugin and OpenCode TUI. This allows users to maintain consistent theming across their development environment.

## Background

**SHORT-NAMES:**

- OPENCODE - Epic for OpenCode theme integration features
- PROJECTCONFIG - nvim-projectconfig system storing per-project colorscheme preferences
- OPENCODE-SET - Command to directly set OpenCode theme in config
- OPENCODE-PROJECTCONFIG - Command to sync theme from projectconfig
- OPENCODE-PROJECTCONFIG-AUTO - Feature to auto-export missing themes from nvim

## Current State

**nvim-color-extractor** already has `opencode:export` command that converts nvim colorschemes to OpenCode theme format and outputs JSON to stdout.

**color-persist-nvim** provides projectconfig integration via nvim-projectconfig, storing per-project theme preferences in `~/.config/nvim/projects/<project-name>.json` with key `color-persist`.

**OpenCode** stores themes in:

- `~/.config/opencode/themes/*.json` (user-wide)
- `.opencode/themes/*.json` (project-specific)
- Config has `theme` field referencing theme name

## Proposed Architecture

### Component: OPENCODE-SET Command

**Location:** `src/commands/opencode/set.ts`

**Purpose:** Directly set OpenCode theme in configuration

**Data Flow:**

1. Accept theme name as argument
2. Validate theme exists (check built-in themes + custom theme paths)
3. Update `~/.config/opencode/opencode.json` or project-local `.opencode/opencode.json`
4. Write `{ "theme": "<theme-name>" }`

**API:**

```bash
nvim-color-extractor opencode:set tokyonight
nvim-color-extractor opencode:set tokyonight --project  # Use project config
```

**Key Considerations:**

- Use XDG config directories for paths
- Merge with existing config (preserve other settings)
- Support both global and project-local configs
- Prefer project config if in project root

### Component: OPENCODE-PROJECTCONFIG Command

**Location:** `src/commands/opencode/projectconfig.ts`

**Purpose:** Read projectconfig theme preference, set in OpenCode, auto-export if missing

**Data Flow:**

1. Derive project name from current working directory (same as nvim-projectconfig)
2. Read `~/.config/nvim/projects/<project-name>.json`
3. Extract `color-persist` key value
4. **OPENCODE-PROJECTCONFIG-AUTO:**
   - Check if theme exists in OpenCode theme directories
   - If missing: auto-export from nvim using existing `opencode:export`
   - Save to `~/.config/opencode/themes/<theme-name>.json`
5. Update OpenCode config with theme name

**API:**

```bash
nvim-color-extractor opencode:projectconfig
```

**Key Considerations:**

- Project name derivation: `path.basename(path.dirname(cwd))` (same as nvim-projectconfig)
- Use `THEME-SET` command internally for config updates
- Reuse existing `OpenCodeExport.convertToOpenCodeTheme()` for exports
- Handle missing projectconfig file gracefully
- Support `--export-path` flag for custom theme destination

### Component: OPENCODE-PROJECTCONFIG-AUTO Feature

**Purpose:** Automatically export missing themes from nvim before setting them in OpenCode

**Data Flow:**

1. Given theme name, search OpenCode theme directories:
   - Built-in theme list (tokyonight, gruvbox, etc.)
   - `~/.config/opencode/themes/*.json`
   - `.opencode/themes/*.json`
2. If found, proceed with theme set
3. If not found:
   - Call `OpenCodeExport.convertToOpenCodeTheme()` with nvim colorscheme
   - Write to `~/.config/opencode/themes/<theme-name>.json`
   - Proceed with theme set

**Error Handling:**

- If nvim colorscheme doesn't exist: error with available list
- If export fails: preserve partial state, clear up on error
- Log exported theme path for debugging

### Data Structures

**Projectconfig JSON:**

```json
{
	"color-persist": "gruvbox",
	"other-plugin-settings": "..."
}
```

**OpenCode Config JSON:**

```json
{
	"$schema": "https://opencode.ai/config.json",
	"theme": "gruvbox",
	"other-settings": "..."
}
```

**OpenCode Theme JSON:** (already exists in export.ts)

### Integration Points

**Existing Components:**

- `src/commands/opencode/export.ts` - Reuse `convertToOpenCodeTheme()` method
- `src/utils/nvim.ts` - Reuse nvim connection for theme extraction
- `src/commands/nvim/extract.ts` - Reuse colorscheme extraction

**New Components:**

- `src/utils/opencode-config.ts` - OpenCode config read/write utilities
- `src/utils/opencode-theme.ts` - Theme existence checking and export
- `src/utils/projectconfig.ts` - Projectconfig JSON reading

### Configuration Paths

**XDG Config Pattern:**

- Use `process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config')`
- OpenCode config: `<XDG_CONFIG_HOME>/opencode/opencode.json`
- OpenCode themes: `<XDG_CONFIG_HOME>/opencode/themes/*.json`
- Project config: `<XDG_CONFIG_HOME>/nvim/projects/<project-name>.json`
- Project themes: `<cwd>/.opencode/themes/*.json`

## Implementation Strategy

### Phase 1: Foundation Utilities

1. Create `src/utils/opencode-config.ts` - Config read/write with merge
2. Create `src/utils/opencode-theme.ts` - Theme existence checking
3. Create `src/utils/projectconfig.ts` - Project JSON reading

### Phase 2: OPENCODE-SET Command

1. Create `src/commands/opencode/set.ts`
2. Implement theme validation
3. Implement config update logic
4. Add tests

### Phase 3: OPENCODE-PROJECTCONFIG-AUTO Feature

1. Extend `src/utils/opencode-theme.ts` with export logic
2. Integrate with existing export.ts
3. Add error handling and cleanup
4. Add tests

### Phase 4: OPENCODE-PROJECTCONFIG Command

1. Create `src/commands/opencode/projectconfig.ts`
2. Implement project name derivation
3. Implement projectconfig reading
4. Integrate OPENCODE-PROJECTCONFIG-AUTO
5. Integrate OPENCODE-SET
6. Add tests

## Exploration Areas

### OpenCode Config Format

- **Research:** Exact merge behavior needed?
- **Research:** Does OpenCode reload config on file change or need restart?
- **Research:** How does opencode CLI `opencode config` show config - can we inspect?

### Theme Discovery

- **Research:** Built-in theme names list (hardcode or dynamic?)
- **Research:** Does OpenCode theme loading support wildcards or glob patterns?
- **Research:** Theme name conflicts between built-in and custom themes?

### Project Name Derivation

- **Research:** Confirm nvim-projectconfig uses `:p:h:t` modifier
- **Exploration:** What if CWD is exactly `~/.config/nvim`? Should project be `nvim` or `config`?
- **Exploration:** Handle symlinks in path resolution?

### Error Scenarios

- **Exploration:** What if projectconfig has no `color-persist` key?
- **Exploration:** What if nvim colorscheme name differs from OpenCode theme name (e.g., "tokyonight-night" vs "tokyonight")?
- **Exploration:** How to handle partial config write failures?

### Cross-Platform Compatibility

- **Exploration:** Windows path handling for XDG_CONFIG_HOME?
- **Exploration:** File permission issues on theme write?
- **Exploration:** Lock files for concurrent config access?

## Open Questions

1. Should THEME-PROJECTCONFIG verify the exported theme is syntactically valid before setting it?
2. Should we support a `--dry-run` flag to preview what would happen?
3. Should THEME-SET support setting custom inline theme content, or only theme name references?
4. How should we handle theme name conflicts between built-in themes and user exports?
5. Should THEME-PROJECTCONFIG fallback to a default theme if projectconfig is missing?
6. Should we add a command to list all available themes (built-in + custom)?
7. Should we support theme aliases in projectconfig (e.g., "tokyonight" maps to "tokyonight-moon")?

## Success Criteria

- [ ] `nvim-color-extractor opencode:set <theme>` sets theme in OpenCode config
- [ ] `nvim-color-extractor opencode:projectconfig` reads projectconfig and sets theme
- [ ] OPENCODE-PROJECTCONFIG auto-exports missing themes from nvim
- [ ] Commands handle missing config files gracefully
- [ ] Commands preserve existing OpenCode config settings
- [ ] Error messages are clear and actionable
- [ ] All commands follow oclif patterns from existing codebase
- [ ] Configuration uses XDG-compliant paths
