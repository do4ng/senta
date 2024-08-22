import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { AddressInfo } from 'net';
import { Config } from '../configuration';
import { Context } from './context';
import type { Asyncable, Nullable } from '../types';
import { SentaResponse } from './response';

export type Middleware = (context: Context, next: () => void) => Asyncable<void>;

/**
 * + `Response`
 * ```ts
 * return new Response();
 * ```
 */
export type PageResponse = Nullable<SentaResponse>;

export type Page = (context: Context) => Asyncable<PageResponse>;

class App {
  /**
   * `node:http.createServer`
   *
   * creating a new server
   */
  createServer: typeof createServer;

  /**
   * `node:https.Server` instance
   */
  server: Server;

  /**
   * middleware array
   *
   * ```ts
   * type Middleware = (ctx: Context, next: () => void) => Promise<void> | void
   * ```
   */
  middlewares: Middleware[] = [];

  config: Config;

  routes: Record<string, Page>;

  constructor(config: Config) {
    this.config = config;
    this.createServer = this.config.createServer || createServer;

    // after node v17.5
    if (typeof global.fetch !== 'undefined') {
      this.config.fetch = global.fetch;
    }

    // create server
    this.server = this.createServer(async (req, res) => {
      await this.handleRequest(req, res);
    });
  }

  // > router

  // > server functions

  /**
   * append middleware
   * ```ts
   * use((ctx, next) => {
   *   next();
   * })
   * ```
   * @param middlewares the array of middlewares
   */
  use(middlewares: Middleware[] | Middleware) {
    if (!Array.isArray(middlewares)) {
      middlewares = [middlewares];
    }

    this.middlewares.push(...middlewares);
  }

  fetch(url: string, init?: RequestInit) {
    if (!this.config.fetch) {
      throw new Error(
        'fetch function is undefined. Please update nodejs v17.5.0 or install dependencies for fetch().'
      );
    }

    const address = this.server.address() as AddressInfo;
    url = url.replace('http://localhost/', `http://localhost:${address.port}/`);

    return this.config.fetch(url, init);
  }

  protected async handleRequest(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<void> {
    const context = new Context(req, res);

    // middleware must not be []
    if (this.middlewares.length === 0) return;

    const { middlewares } = this;

    let index = -1;

    const loop = async () => {
      // if response sent, loop end
      if (index < middlewares.length && !context.response.writableEnded) {
        const middleware = middlewares[(index += 1)]; // next middleware

        if (middleware) {
          await middleware(context, loop);
        }
      }
    };

    loop();
  }
}

// create server func

/**
 * Create new senta server
 * ```ts
 * const app = require("senta").senta();
 *
 * app.use();
 *
 * app.listen(3000);
 * ```
 * @param options Server options
 * @returns Server instance
 */
function senta(options?: Config) {
  return new App(options || {});
}

export { App, senta, SentaResponse };
