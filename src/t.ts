import * as path from 'path'
import { createFS } from "./main";

async function main() {
const fs = createFS({
  base: process.cwd()
})
await fs.save(path.join(process.cwd(), 'tt.txt'), 'Hey')
await fs.save(['pera', 'tt2.txt'], 'Hey')
}
main().catch(err => {
  console.error(err);
  process.exit(1);
})