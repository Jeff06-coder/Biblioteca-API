# 1) Build + subir tudo do zero
📸 Print: a saída do build terminando + os containers sendo criados
docker compose up --build -d
![](/Prints/1.png)

# 2) Containers rodando
📸 Print: os 4 containers (db, cache, web, nginx) com status Up/running (e o db com healthy)
docker compose ps
![](/Prints/2.png)


# 3) Migrations
📸 Print: as 6 migrations executando (== create-usuarios: migrated, etc.)
docker compose run --rm cli migrate
![](/Prints/3.png)


# 4) Seed (dados de teste)
📸 Print: o seed executando
docker compose run --rm cli seed
![](/Prints/4.png)


# 5) Rede customizada + DNS interno
📸 Print: o JSON mostrando os containers conectados (db, web, cache, cli) com seus IPs internos
docker network ls
docker network inspect biblioteca-api_backend
![](/Prints/5.png)
![](/Prints/6.png)


# 6) Prova de que o sistema está rodando (Nginx → Node → Postgres)
📸 Print: resposta 200 OK com a mensagem JSON
curl -i http://localhost
![](/Prints/7.6.png)


# 7) PoC de segurança — banco inacessível direto
📸 Print: a falha/recusa de conexão (prova que o banco só existe dentro da rede Docker)
nc -zv localhost 5432
![](/Prints/7.png)


# 8) PoC de persistência (parte 1 — antes do restart)
📸 Print: o resultado da contagem
docker compose exec db psql -U biblioteca_user -d biblioteca -c "SELECT count(*) FROM usuarios;"
![](/Prints/8.png)


# 9) Restart do banco
docker compose restart db
sleep 5
![](/Prints/9.png)


# 10) PoC de persistência (parte 2 — depois do restart)
📸 Print: o mesmo resultado de antes — prova que os dados sobreviveram
docker compose exec db psql -U biblioteca_user -d biblioteca -c "SELECT count(*) FROM usuarios;"
![](/Prints/10.png)


# 11) Logs gerais (bônus, mostra que não tem erro)
📸 Print: o log limpo, sem stack trace de erro
docker compose logs web --tail=30
![](/Prints/11.png)


## se o nc não existir na sua máquina (Windows sem WSL, por exemplo), use isso no lugar do passo 7:
docker run --rm postgres:17-alpine pg_isready -h host.docker.internal -p 5432
# ou, mais simples, tentando direto:
telnet localhost 5432