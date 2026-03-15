const express = require('express');
const { z } = require('zod'); 
const { Meta } = require('../database'); 
const verificarToken = require('../middlewares/auth');

const router = express.Router();

const schemaMeta = z.object({
    nome: z.string().min(2, "Obrigatório."),
    valorAlvo: z.number().positive("Maior que zero.")
});

router.post('/metas', verificarToken, async (req, res) => {
    try {
        const validacao = schemaMeta.safeParse(req.body);
        if (!validacao.success) return res.status(400).json({ erro: validacao.error.errors[0].message });
        const { nome, valorAlvo } = validacao.data;
        const novaMeta = await Meta.create({ nome, valorAlvo, valorAtual: 0, usuarioId: req.usuarioIdSeguro });
        res.status(201).json(novaMeta);
    } catch (erro) { res.status(500).json({ erro: 'Erro ao criar meta.' }); }
});

router.get('/metas', verificarToken, async (req, res) => {
    try { const metas = await Meta.find({ usuarioId: req.usuarioIdSeguro }); res.status(200).json(metas); } 
    catch (erro) { res.status(500).json({ erro: 'Erro.' }); }
});

router.put('/metas/:id', verificarToken, async (req, res) => {
    try { await Meta.findByIdAndUpdate(req.params.id, req.body); res.status(200).json({ msg: 'Atualizada!' }); } 
    catch (erro) { res.status(500).json({ erro: 'Erro.' }); }
});

router.delete('/metas/:id', verificarToken, async (req, res) => {
    try { await Meta.findByIdAndDelete(req.params.id); res.status(200).json({ msg: 'Apagada!' }); } 
    catch (erro) { res.status(500).json({ erro: 'Erro.' }); }
});

module.exports = router;