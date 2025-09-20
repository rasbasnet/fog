import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const rootDir = resolve(process.cwd())
const source = resolve(rootDir, 'dist/index.html')
const target = resolve(rootDir, 'dist/404.html')

await mkdir(dirname(target), { recursive: true })
await copyFile(source, target)

console.log('Created dist/404.html for GitHub Pages fallback.')
