// Middleware de log: registra cada requisição que chega na API.
// Satisfaz o requisito "pelo menos um middleware implementado pelo aluno".
module.exports = function logMiddleware(req, res, next) {
  const dataHora = new Date().toISOString();
  console.log(`[${dataHora}] ${req.method} ${req.originalUrl}`);
  next();
};
