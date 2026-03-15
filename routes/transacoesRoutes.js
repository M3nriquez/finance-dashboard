const express = require('express');
const { z } = require('zod'); 
const { Transacao } = require('../database'); 
const verificarToken = require('../middlewares/auth');
const upload = require('../middlewares/upload');

const router = express.Router();

const schemaTransacao = z.object({
    descricao: z.string().min(2, "Obrigatório."),
    valor: z.coerce.number().positive("Maior que zero."),
    tipo: z.enum(['receita', 'despesa']),
    categoria: z.string().min(2, "Obrigatória.") 
});

function criarFiltroDeData(req) {
    const mes = parseInt(req.query.mes);
    const ano = parseInt(req.query.ano);
    if (!mes || !ano) return {}; 
    const dataInicial = new Date(ano, mes - 1, 1);
    const dataFinal = new Date(ano, mes, 0, 23, 59, 59, 999); 
    return { data: { $gte: dataInicial, $lte: dataFinal } };
}

router.get('/resumo', verificarToken, async (req, res) => {
    try {
        const filtroTempo = criarFiltroDeData(req);
        const transacoes = await Transacao.find({ usuarioId: req.usuarioIdSeguro, ...filtroTempo });
        let totalReceitas = 0; let totalDespesas = 0; let despesasPorCategoria = {}; 
        transacoes.forEach(t => { 
            if (t.tipo === 'receita') totalReceitas += t.valor; 
            else {
                totalDespesas += t.valor;
                despesasPorCategoria[t.categoria] = (despesasPorCategoria[t.categoria] || 0) + t.valor;
            } 
        });
        res.status(200).json({ totalReceitas, totalDespesas, despesasPorCategoria });
    } catch (erro) { res.status(500).json({ erro: 'Erro no resumo.' }); }
});

router.post('/transacoes', verificarToken, upload.single('comprovante'), async (req, res) => {
    try {
        const validacao = schemaTransacao.safeParse(req.body);
        if (!validacao.success) return res.status(400).json({ erro: validacao.error.errors[0].message });
        const { descricao, valor, tipo, categoria } = validacao.data; 
        const dadosDaTransacao = { descricao, valor, tipo, categoria, usuarioId: req.usuarioIdSeguro };
        if (req.file) dadosDaTransacao.comprovante = `/uploads/${req.file.filename}`;
        const novaTransacao = await Transacao.create(dadosDaTransacao);
        res.status(201).json(novaTransacao);
    } catch (erro) { res.status(500).json({ erro: 'Erro ao salvar.' }); }
});

router.get('/transacoes', verificarToken, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = 5; 
        const skip = (page - 1) * limit; 
        const categoriaFiltro = req.query.categoria; 
        const filtroTempo = criarFiltroDeData(req);
        let filtroDeBusca = { usuarioId: req.usuarioIdSeguro, ...filtroTempo };
        if (categoriaFiltro && categoriaFiltro !== 'todas') filtroDeBusca.categoria = categoriaFiltro; 
        const totalItems = await Transacao.countDocuments(filtroDeBusca);
        const totalPages = Math.ceil(totalItems / limit);
        const transacoes = await Transacao.find(filtroDeBusca).sort({ _id: -1 }).skip(skip).limit(limit);
        res.status(200).json({ transacoes, paginaAtual: page, totalPaginas: totalPages });
    } catch (erro) { res.status(500).json({ erro: 'Erro na lista.' }); }
});

router.delete('/transacoes/:id', verificarToken, async (req, res) => {
    try { await Transacao.findByIdAndDelete(req.params.id); res.status(200).json({ mensagem: 'Apagado!' }); } 
    catch (erro) { res.status(500).json({ erro: 'Erro' }); }
});

module.exports = router;