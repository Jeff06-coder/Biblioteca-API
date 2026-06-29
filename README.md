# 1. Identificação do Projeto
*Prints dos testes vai estar na /Prints*

**Título:** API Biblioteca - AleTavares

**Descrição:** API REST para gerenciamento de uma biblioteca — cadastro de livros, autores, categorias e usuários, e controle de empréstimos. Construída em Node.js/Express com PostgreSQL, autenticação JWT e cache em Redis.Infra feita com docker de acordo com o projeto solicitado.

**Caminho escolhido:** **Opção A — Docker / Orquestração Local** (não usamos
AWS/nuvem gerenciada neste projeto).

**Arquitetura:**
```
Host -> Nginx (porta 80) -> Node.js / Express (privado) -> PostgreSQL
                                      \-> Redis (cache)
```

| Container | Imagem | Função |
|---|---|---|
| `db` | postgres:17-alpine | Banco de dados relacional — **sem porta exposta ao host** |
| `cache` | redis:7-alpine | Cache de `GET /livros` (60s, com invalidação automática nas escritas) — **sem porta exposta ao host** |
| `web` | build local (multi-stage) | API Node.js/Express — **sem porta exposta ao host** |
| `nginx` | nginx:alpine | Proxy reverso — único ponto de acesso externo (porta 80) |
| `cli` | build local | Executa migrations/seeds — não inicia com `up`, só com `run` |

---

# 2. Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 24+ (opcional — só necessário se quiser rodar o servidor fora do Docker; veja seção 7.2)
- Nenhuma conta de nuvem é necessária (projeto 100% local, Opção A)

---

# 3. Guia de Instalação e Execução ("How to Up")

### Opção rápida: um único script

```bash
cp .env.example .env
./subir-infra.sh
```
Esse script builda as imagens, sobe todos os containers, espera o banco
ficar saudável, roda as migrations e popula os dados de teste — tudo de uma vez.

### Passo a passo manual (equivalente, caso prefira ver cada etapa)

```bash
cp .env.example .env
docker compose up --build -d
docker compose run --rm cli migrate
docker compose run --rm cli seed
```

Depois disso, a API está em **http://localhost** (porta 80, via Nginx) e o
Swagger em **http://localhost/api-docs**.

> ⚠️ Não acesse `http://localhost:3000` — o container `web` não tem porta
> publicada pro host de propósito (Node deve ficar privado). Só a porta 80
> (Nginx) é acessível de fora.

Pra parar: `docker compose down` (ou `docker compose down -v` pra apagar os dados também).

---

# 4. Detalhamento Técnico da Infraestrutura

**Otimização de Imagens:** o `Dockerfile` usa **multi-stage build** — um
estágio `deps` instala as dependências de produção, e o estágio final copia
só o `node_modules` resultante + o código, sem ferramentas de build na imagem
final. A base é `node:24-alpine` (imagem mínima). As camadas são ordenadas
pra aproveitar o cache: `COPY package*.json` + `npm install` vêm **antes** do
`COPY . .`, então mudar código não invalida o cache de instalação de
dependências.

**Persistência:** o Postgres usa um **named volume** (`db_data`), não um bind
mount — os dados sobrevivem a `docker compose down` (sem `-v`) e a
reinicializações do container. Veja a PoC na seção 6.

**Rede e Comunicação:** duas **custom bridge networks**:
- `frontend`: só `nginx` e `web`
- `backend`: `web`, `db`, `cache`, `cli`

Os serviços se enxergam **pelo nome** (`db`, `cache`, `web`), nunca por IP
fixo — é o Service Discovery/DNS interno do Docker. O `nginx` não está na
rede `backend`, então não consegue alcançar `db`/`cache` diretamente — só o
`web` tem acesso aos dois. Isso é o isolamento "só os serviços necessários
se enxergam" exigido no guia.

**Segurança:** nenhuma credencial fica fixa no código — tudo vem do `.env`
(não versionado). `db` e `cache` **não têm porta publicada pro host** (só
acessíveis de dentro da rede Docker). O Node (`web`) também não tem porta
publicada — o único ponto de entrada externo é o `nginx`. Senhas de usuário
são criptografadas com bcrypt antes de ir pro banco. Rotas da API são
protegidas por JWT.

---

# 5. Gestão de Segredos e Configurações

Configurações ficam em `.env` (copiado de `.env.example`):

| Variável | Descrição |
|---|---|
| `NODE_WEB_PORT` | Porta interna do servidor Node (padrão 3000) |
| `POSTGRES_*` | Credenciais e conexão com o banco |
| `REDIS_HOST` / `REDIS_PORT` | Conexão com o cache |
| `JWT_SECRET` | Chave usada para assinar/validar os tokens |
| `JWT_EXPIRES_IN` | Validade do token (ex: `1d`) |

> ⚠️ **O `.env` nunca é commitado** (está no `.gitignore`). Só o
> `.env.example` (com valores fictícios) vai pro repositório. Antes de
> avaliar, copie `cp .env.example .env` e ajuste se necessário.

Pra desenvolvimento local (rodar `node`/`nodemon` fora do Docker), existe um
padrão opcional de override — veja seção 7.2. Ele também nunca é commitado
(está no `.gitignore`), justamente pra não comprometer a PoC de segurança da
seção 6.

---

# 6. Evidências de Funcionamento e Verificação

**URL de acesso:** http://localhost (API) e http://localhost/api-docs (Swagger)

