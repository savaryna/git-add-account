import exec from './exec.js';

export const fileExists = (file) =>
  exec(`ls ${file}`).then(
    () => true,
    () => false
  );
