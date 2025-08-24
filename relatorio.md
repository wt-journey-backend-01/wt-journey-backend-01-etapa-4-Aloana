<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 8 créditos restantes para usar o sistema de feedback AI.

# Feedback para Aloana:

Nota final: **50.3/100**

Olá, Aloana! 👋🚀

Primeiramente, parabéns pelo esforço e dedicação em construir essa API completa e segura! 🎉 Você já conseguiu implementar várias funcionalidades importantes, como o registro, login, logout e exclusão de usuários, além da proteção das rotas de agentes e casos com JWT. Isso mostra que você compreendeu bem a essência da autenticação e autorização. 💪👏

---

## O que está indo muito bem 🌟

- Seu **middleware de autenticação** está muito bem feito, validando o token JWT e adicionando os dados do usuário no `req.user`. Isso é fundamental para proteger as rotas e está correto no arquivo `middlewares/authMiddleware.js`.
- O uso do **bcryptjs** para hashear as senhas está correto e a validação da senha no registro está bem rigorosa, garantindo segurança.
- A estrutura geral do projeto está alinhada com o esperado, com pastas separadas para controllers, repositories, middlewares, rotas e utils — isso é ótimo para manter o código organizado e escalável.
- Você implementou a exclusão de usuários e o logout, que são funcionalidades importantes para um sistema real.
- Os endpoints de agentes e casos estão protegidos pelo middleware, o que é essencial para segurança.
- Além disso, você já implementou filtros e ordenações nas consultas, o que é um diferencial e mostra domínio do Knex.

---

## Pontos que precisam de atenção e ajustes ⚠️

### 1. Migration da tabela de usuários: nome da tabela inconsistente

No arquivo da migration `db/migrations/20250821163905_user_table.js`, percebi que você criou a tabela com o nome `"users"`:

```js
exports.up = function(knex) {
    return knex.schema
        .createTable('users', function (table) {
            table.increments('id').primary();
            table.string('nome').notNullable();
            table.string('email').notNullable().unique();
            table.string('senha').notNullable();
        })
};
```

Mas no método `down` você está tentando apagar a tabela chamada `"usuarios"`:

```js
exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('usuarios');
};
```

**Por que isso é um problema?**  
Essa inconsistência faz com que a migration não reverta corretamente, e o banco pode não ter a tabela que seu código espera (`usuarios`). Além disso, no seu repositório `usuariosRepository.js`, você está acessando a tabela `"usuarios"`:

```js
const knex = require('../db/db');

class UsuariosRepository {
  async criar(dadosUsuario) {
    const [usuario] = await knex('usuarios')
      .insert(dadosUsuario)
      .returning(['id', 'email']);
    return usuario;
  }
  // ...
}
```

Ou seja, seu código espera uma tabela chamada `"usuarios"`, mas a migration cria `"users"`. Isso vai gerar erros ao tentar criar ou buscar usuários no banco, e pode ser a causa de falha ao tentar criar um usuário com email já em uso, porque a tabela correta nem existe.

**Como corrigir?**  
Alinhe o nome da tabela na migration para `"usuarios"`, assim:

```js
exports.up = function(knex) {
    return knex.schema
        .createTable('usuarios', function (table) {
            table.increments('id').primary();
            table.string('nome').notNullable();
            table.string('email').notNullable().unique();
            table.string('senha').notNullable();
        });
};

exports.down = function(knex) {
    return knex.schema
        .dropTableIfExists('usuarios');
};
```

Isso vai garantir que a tabela criada seja a mesma que seu código acessa.

---

### 2. Resposta no endpoint de registro (POST /auth/register)

No seu `authController.js`, após criar o usuário, você está retornando o objeto `novoUsuario` com o campo `senha` definido como `undefined`:

```js
novoUsuario.senha = undefined;
res.status(201).json(novoUsuario);
```

Porém, no repositório, você só retorna o `id` e `email` do usuário criado:

```js
const [usuario] = await knex('usuarios')
  .insert(dadosUsuario)
  .returning(['id', 'email']);
return usuario;
```

Isso faz com que o nome do usuário não seja retornado na resposta, mesmo que tenha sido enviado no corpo da requisição. Para melhorar a experiência do consumidor da API, seria legal retornar o `id`, `nome` e `email` do usuário criado, sem a senha.

**Como corrigir?**  
Altere o método `criar` no `usuariosRepository.js` para:

