import { defineConfig } from 'tsup';

export default defineConfig(({ watch }) => {
  return {
    entry: {
      main: 'index.js',
    },
    outDir: 'bin',
    minify: true,
    clean: !watch,
  };
});
