require('dotenv').config();
const express = require('express');
const path = require('path'); 
require('./database'); 

const authRoutes = require('./routes/authRoutes');
const transacoesRoutes = require('./routes/transacoesRoutes');
const metasRoutes = require('./routes/metasRoutes');

const app = express();
const PORTA = process.env.PORT || process.env.PORTA || 3000; 

app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRoutes);
app.use('/', transacoesRoutes);
app.use('/', metasRoutes); 


app.get('/:path*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORTA, () => { 
    console.log(`🚀 Servidor rodando na porta ${PORTA}`); 
});