```js
async criar(dadosUsuario) {
  const [usuario] = await knex('usuarios')
    .insert(dadosUsuario)
    .returning(['id', 'nome', 'email']); // Inclua o nome aqui
  return usuario;
}
```

Assim, no controller, você pode retornar esse objeto completo, e não precisará manipular o campo senha, que já não está sendo retornado.

---

### 3. Validação de e-mail duplicado e mensagens de erro

Você está validando se o email já está em uso no registro:

```js
const emailExistente = await usuariosRepository.buscarPorEmail(email);
if (emailExistente) {
  return res.status(400).json({ error: 'Este email já está em uso.' });
}
```

Isso está correto, mas se a tabela não estiver criada corretamente (por causa do problema da migration), essa verificação pode falhar silenciosamente ou não funcionar como esperado. Corrigindo o nome da tabela na migration, esse problema será resolvido.

---

### 4. Endpoint DELETE para usuários está em `/auth/users/:id`

No arquivo `routes/authRoutes.js` você definiu a rota para exclusão de usuários assim:

```js
router.delete('/users/:id', authMiddleware, authController.deleteUser);
```

Embora funcione, o ideal para organização e clareza da API é que as rotas de usuários fiquem em `/usuarios` ou `/users` no nível raiz, e não dentro do `/auth`, que normalmente é reservado para autenticação (login, registro, logout). Isso ajuda a separar responsabilidades e facilita manutenção.

Se quiser, pode criar um arquivo `usuariosRoutes.js` e colocar lá as rotas relacionadas a usuários, incluindo exclusão e o endpoint `/usuarios/me` para retornar dados do usuário autenticado (bônus).

---

### 5. Endpoint de logout não invalida o token JWT

No seu `authRoutes.js`, a rota de logout é definida assim:

```js
router.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logout realizado com sucesso.' });
});
```

Ela não faz nada além de retornar uma mensagem. Como o JWT é stateless, para invalidar o token antes do tempo de expiração, seria necessário implementar uma blacklist ou algum mecanismo extra, que não está presente.

**Isso não é um erro grave**, mas vale mencionar que o logout apenas no front-end (removendo o token do cliente) é o usual. Se quiser ir além, pode implementar refresh tokens e blacklist para tokens expirados.

---

### 6. Boas práticas e melhorias que você já implementou

- Parabéns por ter implementado filtros e ordenação em agentes e casos, isso é um diferencial que agrega muito valor à API!
- Seu middleware de erros está bem organizado e usado em todos os controllers.
- Você já utiliza variáveis de ambiente para o segredo JWT, o que é essencial para segurança.

---

## Recursos recomendados para você se aprofundar 📚

- Sobre **migrations e Knex** para garantir que suas tabelas estejam criadas corretamente, veja este vídeo:  
  https://www.youtube.com/watch?v=dXWy_aGCW1E  
  (Documentação oficial de migrations do Knex)

- Para entender melhor a **autenticação JWT e segurança**:  
  https://www.youtube.com/watch?v=Q4LQOfYwujk  
  (Vídeo feito pelos meus criadores que explica fundamentos da autenticação)

- Para aprimorar o uso de **bcrypt e JWT juntos**:  
  https://www.youtube.com/watch?v=L04Ln97AwoY

- Para organizar seu projeto com arquitetura MVC, veja:  
  https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s

---

## Resumo rápido para focar:

- 🚨 Corrija a migration da tabela de usuários para usar o nome `"usuarios"` consistentemente no `up` e `down`.
- 🚨 Altere o método `criar` no `usuariosRepository.js` para retornar o campo `nome` junto com `id` e `email`.
- ✅ Continue validando o e-mail duplicado no registro, agora que a tabela estará correta.
- 💡 Considere separar as rotas de usuários em um arquivo próprio (`usuariosRoutes.js`) para melhor organização.
- ⚠️ Entenda que o logout atual não invalida tokens JWT, e que isso é normal em sistemas stateless.
- 🎯 Continue explorando filtros e ordenações, você está no caminho certo!

---

Aloana, você já tem uma base sólida e está quase lá! Corrigindo esses detalhes, sua API vai ficar mais robusta, segura e alinhada com as melhores práticas. Continue assim, sua evolução é clara e seu código mostra cuidado e atenção! 🚀✨

Se precisar de ajuda para entender qualquer ponto, me chama que eu te explico com mais exemplos! 😉

Abraços e bons códigos! 👩‍💻💙

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>