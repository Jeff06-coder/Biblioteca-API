'use strict';

const bcrypt = require('bcryptjs');

// Usuário de teste pra você já conseguir testar o /login sem criar um na mão
module.exports = {
  up: async (queryInterface) => {
    const senhaCriptografada = await bcrypt.hash('123456', 10);

    await queryInterface.bulkInsert('usuarios', [
      {
        nome: 'Administrador',
        email: 'admin@biblioteca.com',
        senha: senhaCriptografada,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: async (queryInterface) => {
    await queryInterface.bulkDelete('usuarios', { email: 'admin@biblioteca.com' });
  },
};