### 6.1 Estado dos containers
```bash
docker compose ps
docker compose logs web --tail=50
```

### 6.2 Prova de DNS interno (Service Discovery, não IP fixo)
```bash
docker network inspect biblioteca-api_backend
# ou, de dentro do container web, resolvendo o nome "db":
docker compose exec web getent hosts db
```
Deve mostrar o nome do serviço resolvendo para um IP interno da rede Docker
— prova que a comunicação usa DNS, não endereço fixo.

### 6.3 PoC de persistência
```bash
docker compose exec db psql -U biblioteca_user -d biblioteca -c "SELECT count(*) FROM livros;"
docker compose restart db
# espere alguns segundos
docker compose exec db psql -U biblioteca_user -d biblioteca -c "SELECT count(*) FROM livros;"
# o número deve ser igual antes e depois do restart
```

### 6.4 PoC de segurança (banco inacessível direto)
```bash
# Da sua máquina (fora de qualquer container), tente conectar direto:
nc -zv localhost 5432
# ou
psql -h localhost -p 5432 -U biblioteca_user -d biblioteca
```
**Esperado: falha de conexão** (porta fechada) — prova que o banco só é
acessível de dentro da rede Docker, nunca direto do host/internet.

### 6.5 Funcionalidade completa da API

Login e uso do token JWT:
```bash
curl -X POST http://localhost/login -H "Content-Type: application/json" \
  -d '{"email":"admin@biblioteca.com","senha":"123456"}'
# -> { "token": "..." }

curl http://localhost/livros -H "Authorization: Bearer <token>"
# sem o header acima: 401
```

Script que testa tudo de uma vez (CRUD completo, JWT, cache, relação N:N,
404, Swagger):
```bash
./testar-api.sh http://localhost
```

Veja o passo a passo manual completo, rota por rota, na seção 7.3.

---

# 7. Troubleshooting e Limpeza

### 7.1 Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| `docker compose run --rm cli migrate` dá erro de conexão | `.env` não criado, ou banco ainda não está "healthy" | `cp .env.example .env`; espere uns segundos após o `up` |
| Swagger mostra "Failed to load API definition" | `docs/swagger.yaml` vazio ou inválido | Verifique se o arquivo tem conteúdo; o servidor avisa no terminal se falhar ao carregar |
| `localhost:3000` não conecta (Docker completo) | Esperado — `web` não tem porta publicada | Use `http://localhost` (porta 80, via Nginx) |
| Quero rodar local (nodemon) mas não conecto no banco | Portas do `db`/`cache` propositalmente fechadas | Veja "Desenvolvimento local" abaixo |

### 7.2 Desenvolvimento local (nodemon, fora do Docker)

```bash
cp docker-compose.override.yml.example docker-compose.override.yml
docker compose up db cache -d
npm install
# no .env: POSTGRES_HOST=localhost  e  REDIS_HOST=localhost
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev
```
A API fica em `http://localhost:3000`. **Apague o `docker-compose.override.yml`
antes de gerar as evidências da seção 6** (ele está no `.gitignore`, então
nunca vai pro repositório, mas localmente ele reabre as portas que a PoC de
segurança exige estarem fechadas).

### 7.3 Passo a passo manual de teste (rota por rota)

> Nunca fixe um ID na mão (ex: `usuario_id: 1`) — sempre use o ID retornado
> pela própria API.

```bash
BASE_URL=http://localhost
TOKEN=$(curl -s -X POST $BASE_URL/login -H "Content-Type: application/json" \
  -d '{"email":"admin@biblioteca.com","senha":"123456"}' | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).token))")

# Autor
curl -X POST $BASE_URL/autores -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"nome":"Machado de Assis"}'
curl $BASE_URL/autores -H "Authorization: Bearer $TOKEN"

# (Categoria, Usuário e Empréstimo seguem o mesmo padrão GET/POST/PUT/DELETE)

# Livro + cache
curl -i $BASE_URL/livros -H "Authorization: Bearer $TOKEN" | grep -i x-cache   # MISS
curl -i $BASE_URL/livros -H "Authorization: Bearer $TOKEN" | grep -i x-cache   # HIT

# Relação N:N (tabela pivô)
curl -X POST $BASE_URL/livros/<ID>/categorias -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"categoria_id":<ID>}'
curl $BASE_URL/livros/<ID>/categorias -H "Authorization: Bearer $TOKEN"
curl -X DELETE $BASE_URL/livros/<ID>/categorias/<ID> -H "Authorization: Bearer $TOKEN"

# Senha criptografada
docker compose exec db psql -U biblioteca_user -d biblioteca -c "SELECT email, senha FROM usuarios;"
```

### 7.4 Limpeza (destruir tudo após a avaliação)

```bash
docker compose down -v          # remove containers + volume do banco
docker image prune -f           # remove as imagens locais buildadas
rm -f .env docker-compose.override.yml
```

---

# Estrutura do projeto

```
app/          -> Models, Controllers, Middlewares
bootstrap/    -> inicialização do Express
routes/       -> definição das rotas REST
database/     -> config, conexões, migrations, seeders
docs/         -> swagger.yaml
docker/       -> nginx.conf, init do postgres
modelagem/    -> DER, modelo lógico, dicionário de dados (entrega de Banco de Dados)
scripts/      -> DDL e seed em SQL puro (entrega de Banco de Dados)
queries/      -> consultas críticas/agregações (entrega de Banco de Dados)
justificativa/-> justificativa da escolha tecnológica (entrega de Banco de Dados)
```
