import type { IncomingMessage, ServerResponse } from 'http';
import type { ParsedUrlQuery } from 'node:querystring';
import { parse, URL } from 'url';

import { pathToRegexp } from '~/senta/lib/path';
import { applyParams } from '~/senta/lib/params';

import type { Nullable, JsonType } from '../types';
import { SentaResponse } from './response';

export interface DevelopmentEnvironment {
  pattern: RegExp;
  path: string;
  params: string[];
}

export class Context {
  /**
   * `node:http.IncomingMessage`
   *
   * default nodejs request type
   *
   * @alias `ctx.res`
   */
  request: IncomingMessage;

  /**
   * `node:http.ServerResponse`
   *
   * default nodejs response type
   *
   * @alias `ctx.res`
   */
  response: ServerResponse;

  /**
   * query data
   *
   * ```txt
   * /abc?foo=bar => {foo: "bar"}
   * ```
   */
  query: ParsedUrlQuery;

  /**
   * ```txt
   * /api/users.ts => GET /api/users => {}
   * /api/user/[id]/index.ts => GET /api/user/hello => {id: "hello"}
   * ```
   */
  params: Record<string, string | null>;

  url: URL;

  pathname: string;

  __DEV__: Nullable<DevelopmentEnvironment>;

  constructor(
    req: IncomingMessage,
    res: ServerResponse,
    init?: { path: string; params: string[] }
  ) {
    this.request = req;
    this.response = res;

    this.url = new URL(req.url as string, `http://${req.headers.host}`);
    this.pathname = this.url.pathname;
    this.query = parse(this.url.search, true).query;

    if (init) {
      const parsed = pathToRegexp(init.path, false);

      const params = applyParams(req, parsed.pattern, parsed.params);

      this.params = params;
      this.__DEV__ = {
        pattern: parsed.pattern,
        params: parsed.params,
        path: init.path,
      };
    }
  }

  send(
    chunk: string | number | JsonType | boolean | bigint | SentaResponse,
    status?: number
  ) {
    const ctx = this;

    if (ctx.response.writableEnded) return;

    if (status) ctx.response.statusCode = status;

    if (Array.isArray(chunk)) {
      chunk = JSON.stringify(chunk as Array<any>);
    }

    if (chunk instanceof SentaResponse) {
      ctx.headers(chunk.headers);
      ctx.send(chunk.format());
      return;
    }

    switch (typeof chunk) {
      case 'string':
        break;
      case 'number':
        chunk = (chunk as number).toString();
        break;
      case 'object':
        chunk = JSON.stringify(chunk);
        break;
      case 'boolean':
        chunk = chunk.toString();
        break;
      case 'undefined':
        console.warn("Server Error: 'undefined' is not a valid response body");
        return;
      case 'bigint':
        chunk = chunk.toString();
        break;

      default:
        console.warn(`unknow chunk type: ${typeof chunk} (received: ${chunk})`);
        break;
    }

    ctx.response.end(chunk);
  }

  html(body: string) {
    this.response.setHeader('Content-Type', 'text/html');
    this.send(body);
  }

  json(body: JsonType) {
    this.response.setHeader('Content-Type', 'application/json');
    this.send(body);
  }

  text(body: string) {
    this.response.setHeader('Content-Type', 'text/plain');
    this.send(body);
  }

  redirect(url: string, status = 302) {
    this.response.setHeader('Location', url);
    this.response.statusCode = status;
    this.response.end();
  }

  /**
   * set only one header
   *
   * ```ts
   * ctx.setHeader('Content-Type', 'text/plain');
   * ```
   *
   * @param field header field
   * @param value header value
   * @returns context
   */
  set(field: string, value: string) {
    this.response.setHeader(field, value);

    return this;
  }

  /**
   * set multiple headers
   *
   * ```ts
   * ctx.headers({"foo": "bar"});
   * ```
   * @param headers Headers object
   */
  headers(headers: JsonType) {
    for (const [key, value] of Object.entries(headers)) {
      this.set(key, value as string);
    }
  }

  status(status: number) {
    this.response.statusCode = status;

    return this;
  }
}
