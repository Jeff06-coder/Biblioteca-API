const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../database/connections/postgres');

// Esta é a Model da tabela PIVÔ: liga Livro <-> Categoria (relação N:N).
// A prova exige que a tabela pivô tenha Model própria - é essa aqui.
class LivroCategoria extends Model {}

LivroCategoria.init(
  {
    livro_id: { type: DataTypes.INTEGER, allowNull: false },
    categoria_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: 'LivroCategoria', tableName: 'livro_categorias' }
);

module.exports = LivroCategoria;
