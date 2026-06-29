const { Autor } = require('../Models');

module.exports = {
  async list(req, res) {
    try {
      const autores = await Autor.findAll();
      return res.json(autores);
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },
  async get(req, res) {
    try {
      const autor = await Autor.findByPk(req.params.id);
      if (!autor) return res.status(404).json({ erro: 'Autor não encontrado.' });
      return res.json(autor);
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },
  async create(req, res) {
    try {
      const autor = await Autor.create(req.body);
      return res.status(201).json(autor);
    } catch (erro) {
      return res.status(400).json({ erro: erro.message });
    }
  },
  async update(req, res) {
    try {
      const autor = await Autor.findByPk(req.params.id);
      if (!autor) return res.status(404).json({ erro: 'Autor não encontrado.' });
      await autor.update(req.body);
      return res.json(autor);
    } catch (erro) {
      return res.status(400).json({ erro: erro.message });
    }
  },
  async remove(req, res) {
    try {
      const autor = await Autor.findByPk(req.params.id);
      if (!autor) return res.status(404).json({ erro: 'Autor não encontrado.' });
      await autor.destroy();
      return res.status(204).send();
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },
};
