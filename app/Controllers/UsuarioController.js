const { Usuario } = require('../Models');

module.exports = {
  async list(req, res) {
    try {
      const usuarios = await Usuario.findAll({ attributes: { exclude: ['senha'] } });
      return res.json(usuarios);
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },

  async get(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.params.id, { attributes: { exclude: ['senha'] } });
      if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
      return res.json(usuario);
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },

  async create(req, res) {
    try {
      const usuario = await Usuario.create(req.body);
      const { senha, ...usuarioSemSenha } = usuario.toJSON();
      return res.status(201).json(usuarioSemSenha);
    } catch (erro) {
      return res.status(400).json({ erro: erro.message });
    }
  },

  async update(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.params.id);
      if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
      await usuario.update(req.body);
      const { senha, ...usuarioSemSenha } = usuario.toJSON();
      return res.json(usuarioSemSenha);
    } catch (erro) {
      return res.status(400).json({ erro: erro.message });
    }
  },

  async remove(req, res) {
    try {
      const usuario = await Usuario.findByPk(req.params.id);
      if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado.' });
      await usuario.destroy();
      return res.status(204).send();
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },
};
