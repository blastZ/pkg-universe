import { readdir } from 'node:fs/promises';

export async function getFileNameByExtensions(
  path: string,
  baseName: string,
  extensions: string[] = ['js', 'mjs', 'cjs'],
) {
  const filesInDirectory = new Set(await readdir(path));

  for (const extension of extensions) {
    const fileName = `${baseName}.${extension}`;

    if (filesInDirectory.has(fileName)) {
      return fileName;
    }
  }

  return undefined;
}
