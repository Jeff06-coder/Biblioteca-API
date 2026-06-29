const { Categoria } = require('../Models');

module.exports = {
  async list(req, res) {
    try {
      const categorias = await Categoria.findAll();
      return res.json(categorias);
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },
  async get(req, res) {
    try {
      const categoria = await Categoria.findByPk(req.params.id);
      if (!categoria) return res.status(404).json({ erro: 'Categoria não encontrada.' });
      return res.json(categoria);
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },
  async create(req, res) {
    try {
      const categoria = await Categoria.create(req.body);
      return res.status(201).json(categoria);
    } catch (erro) {
      return res.status(400).json({ erro: erro.message });
    }
  },
  async update(req, res) {
    try {
      const categoria = await Categoria.findByPk(req.params.id);
      if (!categoria) return res.status(404).json({ erro: 'Categoria não encontrada.' });
      await categoria.update(req.body);
      return res.json(categoria);
    } catch (erro) {
      return res.status(400).json({ erro: erro.message });
    }
  },
  async remove(req, res) {
    try {
      const categoria = await Categoria.findByPk(req.params.id);
      if (!categoria) return res.status(404).json({ erro: 'Categoria não encontrada.' });
      await categoria.destroy();
      return res.status(204).send();
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },
};
