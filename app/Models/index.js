const sequelize = require('../../database/connections/postgres');

const Usuario = require('./Usuario');
const Autor = require('./Autor');
const Categoria = require('./Categoria');
const Livro = require('./Livro');
const LivroCategoria = require('./LivroCategoria');
const Emprestimo = require('./Emprestimo');

// ---- Relações 1:N ----
Autor.hasMany(Livro, { foreignKey: 'autor_id' });
Livro.belongsTo(Autor, { foreignKey: 'autor_id' });

Usuario.hasMany(Emprestimo, { foreignKey: 'usuario_id' });
Emprestimo.belongsTo(Usuario, { foreignKey: 'usuario_id' });

Livro.hasMany(Emprestimo, { foreignKey: 'livro_id' });
Emprestimo.belongsTo(Livro, { foreignKey: 'livro_id' });

// ---- Relação N:N (Livro <-> Categoria) através da tabela pivô ----
Livro.belongsToMany(Categoria, {
  through: LivroCategoria,
  foreignKey: 'livro_id',
  otherKey: 'categoria_id',
});
Categoria.belongsToMany(Livro, {
  through: LivroCategoria,
  foreignKey: 'categoria_id',
  otherKey: 'livro_id',
});

// Acesso direto à tabela pivô (ela também tem Model própria)
Livro.hasMany(LivroCategoria, { foreignKey: 'livro_id' });
Categoria.hasMany(LivroCategoria, { foreignKey: 'categoria_id' });
LivroCategoria.belongsTo(Livro, { foreignKey: 'livro_id' });
LivroCategoria.belongsTo(Categoria, { foreignKey: 'categoria_id' });

module.exports = { sequelize, Usuario, Autor, Categoria, Livro, LivroCategoria, Emprestimo };
