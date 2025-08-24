<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 9 créditos restantes para usar o sistema de feedback AI.

# Feedback para Aloana:

Nota final: **27.5/100**

# Feedback para Aloana 🚓✨

Olá, Aloana! Que jornada incrível você está trilhando ao desenvolver essa API segura para o Departamento de Polícia! 🎉 Eu pude ver muitos esforços e acertos no seu projeto, e também alguns pontos que, com ajustes, vão fazer sua aplicação ficar ainda mais robusta e profissional. Vamos juntos analisar seu código? 😉

---

## 🎉 Pontos Positivos e Conquistas Bônus

- Você estruturou seu projeto muito bem, com pastas claras para `controllers`, `repositories`, `routes`, `middlewares` e `utils`. Isso mostra que você já entende o valor da organização e da arquitetura MVC, o que é essencial para projetos escaláveis.

- A proteção das rotas `/agentes` e `/casos` com o middleware de autenticação (`authMiddleware`) está aplicada corretamente, garantindo que apenas usuários autenticados tenham acesso.

- Seu fluxo de login está funcionando e gerando JWTs válidos com expiração, além de você ter implementado a exclusão de usuários e logout.

- Você usou `bcryptjs` para hash de senhas, o que é ótimo para segurança.

- Implementou os seeds para agentes e casos, e a conexão com o banco via Knex está correta.

- Você avançou em alguns bônus, como a filtragem e ordenação em agentes e casos, e o middleware está validando o token JWT corretamente.

---

## 🚨 Pontos Críticos para Melhorar (Análise Detalhada)

### 1. **Validação Insuficiente no Registro de Usuário**

Ao analisar seu `authController.js`, percebi que a validação dos dados de entrada no registro está muito básica, o que causa vários problemas:

- Você só verifica se a senha tem pelo menos 8 caracteres, mas não valida os outros requisitos da senha (letras maiúsculas, minúsculas, números e caracteres especiais).

- Não há validação para campos obrigatórios como `nome`, `email` e `senha` para garantir que não estejam vazios ou nulos.

- Também não verifica se o corpo da requisição tem campos extras que não deveriam estar presentes.

Por exemplo, seu código atual para validação da senha é:

```js
if (senha.length < 8) {
    return res.status(400).json({ error: 'A senha deve ter no mínimo 8 caracteres.' });
}
```

Mas não há validações para os outros critérios da senha, nem para campos vazios.

**Por que isso é importante?**  
Sem essas validações, usuários podem ser criados com dados incompletos ou senhas fracas, o que compromete a segurança e a integridade da aplicação.

**Como melhorar?**  
Você pode usar expressões regulares para validar a senha conforme os critérios e verificar se os campos estão preenchidos corretamente. Por exemplo:

```js
const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

if (!nome || nome.trim() === '') {
  return res.status(400).json({ error: 'Nome é obrigatório.' });
}

if (!email || email.trim() === '') {
  return res.status(400).json({ error: 'Email é obrigatório.' });
}

if (!senha || senha.trim() === '') {
  return res.status(400).json({ error: 'Senha é obrigatória.' });
}

if (!senhaRegex.test(senha)) {
  return res.status(400).json({ 
    error: 'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.'
  });
}

// Também verifique se não há campos extras no corpo da requisição:
const allowedFields = ['nome', 'email', 'senha'];
const extraFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
if (extraFields.length > 0) {
  return res.status(400).json({ error: `Campos não permitidos: ${extraFields.join(', ')}` });
}
```

