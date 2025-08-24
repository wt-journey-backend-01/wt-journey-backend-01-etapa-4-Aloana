const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex('usuarios').del();

  const senhaHash1 = await bcrypt.hash('Senha@123', 10);
  const senhaHash2 = await bcrypt.hash('OutraSenha#456', 10);

  await knex('usuarios').insert([
    {
      nome: 'Alice Admin',
      email: 'alice.admin@policia.gov',
      senha: senhaHash1,
    },
    {
      nome: 'Beto Bravo',
      email: 'beto.bravo@policia.gov',
      senha: senhaHash2,
    },
  ]);
};