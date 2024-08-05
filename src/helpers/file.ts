import { PathLike } from 'fs';
import { access, constants, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { homedir, platform } from 'os';
import { resolve } from 'path';

export const createFile = (path: PathLike, data: string) => writeFile(path, data, 'utf8');

export const remove = (path: PathLike) => rm(path, { recursive: true, force: true });

export const hasReadWriteAccess = (path: PathLike) =>
  access(path, constants.R_OK | constants.W_OK).then(
    () => true,
    () => false
  );

export { readFile, homedir as home, platform, mkdir, resolve };
