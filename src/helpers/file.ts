import type { PathLike } from 'node:fs';
import {
  access,
  constants,
  mkdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { homedir, platform } from 'node:os';
import { resolve } from 'node:path';

export const createFile = (path: PathLike, data: string) =>
  writeFile(path, data, 'utf8');

export const remove = (path: PathLike) =>
  rm(path, { recursive: true, force: true });

export const hasReadWriteAccess = (path: PathLike) =>
  access(path, constants.R_OK | constants.W_OK).then(
    () => true,
    () => false,
  );

export { readFile, homedir as home, platform, mkdir, resolve };