Recomendo fortemente assistir a esse **[vídeo sobre autenticação, feito pelos meus criadores](https://www.youtube.com/watch?v=Q4LQOfYwujk)**, que explica muito bem como validar dados de usuários e proteger rotas.

---

### 2. **Inconsistência entre o Nome da Tabela e os Campos na Migration de Usuários**

No arquivo de migration `20250821163905_user_table.js`, você criou a tabela com o nome `users` e os campos:

```js
.createTable('users', function (table) {
  table.increments('id').primary();
  table.string('nome').notNullable();
  table.string('email').notNullable().unique();
  table.string('password').notNullable();
})
```

Mas no seu `usuariosRepository.js` e no restante do código, você acessa a tabela `usuarios` e o campo `senha`. Por exemplo:

```js
const [usuario] = await knex('usuarios')
  .insert(dadosUsuario)
  .returning(['id', 'email']);
```

e

```js
const usuario = await knex('usuarios').where({ email }).first();
```

**Qual o problema?**  
Essa discrepância entre o nome da tabela (`users` vs `usuarios`) e o nome do campo da senha (`password` vs `senha`) gera erros na hora de consultar ou inserir dados, porque o banco não encontra a tabela ou o campo esperado.

**Como corrigir?**  
Você deve alinhar os nomes para que sejam consistentes em todo o projeto.

Opção 1: Alterar a migration para criar a tabela `usuarios` com o campo `senha`:

```js
.createTable('usuarios', function (table) {
  table.increments('id').primary();
  table.string('nome').notNullable();
  table.string('email').notNullable().unique();
  table.string('senha').notNullable();
})
```

E no método `down`:

```js
.dropTableIfExists('usuarios');
```

Opção 2: Alterar o código para usar `users` e `password` em todos os lugares.

Eu recomendo a opção 1 para manter o padrão em português, já que o restante do seu projeto está em português.

---

### 3. **Falta de Validação para Campos Vazios e Nulos no Registro**

Além da validação da senha, seu código não está validando se `nome` e `email` são nulos ou strings vazias antes de prosseguir com o cadastro.

Por exemplo, no seu `authController.js`:

```js
const { nome, email, senha } = req.body;

// não há validação para nome ou email vazios ou nulos
```

Isso pode permitir que usuários sejam criados com dados inválidos, o que quebra as regras de negócio.

**Como melhorar?**  
Inclua validações para garantir que esses campos estejam presentes e não sejam strings vazias ou apenas espaços em branco, como no exemplo anterior.

---

### 4. **Ausência de Validação para Campos Extras no Corpo da Requisição**

Seu endpoint de registro não está bloqueando campos extras que podem ser enviados no corpo da requisição, o que pode gerar inconsistências ou ser uma brecha de segurança.

Veja que no seu código não há nada parecido com:

```js
const allowedFields = ['nome', 'email', 'senha'];
const extraFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
if (extraFields.length > 0) {
  return res.status(400).json({ error: `Campos não permitidos: ${extraFields.join(', ')}` });
}
```

Essa prática ajuda a manter a API previsível e segura.

---

### 5. **Middleware de Autenticação: Armazenar Dados do Usuário no `req`**

No seu `authMiddleware.js`, você define:

```js
req.userId = decoded.id;
```

Porém, para facilitar o uso nos controllers, é comum armazenar o objeto inteiro do usuário autenticado, ou pelo menos um objeto `req.user` com as informações necessárias.

Isso não é um erro grave, mas pode ajudar na organização e futuras funcionalidades (como o endpoint `/usuarios/me` que você ainda não implementou).

---

### 6. **Documentação no INSTRUCTIONS.md**

Sua documentação está clara e bem estruturada, parabéns! Só recomendo que você destaque a obrigatoriedade da validação da senha com todos os critérios para evitar confusões.

---

## 🛠️ Exemplos de Correções para o `authController.js`

Aqui vai um exemplo de como você pode melhorar seu método `register` para incluir todas as validações necessárias:

```js
async register(req, res) {
  try {
    const { nome, email, senha, ...extraFields } = req.body;

    // Verifica campos extras
    if (Object.keys(extraFields).length > 0) {
      return res.status(400).json({ error: `Campos não permitidos: ${Object.keys(extraFields).join(', ')}` });
    }

    // Validação de campos obrigatórios
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ error: 'Nome é obrigatório.' });
    }
    if (!email || email.trim() === '') {
      return res.status(400).json({ error: 'Email é obrigatório.' });
    }
    if (!senha || senha.trim() === '') {
      return res.status(400).json({ error: 'Senha é obrigatória.' });
    }

    // Validação da senha com regex
    const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!senhaRegex.test(senha)) {
      return res.status(400).json({ 
        error: 'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.'
      });
    }

    const emailExistente = await usuariosRepository.buscarPorEmail(email);
    if (emailExistente) {
      return res.status(400).json({ error: 'Este email já está em uso.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await usuariosRepository.criar({
      nome,
      email,
      senha: senhaHash,
    });

    novoUsuario.senha = undefined; // Remove a senha do retorno

    res.status(201).json(novoUsuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
}
```

---

## 📚 Recursos Recomendados para Você

- **Validação e autenticação:**  
  [Vídeo sobre autenticação, feito pelos meus criadores](https://www.youtube.com/watch?v=Q4LQOfYwujk) — para entender melhor autenticação e validação de usuários.

- **JWT e bcrypt na prática:**  
  [JWT na prática](https://www.youtube.com/watch?v=keS0JWOypIU) e [JWT + bcrypt](https://www.youtube.com/watch?v=L04Ln97AwoY) — para aprofundar o uso seguro desses recursos.

- **Knex Migrations:**  
  [Documentação oficial do Knex.js sobre migrations](https://www.youtube.com/watch?v=dXWy_aGCW1E) — para garantir que suas migrations estejam alinhadas com seu código.

- **Arquitetura MVC em Node.js:**  
  [Arquitetura MVC para Node.js](https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s) — para continuar organizando seu projeto com boas práticas.

---

## ✅ Resumo dos Principais Pontos para Focar

- **Validação completa no registro de usuários:**  
  Garanta que `nome`, `email` e `senha` estejam presentes, não nulos ou vazios; valide a senha com todos os critérios exigidos; bloqueie campos extras.

- **Consistência na tabela do banco de dados:**  
  Alinhe o nome da tabela (`usuarios`) e o nome do campo de senha (`senha`) na migration para que batam com o que seu código acessa.

- **Melhore o middleware de autenticação para armazenar dados do usuário no `req.user`**, facilitando futuras funcionalidades.

- **Documente claramente as regras de validação no `INSTRUCTIONS.md`** para que os usuários saibam exatamente o que enviar.

- **Continue aplicando o padrão MVC e boas práticas que você já está usando!**

---

Aloana, você está no caminho certo e com dedicação, logo logo vai entregar uma aplicação segura e profissional! 🚀  
Continue praticando essas validações e alinhando seu banco com o código. Qualquer dúvida, estou aqui para ajudar! 😉

Um forte abraço e até a próxima revisão! 👩‍💻💙

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>