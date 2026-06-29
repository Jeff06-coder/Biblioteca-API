const { Router } = require('express');
const CategoriaController = require('../app/Controllers/CategoriaController');

const router = Router();
router.get('/', CategoriaController.list);
router.get('/:id', CategoriaController.get);
router.post('/', CategoriaController.create);
router.put('/:id', CategoriaController.update);
router.delete('/:id', CategoriaController.remove);

module.exports = router;
