const { Router } = require('express');
const AutorController = require('../app/Controllers/AutorController');

const router = Router();
router.get('/', AutorController.list);
router.get('/:id', AutorController.get);
router.post('/', AutorController.create);
router.put('/:id', AutorController.update);
router.delete('/:id', AutorController.remove);

module.exports = router;
