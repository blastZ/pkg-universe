import { Context } from 'koa';

export default function getExecuteTime(this: Context) {
  if (
    !this.state.requestStartTime ||
    !Array.isArray(this.state.requestStartTime) ||
    this.state.requestStartTime.length !== 2
  ) {
    return 0;
  }

  const currentTime = process.hrtime(
    this.state.requestStartTime as [number, number],
  );
  const executeTime = currentTime[0] * 1000 + currentTime[1] / 1000000;

  return executeTime;
}
