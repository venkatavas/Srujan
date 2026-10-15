import { join } from 'node:path'

const config = {
  plugins: {
    // Scan only components/ for class names, from an absolute base (Next runs from the project
    // root): relative @source paths resolve differently under Turbopack dev and production builds.
    '@tailwindcss/postcss': { base: join(process.cwd(), 'components') },
  },
}

export default config
