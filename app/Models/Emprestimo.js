const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../database/connections/postgres');

class Emprestimo extends Model {}

Emprestimo.init(
  {
    livro_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    data_emprestimo: { type: DataTypes.DATEONLY, allowNull: false },
    data_devolucao_prevista: { type: DataTypes.DATEONLY, allowNull: true },
    devolvido: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { sequelize, modelName: 'Emprestimo', tableName: 'emprestimos' }
);

module.exports = Emprestimo;
