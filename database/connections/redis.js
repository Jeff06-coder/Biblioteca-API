const { createClient } = require('redis');

const client = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

client.on('error', (erro) => console.error('Erro no Redis:', erro.message));

client.connect().catch((erro) => {
  console.error('Falha ao conectar no Redis:', erro.message);
});

module.exports = client;
