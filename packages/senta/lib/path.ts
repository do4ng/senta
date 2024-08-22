/**
 * `api/[user].json.ts` => `api/:user.(json)`
 * @param filename filename
 */
export function transformFilename(filename: string): string {
  filename = filename.replace(/\\/g, '/');
  const sliced = filename.split('/');

  return sliced
    .map((part) => {
      if (part.startsWith('[...') && part.endsWith(']')) {
        return '*';
      }
      if (part.startsWith('[') && part.endsWith(']')) {
        return `:${part.slice(1, part.length - 1)}`;
      }
      return part;
    })
    .join('/');
}

export function pathToRegexp(
  path: string,
  loose: boolean
): { params: string[]; pattern: RegExp } {
  if (path[0] === '/') path = path.slice(1);

  const paths = path.split('/');
  let pattern = '';
  const params: any[] = [];

  paths.forEach((p) => {
    p = p.trim();

    if (p === '*') {
      pattern += '/(.*)';
      params.push('*');
    } else if (p[0] === ':') {
      if (p.endsWith('?')) {
        pattern += '(?:/([^/]+?))?';
        p = p.slice(0, -1);
      } else {
        pattern += '/([^/]+?)';
      }

      if (p.includes('.')) {
        params.push(p.slice(1, p.indexOf('.')));
        pattern += `${p.slice(p.indexOf('.'))}`;
      } else {
        params.push(p.slice(1));
      }
    } else {
      pattern += `/${p}`;
    }
  });
  return {
    params,
    pattern: new RegExp(`^${pattern}${loose ? '(?=$|/)' : '/?$'}`, 'i'),
  };
}
