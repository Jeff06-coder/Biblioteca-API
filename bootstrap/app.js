const path = require('path');

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const routes = require('../routes');
const logMiddleware = require('../app/Middlewares/log.middleware');

const app = express();

app.use(express.json());
app.use(logMiddleware);

// Rota raiz - só uma mensagem amigável apontando pra documentação
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API Biblioteca no ar. Veja a documentação em /api-docs.',
  });
});

// Documentação Swagger disponível em /api-docs
const swaggerPath = path.join(__dirname, '..', 'docs', 'swagger.yaml');
let swaggerDocument;
try {
  swaggerDocument = YAML.load(swaggerPath);
  if (!swaggerDocument) {
    throw new Error('docs/swagger.yaml está vazio ou não tem conteúdo válido.');
  }
} catch (erro) {
  console.error('⚠️  Falha ao carregar o Swagger:', erro.message);
  console.error('    Verifique se docs/swagger.yaml existe e tem conteúdo.');
  swaggerDocument = {
    openapi: '3.0.0',
    info: { title: 'Swagger não carregado', version: '0.0.0' },
    paths: {},
  };
}
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(routes);

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

module.exports = app;
