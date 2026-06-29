const { Router } = require('express');
const LivroController = require('../app/Controllers/LivroController');

const router = Router();
router.get('/', LivroController.list);
router.get('/:id', LivroController.get);
router.post('/', LivroController.create);
router.put('/:id', LivroController.update);
router.delete('/:id', LivroController.remove);

// Relação N:N - tabela pivô livro_categorias
router.get('/:id/categorias', LivroController.listCategorias);
router.post('/:id/categorias', LivroController.addCategoria);
router.delete('/:id/categorias/:categoriaId', LivroController.removeCategoria);

module.exports = router;
