const bcrypt = require('bcryptjs');
const db = require('../db');

function registerUser(req, res) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.send('Preencha todos os campos.');
  }

  const hash = bcrypt.hashSync(senha, 10);

  db.query(
    'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)',
    [nome, email, hash],
    (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.send('Este e-mail já está cadastrado.');
        }

        console.error(err);
        return res.send('Erro ao cadastrar usuário.');
      }

      res.redirect('/');
    }
  );
}

function loginUser(req, res) {
  const { email, senha } = req.body;

  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (err, rows) => {
      if (err || rows.length === 0) {
       return res.status(401).json({
  sucesso: false,
  mensagem: 'Usuário não encontrado.'
});
      }

      const row = rows[0];

      const senhaValida = bcrypt.compareSync(senha, row.senha);

      if (!senhaValida) {
        return res.status(401).json({
  sucesso: false,
  mensagem: 'Senha incorreta.'
});
      }

      req.session.user = {
        id: row.id,
        nome: row.nome,
        email: row.email
      };

      res.redirect('/');
    }
  );
}

function logoutUser(req, res) {
  req.session.destroy(() => {
    res.redirect('/');
  });
}

function deleteUser(req, res) {
  if (!req.session.user) {
    return res.redirect('/');
  }

  const userId = req.session.user.id;

  db.query(
    'DELETE FROM users WHERE id = ?',
    [userId],
    (err) => {
      if (err) {
        console.error(err);
        return res.send('Erro ao excluir conta.');
      }

      req.session.destroy(() => {
        return res.status(200).json({
  sucesso: true,
  mensagem: 'Login realizado com sucesso',
  usuario: {
    id: row.id,
    nome: row.nome,
    email: row.email
  }
});
      });
    }
  );
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  deleteUser
};