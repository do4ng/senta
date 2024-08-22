import * as Senta from './packages/senta/dist/index';

const senta: typeof import('./packages/senta/dist/src/index') = Senta;

const server = senta.senta();

server.use(
  () =>
    new senta.SentaResponse({
      type: 'json',
      body: {
        name: 'Hello World!',
      },
    })
);

server.server.listen(3000);
