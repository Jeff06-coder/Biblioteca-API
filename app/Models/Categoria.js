const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../database/connections/postgres');

class Categoria extends Model {}

Categoria.init(
  {
    nome: { type: DataTypes.STRING, allowNull: false, unique: true },
  },
  { sequelize, modelName: 'Categoria', tableName: 'categorias' }
);

module.exports = Categoria;
