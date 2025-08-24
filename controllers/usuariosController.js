const usuariosRepository = require('../repositories/usuariosRepository');

class UsuariosController {
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const usuario = await usuariosRepository.buscarPorId(id);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      await usuariosRepository.deletar(id);
      res.status(204).send(); // 204 No Content
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar usuário.' });
    }
  }

  async getMe(req, res) {
    try {
      const usuario = await usuariosRepository.buscarPorId(req.user.id);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      usuario.senha = undefined;

      res.status(200).json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar dados do usuário.' });
    }
  }
}

module.exports = new UsuariosController();