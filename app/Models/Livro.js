const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../database/connections/postgres');

class Livro extends Model {}

Livro.init(
  {
    titulo: { type: DataTypes.STRING, allowNull: false },
    ano_publicacao: { type: DataTypes.INTEGER, allowNull: true },
    autor_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: 'Livro', tableName: 'livros' }
);

module.exports = Livro;
