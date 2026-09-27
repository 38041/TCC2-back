const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  if (req.session.user) {
    return res.sendFile(require('path').join(__dirname, '..', 'views', 'dashboard.html'));
  }
  res.sendFile(require('path').join(__dirname, '..', 'views', 'login.html'));
});

router.get('/cadastro', (req, res) => {
  res.sendFile(require('path').join(__dirname, '..', 'views', 'cadastro.html'));
});

module.exports = router;
