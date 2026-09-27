const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const viewRoutes = require('./routes/viewRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors({
  origin: 'http://127.0.0.1:5500',
  credentials: true
}));

app.use(express.json());

const host = '0.0.0.0';
const port = Number(process.env.PORT) || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'tcc-secret-key',
  resave: false,
  saveUninitialized: false,
}));

app.use(authRoutes);
app.use(viewRoutes);
app.use(userRoutes);

function startServer(currentPort) {
  const server = app.listen(currentPort, host, () => {
    console.log(`Servidor rodando em http://localhost:${currentPort}`);
    console.log(`Acesse também pela rede usando http://<SEU_IP>:${currentPort}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Porta ${currentPort} em uso. Tentando ${currentPort + 1}...`);
      server.close(() => startServer(currentPort + 1));
      return;
    }

    console.error(err);
    process.exit(1);
  });
}

startServer(port);
