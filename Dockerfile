# ---- Stage 1: instala as dependências (camada de build) ----
FROM node:24-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev

# ---- Stage 2: imagem final, só com o necessário pra rodar ----
FROM node:24-alpine
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "_web.js"]
