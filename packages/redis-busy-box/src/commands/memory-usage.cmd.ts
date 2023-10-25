import { getMemoryUsage } from '../utils/get-memory-usage.util.js';

export async function memoryUsageCommand(
  pattern: string,
  options: { host: string; port: string; password?: string },
) {
  const memory = await getMemoryUsage(pattern, { redisOptions: options });

  const memoryInKb = Math.round(memory / 1024);

  const memoryInMb = Math.round(memory / 1024 / 1024);

  const memoryInGb = Math.round(memory / 1024 / 1024 / 1024);

  console.log(
    `Memory usage: ${memory} bytes / ${memoryInKb} kb / ${memoryInMb} mb / ${memoryInGb} gb`,
  );
}
