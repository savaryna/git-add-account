import { defineConfig } from 'tsup';

export default defineConfig(({ watch }) => {
  return {
    entry: {
      main: 'src/index.ts',
    },
    outDir: 'bin',
    minify: true,
    clean: !watch,
  };
});
