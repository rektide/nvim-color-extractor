import * as child_process from 'node:child_process';
import { attach, findNvim } from 'neovim';
import { Neovim } from 'neovim';

export async function createNvim(): Promise<Neovim> {
  const found = findNvim({ orderBy: 'desc', minVersion: '0.9.0' });
  const nvim_proc = child_process.spawn(found.matches[0].path, ['--clean', '--embed'], {});
  return attach({ proc: nvim_proc });
}
