export function format(first: string, middle: string, last: string): string {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}

export function idGeneration(): string {
  return Math.random().toString(36).substring(7);
}
