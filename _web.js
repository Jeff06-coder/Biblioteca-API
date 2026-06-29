const app = require('./bootstrap/app');
const config = require('./bootstrap/config');

app.listen(config.port, () => {
  console.log(`Servidor rodando na porta ${config.port}`);
});
