'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('emprestimos', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      livro_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'livros', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      usuario_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      data_emprestimo: { type: Sequelize.DATEONLY, allowNull: false },
      data_devolucao_prevista: { type: Sequelize.DATEONLY, allowNull: true },
      devolvido: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('emprestimos');
  },
};
