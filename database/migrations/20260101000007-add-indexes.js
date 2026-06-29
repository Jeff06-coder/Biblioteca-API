'use strict';

// Índices extras (além dos criados automaticamente por PK/unique)
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.addIndex('livros', ['titulo'], { name: 'idx_livros_titulo' });
    await queryInterface.addIndex('livros', ['autor_id'], { name: 'idx_livros_autor_id' });
    await queryInterface.addIndex('emprestimos', ['data_emprestimo'], { name: 'idx_emprestimos_data_emprestimo' });
    await queryInterface.addIndex('emprestimos', ['usuario_id'], { name: 'idx_emprestimos_usuario_id' });
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('livros', 'idx_livros_titulo');
    await queryInterface.removeIndex('livros', 'idx_livros_autor_id');
    await queryInterface.removeIndex('emprestimos', 'idx_emprestimos_data_emprestimo');
    await queryInterface.removeIndex('emprestimos', 'idx_emprestimos_usuario_id');
  },
};
