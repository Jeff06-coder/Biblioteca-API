const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = require('../../database/connections/postgres');

// Tabela de usuários: email único + senha criptografada com bcrypt
class Usuario extends Model {
  async validarSenha(senhaDigitada) {
    return bcrypt.compare(senhaDigitada, this.senha);
  }
}

Usuario.init(
  {
    nome: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    senha: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    hooks: {
      // Criptografa a senha sempre que um usuário é criado
      beforeCreate: async (usuario) => {
        usuario.senha = await bcrypt.hash(usuario.senha, 10);
      },
      // Criptografa de novo só se a senha foi alterada num update
      beforeUpdate: async (usuario) => {
        if (usuario.changed('senha')) {
          usuario.senha = await bcrypt.hash(usuario.senha, 10);
        }
      },
    },
  }
);

module.exports = Usuario;
