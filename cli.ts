import fs from 'fs';
import { parseColorScheme } from './colorscheme-parser';

function main() {
  if (process.argv.length < 3) {
    console.error('Usage: ts-node cli.ts <theme-file>');
    process.exit(1);
  }

  const filePath = process.argv[2];
  const isLua = filePath.endsWith('.lua');
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const theme = parseColorScheme(content, isLua);
    console.log(JSON.stringify(theme, null, 2));
  } catch (error) {
    console.error(`Error parsing theme: ${error}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
