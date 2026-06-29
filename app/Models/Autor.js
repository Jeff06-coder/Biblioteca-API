const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../database/connections/postgres');

class Autor extends Model {}

Autor.init(
  {
    nome: { type: DataTypes.STRING, allowNull: false },
    nacionalidade: { type: DataTypes.STRING, allowNull: true },
  },
  { sequelize, modelName: 'Autor', tableName: 'autores' }
);

module.exports = Autor;
