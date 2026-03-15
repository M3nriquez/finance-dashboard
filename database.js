const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Conectado ao MongoDB na NUVEM com sucesso! ☁️🍃'))
    .catch((erro) => console.error('Erro ao conectar:', erro));
// 1. Molde do Usuário
const usuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true }
});
const Usuario = mongoose.model('Usuario', usuarioSchema);

// 2. Molde da Transação
const transacaoSchema = new mongoose.Schema({
    descricao: { type: String, required: true },
    valor: { type: Number, required: true },
    tipo: { type: String, required: true },
    categoria: { type: String, required: true },
    comprovante: { type: String },
    data: { type: Date, default: Date.now }, 
    usuarioId: { type: String, required: true }
});
const Transacao = mongoose.model('Transacao', transacaoSchema);

// ... (resto do código continua igual) ...
// 3. NOVO: Molde da Meta
const metaSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    valorAlvo: { type: Number, required: true },
    valorAtual: { type: Number, default: 0 }, // Começa sempre com zero
    usuarioId: { type: String, required: true }
});
const Meta = mongoose.model('Meta', metaSchema);

// Exportamos os 3 modelos!
module.exports = { Usuario, Transacao, Meta };