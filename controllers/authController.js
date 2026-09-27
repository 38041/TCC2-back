const bcrypt = require('bcryptjs');
const db = require('../db');

function registerUser(req, res) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).send('Preencha todos os campos.');
  }

  const hash = bcrypt.hashSync(senha, 10);

  db.query(
    'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)',
    [nome, email, hash],
    (err) => {

      if (err) {
        console.error('ERRO CADASTRO:', err);

        if (err.code === 'ER_DUP_ENTRY') {
          return res.send('Este e-mail já está cadastrado.');
        }

        return res.status(500).send('Erro ao cadastrar usuário.');
      }

      // depois do cadastro manda para o login do FRONTEND
      return res.redirect(
        'http://127.0.0.1:5500/pages/login.html'
      );
    }
  );
}

function loginUser(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).send('Informe email e senha.');
  }

  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (err, rows) => {

      // ERRO DE BANCO
      if (err) {
        console.error('ERRO LOGIN:', err);
        return res.status(500).send('Erro ao acessar o banco de dados.');
      }

      // EMAIL NÃO EXISTE
      if (rows.length === 0) {
        return res.status(401).send('E-mail ou senha incorretos.');
      }

      const usuario = rows[0];

      const senhaValida = bcrypt.compareSync(
        senha,
        usuario.senha
      );

      if (!senhaValida) {
        return res.status(401).send('E-mail ou senha incorretos.');
      }

      req.session.user = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      };

      // LOGIN CERTO → COTAÇÃO
      return res.redirect(
        'http://127.0.0.1:5500/pages/contato.html'
      );
    }
  );
}

function logoutUser(req, res) {
  req.session.destroy(() => {
    res.redirect(
      'http://127.0.0.1:5500/pages/login.html'
    );
  });
}

function deleteUser(req, res) {
  if (!req.session.user) {
    return res.redirect(
      'http://127.0.0.1:5500/pages/login.html'
    );
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
        res.redirect(
          'http://127.0.0.1:5500/pages/login.html'
        );
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