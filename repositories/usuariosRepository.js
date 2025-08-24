const knex = require('../db/db'); // Importa a conexão com o banco

class UsuariosRepository {
  async criar(dadosUsuario) {
    const [usuario] = await knex('usuarios')
      .insert(dadosUsuario)
      .returning(['id', 'email']);
    return usuario;
  }

  async buscarPorEmail(email) {
    const usuario = await knex('usuarios').where({ email }).first();
    return usuario;
  }

  async buscarPorId(id) {
    const usuario = await knex('usuarios').where({ id }).first();
    return usuario;
  }

  async deletar(id) {
    return await knex('usuarios').where({ id }).del();
  }
}

module.exports = new UsuariosRepository();