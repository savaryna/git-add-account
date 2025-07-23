import { exec } from 'node:child_process';
import { promisify } from 'node:util';

export default promisify(exec);
