const { Livro, Autor, Categoria, LivroCategoria } = require('../Models');
const cache = require('../../database/connections/redis');

const CACHE_KEY_LISTA = 'livros:lista';
const CACHE_TTL_SEGUNDOS = 60;

// Apaga o cache da listagem sempre que algo que afeta ela muda
// (criar/editar/remover livro, ou mudar a relação com categorias).
async function invalidarCacheLista() {
  try {
    await cache.del(CACHE_KEY_LISTA);
  } catch (erro) {
    console.error('Aviso: falha ao invalidar cache do Redis:', erro.message);
  }
}

module.exports = {
  async list(req, res) {
    try {
      // 1) Tenta servir do cache (evita repetir o JOIN com autor+categoria)
      try {
        const cacheado = await cache.get(CACHE_KEY_LISTA);
        if (cacheado) {
          res.set('X-Cache', 'HIT');
          return res.json(JSON.parse(cacheado));
        }
      } catch (erro) {
        console.error('Aviso: falha ao ler cache do Redis:', erro.message);
      }

      // 2) Cache vazio (ou Redis fora do ar): busca no Postgres normalmente
      const livros = await Livro.findAll({ include: [Autor, Categoria] });

      // 3) Guarda no cache por 60s pra próxima leitura ser instantânea
      try {
        await cache.set(CACHE_KEY_LISTA, JSON.stringify(livros), { EX: CACHE_TTL_SEGUNDOS });
      } catch (erro) {
        console.error('Aviso: falha ao gravar cache do Redis:', erro.message);
      }

      res.set('X-Cache', 'MISS');
      return res.json(livros);
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },

  async get(req, res) {
    try {
      const livro = await Livro.findByPk(req.params.id, { include: [Autor, Categoria] });
      if (!livro) return res.status(404).json({ erro: 'Livro não encontrado.' });
      return res.json(livro);
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },

  async create(req, res) {
    try {
      const livro = await Livro.create(req.body);
      await invalidarCacheLista();
      return res.status(201).json(livro);
    } catch (erro) {
      return res.status(400).json({ erro: erro.message });
    }
  },

  async update(req, res) {
    try {
      const livro = await Livro.findByPk(req.params.id);
      if (!livro) return res.status(404).json({ erro: 'Livro não encontrado.' });
      await livro.update(req.body);
      await invalidarCacheLista();
      return res.json(livro);
    } catch (erro) {
      return res.status(400).json({ erro: erro.message });
    }
  },

  async remove(req, res) {
    try {
      const livro = await Livro.findByPk(req.params.id);
      if (!livro) return res.status(404).json({ erro: 'Livro não encontrado.' });
      await livro.destroy();
      await invalidarCacheLista();
      return res.status(204).send();
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },

  // ===== Relação N:N (tabela pivô livro_categorias) =====

  async listCategorias(req, res) {
    try {
      const livro = await Livro.findByPk(req.params.id, { include: [Categoria] });
      if (!livro) return res.status(404).json({ erro: 'Livro não encontrado.' });
      return res.json(livro.Categorias);
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },

  async addCategoria(req, res) {
    try {
      const { categoria_id } = req.body;

      const livro = await Livro.findByPk(req.params.id);
      if (!livro) return res.status(404).json({ erro: 'Livro não encontrado.' });

      const categoria = await Categoria.findByPk(categoria_id);
      if (!categoria) return res.status(404).json({ erro: 'Categoria não encontrada.' });

      const relacao = await LivroCategoria.create({ livro_id: livro.id, categoria_id });
      await invalidarCacheLista();
      return res.status(201).json(relacao);
    } catch (erro) {
      return res.status(400).json({ erro: erro.message });
    }
  },

  async removeCategoria(req, res) {
    try {
      const { id, categoriaId } = req.params;
      const relacao = await LivroCategoria.findOne({ where: { livro_id: id, categoria_id: categoriaId } });
      if (!relacao) return res.status(404).json({ erro: 'Relação não encontrada.' });
      await relacao.destroy();
      await invalidarCacheLista();
      return res.status(204).send();
    } catch (erro) {
      return res.status(500).json({ erro: erro.message });
    }
  },
};

