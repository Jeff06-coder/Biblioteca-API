const { Router } = require('express');
const authMiddleware = require('../app/Middlewares/auth.middleware');

const authRoutes = require('./auth.routes');
const usuariosRoutes = require('./usuarios.routes');
const autoresRoutes = require('./autores.routes');
const categoriasRoutes = require('./categorias.routes');
const livrosRoutes = require('./livros.routes');
const emprestimosRoutes = require('./emprestimos.routes');

const router = Router();

// Rota pública (não passa pelo middleware de autenticação)
router.use(authRoutes);

// A partir daqui, todas exigem token JWT válido
router.use('/usuarios', authMiddleware, usuariosRoutes);
router.use('/autores', authMiddleware, autoresRoutes);
router.use('/categorias', authMiddleware, categoriasRoutes);
router.use('/livros', authMiddleware, livrosRoutes);
router.use('/emprestimos', authMiddleware, emprestimosRoutes);

module.exports = router;
