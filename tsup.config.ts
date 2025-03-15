import { defineConfig } from 'tsup';

export default defineConfig(({ watch }) => {
  return {
    loader: {
      '.mustache': 'text',
    },
    entry: {
      main: 'src/index.ts',
    },
    outDir: 'bin',
    minify: true,
    clean: !watch,
  };
});
