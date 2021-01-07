import childProcess from 'child_process';

export function exec(cmd: string) {
  const output = childProcess.execSync(cmd, { encoding: 'utf-8' });
  console.log(output);
  return output;
}

export function execForList(cmd: string) {
  const result = exec(cmd);
  return cmd.split('\n').map(item => item.trim()).filter(Boolean);
}
