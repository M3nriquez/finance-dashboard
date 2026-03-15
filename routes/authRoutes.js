const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { z } = require('zod'); 
const { Usuario } = require('../database'); 

const router = express.Router();

const schemaCadastro = z.object({
    nome: z.string().min(2, "Nome curto."),
    email: z.string().email("E-mail inválido."),
    senha: z.string().min(6, "Mínimo 6 caracteres.")
});

router.post('/cadastro', async (req, res) => {
    try {
        const validacao = schemaCadastro.safeParse(req.body);
        if (!validacao.success) return res.status(400).json({ erro: validacao.error.errors[0].message });
        const { nome, email, senha } = validacao.data;
        const usuarioExistente = await Usuario.findOne({ email: email });
        if (usuarioExistente) return res.status(400).json({ erro: 'E-mail já cadastrado.' });
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        await Usuario.create({ nome, email, senha: senhaCriptografada });
        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
    } catch (erro) { res.status(500).json({ erro: 'Erro no cadastro.' }); }
});

router.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const usuario = await Usuario.findOne({ email: email });
        if (!usuario) return res.status(400).json({ erro: 'Usuário não encontrado.' });
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(400).json({ erro: 'Senha incorreta.' });
        
        // AQUI ESTÁ O SEGREDO LIDO DO COFRE!
        const token = jwt.sign({ id: usuario._id }, process.env.CHAVE_SECRETA_JWT, { expiresIn: '2h' });
        
        res.status(200).json({ mensagem: 'Login aprovado!', token: token });
    } catch (erro) { res.status(500).json({ erro: 'Erro no login.' }); }
});

module.exports = router;