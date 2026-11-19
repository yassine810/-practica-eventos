require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const recintos = require('./routes/recintos');
const eventos = require('./routes/eventos');

const app = express();
const PORT = process.env.PORT || 3000;
const URL_BD = process.env.URL_BD || 'mongodb://127.0.0.1:27017/eventos';

app.use(express.json());
app.use('/recintos', recintos);
app.use('/eventos', eventos);

async function iniciarServidor() {
    try {
        await mongoose.connect(URL_BD);
        console.log('Conectado a MongoDB');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor iniciado en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('Error conectando con MongoDB:', error.message);
        process.exit(1);
    }
}

iniciarServidor();
