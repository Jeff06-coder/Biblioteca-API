const { Emprestimo, Usuario, Livro } = require('../Models');

module.exports = {
  async list(req, res) {
    try {
      const emprestimos = await Emprestimo.findAll({ include: [Usuario, Livro] });
      return res.json(emprestimos);
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },
  async get(req, res) {
    try {
      const emprestimo = await Emprestimo.findByPk(req.params.id, { include: [Usuario, Livro] });
      if (!emprestimo) return res.status(404).json({ erro: 'Empréstimo não encontrado.' });
      return res.json(emprestimo);
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },
  async create(req, res) {
    try {
      const emprestimo = await Emprestimo.create(req.body);
      return res.status(201).json(emprestimo);
    } catch (erro) {
      return res.status(400).json({ erro: erro.message });
    }
  },
  async update(req, res) {
    try {
      const emprestimo = await Emprestimo.findByPk(req.params.id);
      if (!emprestimo) return res.status(404).json({ erro: 'Empréstimo não encontrado.' });
      await emprestimo.update(req.body);
      return res.json(emprestimo);
    } catch (erro) {
      return res.status(400).json({ erro: erro.message });
    }
  },
  async remove(req, res) {
    try {
      const emprestimo = await Emprestimo.findByPk(req.params.id);
      if (!emprestimo) return res.status(404).json({ erro: 'Empréstimo não encontrado.' });
      await emprestimo.destroy();
      return res.status(204).send();
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },
};
