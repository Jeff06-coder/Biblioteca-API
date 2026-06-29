const jwt = require('jsonwebtoken');
const { Usuario } = require('../Models');

// Rota de login: gera o token JWT. É a única rota pública da API.
module.exports = {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
      }

      const usuario = await Usuario.findOne({ where: { email } });
      if (!usuario) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
      }

      const senhaValida = await usuario.validarSenha(senha);
      if (!senhaValida) {
        return res.status(401).json({ erro: 'Credenciais inválidas.' });
      }

      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
      );

      return res.json({ token });
    } catch (erro) {
      return res.status(500).json({ erro: 'Erro ao realizar login.', detalhe: erro.message });
    }
  },
};
