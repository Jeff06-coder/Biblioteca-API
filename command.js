#!/usr/bin/env node
require('dotenv').config();

const { execSync } = require('child_process');

// Mapeia comandos "amigáveis" para os comandos reais do sequelize-cli.
// Satisfaz o requisito: "Um entrypoint para comandos CLI Node.js" +
// "pelo menos um command para executar as migrations" (node command.js migrate).
const comandos = {
  migrate: 'npx sequelize-cli db:migrate',
  'migrate:undo': 'npx sequelize-cli db:migrate:undo',
  'migrate:status': 'npx sequelize-cli db:migrate:status',
  seed: 'npx sequelize-cli db:seed:all',
  'seed:undo': 'npx sequelize-cli db:seed:undo:all',
};

const comando = process.argv[2];

if (!comando || !comandos[comando]) {
  console.log('Uso: node command.js <comando>');
  console.log('Comandos disponíveis:');
  Object.keys(comandos).forEach((c) => console.log(`  - ${c}`));
  process.exit(1);
}

try {
  // stdio: 'inherit' -> mostra a saída do sequelize-cli direto no terminal
  execSync(comandos[comando], { stdio: 'inherit' });
} catch (erro) {
  process.exit(1);
}
