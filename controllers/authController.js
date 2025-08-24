const usuariosRepository = require('../repositories/usuariosRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthController {
  async register(req, res) {
    try {
      const { nome, email, senha } = req.body;

      const allowedFields = ['nome', 'email', 'senha'];
      const extraFields = Object.keys(req.body).filter(
        (field) => !allowedFields.includes(field)
      );
      if (extraFields.length > 0) {
        return res.status(400).json({ error: `Campos não permitidos: ${extraFields.join(', ')}` });
      }

      if (!nome || typeof nome !== 'string' || nome.trim() === '') {
        return res.status(400).json({ error: 'O campo nome é obrigatório.' });
      }
      if (!email || typeof email !== 'string' || email.trim() === '') {
        return res.status(400).json({ error: 'O campo email é obrigatório.' });
      }
      if (!senha || typeof senha !== 'string' || senha.trim() === '') {
        return res.status(400).json({ error: 'O campo senha é obrigatório.' });
      }

      const senhaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!senhaRegex.test(senha)) {
        return res.status(400).json({
          error: 'A senha deve ter no mínimo 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.',
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

      novoUsuario.senha = undefined;

      res.status(201).json(novoUsuario);
    } catch (error) {
      console.error(error); // Log do erro para debug
      res.status(500).json({ error: 'Erro interno ao registrar usuário.' });
    }
  }

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      const usuario = await usuariosRepository.buscarPorEmail(email);
      if (!usuario) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
      }

      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.status(200).json({ acess_token: token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno ao realizar login.' });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const usuario = await usuariosRepository.buscarPorId(id);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      await usuariosRepository.deletar(id);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro interno ao deletar usuário.' });
    }
  }
}

module.exports = new AuthController();