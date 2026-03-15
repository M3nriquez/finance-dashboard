const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    if (!token) return res.status(401).json({ erro: 'Acesso negado. Faça login.' });
    
    // AQUI O SEGURANÇA LÊ A CHAVE DO COFRE TAMBÉM!
    jwt.verify(token, process.env.CHAVE_SECRETA_JWT, (erro, usuarioDecodificado) => {
        if (erro) return res.status(403).json({ erro: 'Token inválido ou expirado.' });
        req.usuarioIdSeguro = usuarioDecodificado.id;
        next(); 
    });
}

module.exports = verificarToken;