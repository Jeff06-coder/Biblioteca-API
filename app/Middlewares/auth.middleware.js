const jwt = require('jsonwebtoken');

// Protege rotas exigindo um token JWT válido no header Authorization.
// Satisfaz: "Todas as rotas protegidas por JWT, exceto a rota de login".
module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não informado.' });
  }

  const partes = authHeader.split(' ');

  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ erro: 'Token mal formatado. Use: Bearer <token>' });
  }

  const token = partes[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = payload; // disponível nas próximas rotas, se precisar
    return next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
};
