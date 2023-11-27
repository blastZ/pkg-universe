export function convertToString(data: any): string {
  if (Array.isArray(data)) {
    return data.map((o) => convertToString(o)).join(',');
  }

  if ([null, undefined].includes(data)) {
    return '';
  }

  if (typeof data === 'object') {
    return JSON.stringify(data);
  }

  return String(data);
}
