'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('livro_categorias', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      livro_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'livros', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      categoria_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'categorias', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('NOW()') },
    });

    await queryInterface.addConstraint('livro_categorias', {
      fields: ['livro_id', 'categoria_id'],
      type: 'unique',
      name: 'livro_categoria_unica',
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('livro_categorias');
  },
};
