import type { IncomingMessage } from 'http';

export function applyParams(req: IncomingMessage, pattern: RegExp, params: string[]) {
  if (!pattern) return {};

  // @ts-expect-error
  const execd: string[] = new URL(
    req.url as string,
    `http://${req.headers.host}`
  ).pathname.match(pattern);

  const output: Record<string, string | null> = {};

  params.forEach((param, index) => {
    output[param] = execd[index + 1] || null;
  });

  return output;
}
