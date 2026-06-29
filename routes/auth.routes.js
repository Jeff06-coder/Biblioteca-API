const { Router } = require('express');
const AuthController = require('../app/Controllers/AuthController');

const router = Router();
router.post('/login', AuthController.login);

module.exports = router;
