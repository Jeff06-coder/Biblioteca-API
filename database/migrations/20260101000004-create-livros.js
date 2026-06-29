'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('livros', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      titulo: { type: Sequelize.STRING, allowNull: false },
      ano_publicacao: { type: Sequelize.INTEGER, allowNull: true },
      autor_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'autores', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('livros');
  },
};
