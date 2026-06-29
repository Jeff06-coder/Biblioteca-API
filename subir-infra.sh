#!/bin/sh
# Sobe toda a infraestrutura do zero: build + containers + migrations + seed.
# Atende ao critério "Automação" do guia de infraestrutura (Opção A - Docker):
# "um arquivo .sh que sobe toda a infra".
set -e

echo "== 1/4: Subindo containers (build + start) =="
docker compose up --build -d

echo ""
echo "== 2/4: Esperando o banco ficar saudável =="
ATE=$(( $(date +%s) + 60 ))
while [ "$(docker compose ps db --format '{{.Health}}' 2>/dev/null)" != "healthy" ]; do
  if [ "$(date +%s)" -gt "$ATE" ]; then
    echo "Timeout esperando o banco ficar saudável."
    exit 1
  fi
  sleep 2
done
echo "Banco saudável."

echo ""
echo "== 3/4: Rodando migrations =="
docker compose run --rm cli migrate

echo ""
echo "== 4/4: Populando dados de teste (seed) =="
docker compose run --rm cli seed

echo ""
echo "== Infra no ar =="
docker compose ps
echo ""
echo "API disponível em: http://localhost"
echo "Swagger: http://localhost/api-docs"
