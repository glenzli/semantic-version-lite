import childProcess from 'child_process';

export function exec(cmd: string) {
  const output = childProcess.execSync(cmd, { encoding: 'utf-8' });
  return output;
}

export function execSingleLine(cmd: string) {
  return exec(cmd).replace(/\n/g, '').trim();
}

export function execForList(cmd: string) {
  const result = exec(cmd);
  return result.split('\n').map(item => item.trim()).filter(Boolean);
}
