require('dotenv').config(); // NOVO: Abre o cofre antes de tudo!
const express = require('express');
require('./database'); 

const authRoutes = require('./routes/authRoutes');
const transacoesRoutes = require('./routes/transacoesRoutes');
const metasRoutes = require('./routes/metasRoutes');

const app = express();
// Lê a porta do cofre, ou usa a 3000 por padrão
const PORTA = process.env.PORTA || 3000; 

app.use(express.json());
app.use(express.static('public'));

app.use('/', authRoutes);
app.use('/', transacoesRoutes);
app.use('/', metasRoutes); 

app.listen(PORTA, () => { 
    console.log(`🚀 Servidor rodando na porta ${PORTA}`); 
});