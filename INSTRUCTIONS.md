# Arquivo de Instruções

Neste arquivo você encontrará a estrutura de pastas do projeto, as instruções para subir o banco de dados com Docker, executar migrations, rodar seeds e utilizar o sistema de autenticação.

---
## 📁 Estrutura dos Diretórios do projeto (pastas)

```
📦 Meu-REPOSITÓRIO
│
├── package.json
├── package-lock.json
├── server.js
├── .env
├── knexfile.js
├── INSTRUCTIONS.md
├── docker-compose.yml
│
├── db/
│ ├── migrations/
│ ├── seeds/
│ └── db.js
│
├── routes/
│ ├── agentesRoutes.js
│ ├── casosRoutes.js
│ ├── authRoutes.js        <-- NOVO
│ └── usuariosRoutes.js   <-- NOVO
│
├── controllers/
│ ├── agentesController.js
│ ├── casosController.js
│ ├── authController.js      <-- NOVO
│ └── usuariosController.js   <-- NOVO
│
├── repositories/
│ ├── agentesRepository.js
│ ├── casosRepository.js
│ └── usuariosRepository.js  <-- NOVO
│
├── middlewares/
│ └── authMiddleware.js      <-- NOVO
│
├── utils/
│ └── errorHandler.js
│
```

---
## 🔐 Autenticação e Segurança

Para interagir com as rotas protegidas (`/agentes` e `/casos`), você primeiro precisa se registrar e fazer login para obter um token de acesso (JWT).

### 1. Registrar um Novo Usuário

Envie uma requisição `POST` para `/auth/register` com seu nome, email e senha.

**Endpoint:** `POST /auth/register`

**Corpo da Requisição (JSON):**
```json
{
  "nome": "Seu Nome",
  "email": "seuemail@exemplo.com",
  "senha": "SuaSenhaForte@123"
}
```

**Importante:** Requisitos da Senha
A senha enviada deve obrigatoriamente atender aos seguintes critérios:

Mínimo de 8 caracteres de comprimento.

Conter pelo menos uma letra minúscula (a-z).

Conter pelo menos uma letra maiúscula (A-Z).

Conter pelo menos um número (0-9).

Conter pelo menos um caractere especial (ex: !, @, #, $, %).

### 2. Fazer Login

Após o registro, envie uma requisição `POST` para `/auth/login` com o email e a senha cadastrados.

**Endpoint:** `POST /auth/login`

**Corpo da Requisição (JSON):**
```json
{
  "email": "seuemail@exemplo.com",
  "senha": "SuaSenhaForte@123"
}
```

**Resposta de Sucesso (Status 200 OK):**
A API retornará um token de acesso.
```json
{
  "acess_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzZXVlbWFpbEBleGVtcGxvLmNvbSIsImlhdCI6MTY2MjY1ODQwMCwiZXhwIjoxNjYyNjYyMDAwfQ.abcdef123456"
}
```

### 3. Acessando Rotas Protegidas

Copie o `acess_token` retornado no login e inclua-o no cabeçalho (`Header`) de `Authorization` em todas as requisições para as rotas de `/agentes` e `/casos`.

**Formato do Header:**
`Authorization: Bearer <seu_token_aqui>`

**Exemplo (usando `curl`):**
```sh
curl -X GET http://localhost:3000/agentes \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
Se o token for válido, você receberá a resposta. Caso contrário, receberá um erro `401 Unauthorized`.

---
## 🐳 Subir o banco com Docker

Este projeto possui um arquivo `docker-compose.yml` na raiz. Para subir o banco, execute o comando correspondente ao seu sistema operacional no terminal:

**Windows:** `docker compose up -d`
**Linux:** `sudo docker compose up -d`

Caso utilize versões mais antigas do Docker, pode ser necessário usar um hífen: `docker-compose up -d`.

---
## 📜 Executar Migrations

As migrações criam as tabelas no banco de dados. O projeto agora inclui a migration para a tabela `usuarios`, além das de `agentes` e `casos`.

Para executar todas as migrações pendentes:
```sh
npx knex migrate:latest
```

---
## 🌱 Rodar Seeds

As seeds populam o banco com dados iniciais.

Para executar todas as seeds:
```sh
npx knex seed:run