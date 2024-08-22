import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../server';

describe('Context instance', () => {
  let app: App;

  beforeEach(() => {
    app = new App({});
  });

  afterEach(() => {
    setImmediate(() => {
      app.server.emit('close');
    });
  });

  it('context.send', async () => {
    app = new App({});

    const data = { id: 10 };

    app.use((ctx) => {
      ctx.json(data);
    });

    await new Promise<void>((resolve) => {
      app.server.listen(3000, async () => {
        const res = await app.fetch('http://localhost/');

        const json = await res.json();

        expect(res.status).toBe(200);

        expect(json).toStrictEqual(data);

        resolve();
      });
    });
  });
});
