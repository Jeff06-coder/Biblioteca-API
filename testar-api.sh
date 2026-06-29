#!/bin/sh
# Script de teste completo da API. Exercita TODAS as rotas da prova.
# Uso:
#   ./testar-api.sh                  -> local (node _web.js / npm run dev)
#   ./testar-api.sh http://localhost -> Docker completo (via Nginx)
BASE_URL="${1:-http://localhost:3000}"
JSON="Content-Type: application/json"

extrair() {
  # $1 = json recebido, $2 = campo a extrair
  echo "$1" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{try{const v=JSON.parse(d)['$2'];console.log(v===undefined?'':v)}catch(e){console.log('')}})"
}

CARIMBO=$(date +%s)

echo "== Testando contra $BASE_URL =="

echo ""
echo "1) Sem token (esperado: 401)"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/usuarios"

echo ""
echo "2) Login com senha errada (esperado: 401)"
curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST "$BASE_URL/login" -H "$JSON" -d '{"email":"admin@biblioteca.com","senha":"errada"}'

echo ""
echo "3) Login correto"
LOGIN=$(curl -s -X POST "$BASE_URL/login" -H "$JSON" -d '{"email":"admin@biblioteca.com","senha":"123456"}')
TOKEN=$(extrair "$LOGIN" token)
AUTH="Authorization: Bearer $TOKEN"
# pega o id do admin direto do payload do token (nunca fixe esse id na mão!)
ADMIN_ID=$(echo "$TOKEN" | node -e "let t='';process.stdin.on('data',c=>t+=c);process.stdin.on('end',()=>console.log(JSON.parse(Buffer.from(t.trim().split('.')[1],'base64').toString()).id))")
echo "Login OK, admin id = $ADMIN_ID"

echo ""
echo "4) CRUD Autor"
AUTOR=$(curl -s -X POST "$BASE_URL/autores" -H "$AUTH" -H "$JSON" -d "{\"nome\":\"Machado de Assis $CARIMBO\",\"nacionalidade\":\"Brasileira\"}")
AUTOR_ID=$(extrair "$AUTOR" id)
echo "  POST -> id $AUTOR_ID"
curl -s -o /dev/null -w "  GET /autores -> %{http_code}\n" "$BASE_URL/autores" -H "$AUTH"
curl -s -o /dev/null -w "  PUT /autores/:id -> %{http_code}\n" -X PUT "$BASE_URL/autores/$AUTOR_ID" -H "$AUTH" -H "$JSON" -d '{"nome":"Machado de Assis Editado"}'

echo ""
echo "5) CRUD Categoria"
CATEGORIA=$(curl -s -X POST "$BASE_URL/categorias" -H "$AUTH" -H "$JSON" -d "{\"nome\":\"Romance $CARIMBO\"}")
CATEGORIA_ID=$(extrair "$CATEGORIA" id)
echo "  POST -> id $CATEGORIA_ID"
curl -s -o /dev/null -w "  GET /categorias -> %{http_code}\n" "$BASE_URL/categorias" -H "$AUTH"

echo ""
echo "6) CRUD Livro + cache (Redis)"
curl -s -D - -o /dev/null "$BASE_URL/livros" -H "$AUTH" | grep -i x-cache | sed 's/^/  1a leitura: /'
curl -s -D - -o /dev/null "$BASE_URL/livros" -H "$AUTH" | grep -i x-cache | sed 's/^/  2a leitura: /'
LIVRO=$(curl -s -X POST "$BASE_URL/livros" -H "$AUTH" -H "$JSON" -d "{\"titulo\":\"Dom Casmurro\",\"ano_publicacao\":1899,\"autor_id\":$AUTOR_ID}")
LIVRO_ID=$(extrair "$LIVRO" id)
echo "  POST -> id $LIVRO_ID (cache deveria invalidar)"
curl -s -D - -o /dev/null "$BASE_URL/livros" -H "$AUTH" | grep -i x-cache | sed 's/^/  leitura pos-create: /'

echo ""
echo "7) Relação N:N (tabela pivô livro_categorias)"
curl -s -o /dev/null -w "  POST /livros/:id/categorias -> %{http_code}\n" -X POST "$BASE_URL/livros/$LIVRO_ID/categorias" -H "$AUTH" -H "$JSON" -d "{\"categoria_id\":$CATEGORIA_ID}"
curl -s -o /dev/null -w "  GET /livros/:id/categorias -> %{http_code}\n" "$BASE_URL/livros/$LIVRO_ID/categorias" -H "$AUTH"
curl -s -o /dev/null -w "  DELETE /livros/:id/categorias/:cid -> %{http_code}\n" -X DELETE "$BASE_URL/livros/$LIVRO_ID/categorias/$CATEGORIA_ID" -H "$AUTH"

echo ""
echo "8) CRUD Usuário"
NOVO_USUARIO=$(curl -s -X POST "$BASE_URL/usuarios" -H "$AUTH" -H "$JSON" -d "{\"nome\":\"Teste\",\"email\":\"teste-script-$CARIMBO@teste.com\",\"senha\":\"123456\"}")
USUARIO_ID=$(extrair "$NOVO_USUARIO" id)
echo "  POST -> id $USUARIO_ID"
curl -s -o /dev/null -w "  PUT /usuarios/:id -> %{http_code}\n" -X PUT "$BASE_URL/usuarios/$USUARIO_ID" -H "$AUTH" -H "$JSON" -d '{"nome":"Teste Editado"}'
curl -s -o /dev/null -w "  DELETE /usuarios/:id -> %{http_code}\n" -X DELETE "$BASE_URL/usuarios/$USUARIO_ID" -H "$AUTH"

echo ""
echo "9) CRUD Empréstimo (usando o ID real do admin, NUNCA fixo)"
EMPRESTIMO=$(curl -s -X POST "$BASE_URL/emprestimos" -H "$AUTH" -H "$JSON" -d "{\"livro_id\":$LIVRO_ID,\"usuario_id\":$ADMIN_ID,\"data_emprestimo\":\"2026-06-20\"}")
EMPRESTIMO_ID=$(extrair "$EMPRESTIMO" id)
echo "  POST -> id $EMPRESTIMO_ID"
curl -s -o /dev/null -w "  PUT /emprestimos/:id -> %{http_code}\n" -X PUT "$BASE_URL/emprestimos/$EMPRESTIMO_ID" -H "$AUTH" -H "$JSON" -d '{"devolvido":true}'
curl -s -o /dev/null -w "  DELETE /emprestimos/:id -> %{http_code}\n" -X DELETE "$BASE_URL/emprestimos/$EMPRESTIMO_ID" -H "$AUTH"

echo ""
echo "10) Limpeza dos dados criados pelo teste"
curl -s -o /dev/null -X DELETE "$BASE_URL/livros/$LIVRO_ID" -H "$AUTH"
curl -s -o /dev/null -X DELETE "$BASE_URL/categorias/$CATEGORIA_ID" -H "$AUTH"
curl -s -o /dev/null -X DELETE "$BASE_URL/autores/$AUTOR_ID" -H "$AUTH"

echo ""
echo "11) Rota inexistente (esperado: 404)"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/rota-que-nao-existe" -H "$AUTH"

echo ""
echo "12) Swagger (esperado: 200)"
curl -s -o /dev/null -w "Status: %{http_code}\n" "$BASE_URL/api-docs/"

echo ""
echo "== Fim dos testes =="
