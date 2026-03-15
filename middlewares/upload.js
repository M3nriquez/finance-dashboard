const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Note os ".." para ele sair da pasta middlewares e entrar na public!
const pastaUploads = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(pastaUploads)) {
    fs.mkdirSync(pastaUploads, { recursive: true });
    console.log("📁 Pasta 'uploads' garantida pelo Middleware!");
}

const armazenamento = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, pastaUploads); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: armazenamento });

module.exports = upload;