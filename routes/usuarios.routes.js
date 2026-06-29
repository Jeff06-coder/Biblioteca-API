const { Router } = require('express');
const UsuarioController = require('../app/Controllers/UsuarioController');

const router = Router();
router.get('/', UsuarioController.list);
router.get('/:id', UsuarioController.get);
router.post('/', UsuarioController.create);
router.put('/:id', UsuarioController.update);
router.delete('/:id', UsuarioController.remove);

module.exports = router;
