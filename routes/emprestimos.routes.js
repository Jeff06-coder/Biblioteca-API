const { Router } = require('express');
const EmprestimoController = require('../app/Controllers/EmprestimoController');

const router = Router();
router.get('/', EmprestimoController.list);
router.get('/:id', EmprestimoController.get);
router.post('/', EmprestimoController.create);
router.put('/:id', EmprestimoController.update);
router.delete('/:id', EmprestimoController.remove);

module.exports = router;
