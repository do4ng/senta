import { createServer } from 'http';

export interface Config {
  server?: {
    port?: number;
  };
  createServer?: typeof createServer;
  fetch?: typeof fetch;
}
