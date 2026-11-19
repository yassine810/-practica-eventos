const express = require('express');
const Evento = require('../models/evento');
const Recinto = require('../models/recinto');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const eventos = await Evento.find().populate('recinto');
        if (eventos.length === 0) {
            return res.status(500).json({ ok: false, error: 'No se han encontrado eventos' });
        }
        res.status(200).json({ ok: true, resultado: eventos });
    } catch (error) {
        res.status(500).json({ ok: false, error: 'No se han encontrado eventos' });
    }
});

router.get('/localidad/:nombre', async (req, res) => {
    try {
        const recintos = await Recinto.find({ localidad: req.params.nombre });
        const ids = recintos.map(recinto => recinto._id);
        const eventos = await Evento.find({
            recinto: { $in: ids },
            fecha: { $gt: new Date() }
        }).populate('recinto');

        if (eventos.length === 0) {
            return res.status(404).json({ ok: false, error: 'No se han encontrado eventos' });
        }
        res.status(200).json({ ok: true, resultado: eventos });
    } catch (error) {
        res.status(404).json({ ok: false, error: 'No se han encontrado eventos' });
    }
});

router.get('/entradas/:idEvento/:tipoEntrada', async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.idEvento);
        if (!evento) {
            return res.status(404).json({ ok: false, error: `Error obteniendo datos de entrada para evento ${req.params.idEvento}` });
        }

        const entrada = evento.entradas.find(entrada => entrada.tipo === req.params.tipoEntrada);
        if (!entrada) {
            return res.status(404).json({ ok: false, error: `Error obteniendo datos de entrada para evento ${req.params.idEvento}` });
        }

        res.status(200).json({ ok: true, resultado: { precio: entrada.precio, disponibles: entrada.disponibles } });
    } catch (error) {
        res.status(404).json({ ok: false, error: `Error obteniendo datos de entrada para evento ${req.params.idEvento}` });
    }
});

router.put('/entradas/:idEvento/:tipoEntrada/:cantidad', async (req, res) => {
    try {
        const cantidad = Number(req.params.cantidad);
        const evento = await Evento.findById(req.params.idEvento);

        if (!evento || !Number.isInteger(cantidad) || cantidad <= 0) {
            return res.status(404).json({ ok: false, error: `Error actualizando entradas del evento ${req.params.idEvento}` });
        }

        const entrada = evento.entradas.find(entrada => entrada.tipo === req.params.tipoEntrada);
        if (!entrada || entrada.disponibles < cantidad) {
            return res.status(404).json({ ok: false, error: `Error actualizando entradas del evento ${req.params.idEvento}` });
        }

        entrada.disponibles -= cantidad;
        await evento.save();
        res.status(200).json({ ok: true, resultado: evento });
    } catch (error) {
        res.status(404).json({ ok: false, error: `Error actualizando entradas del evento ${req.params.idEvento}` });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id).populate('recinto');
        if (!evento) {
            return res.status(404).json({ ok: false, error: `Evento ${req.params.id} no encontrado` });
        }
        res.status(200).json({ ok: true, resultado: evento });
    } catch (error) {
        res.status(404).json({ ok: false, error: `Evento ${req.params.id} no encontrado` });
    }
});

router.post('/', async (req, res) => {
    try {
        const evento = new Evento(req.body);
        const resultado = await evento.save();
        res.status(201).json({ ok: true, resultado: resultado });
    } catch (error) {
        res.status(500).json({ ok: false, error: 'Error añadiendo evento' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const evento = await Evento.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!evento) {
            return res.status(404).json({ ok: false, error: `Error actualizando evento ${req.params.id}` });
        }
        res.status(200).json({ ok: true, resultado: evento });
    } catch (error) {
        res.status(404).json({ ok: false, error: `Error actualizando evento ${req.params.id}` });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const evento = await Evento.findByIdAndDelete(req.params.id);
        if (!evento) {
            return res.status(404).json({ ok: false, error: `Error eliminando evento ${req.params.id}` });
        }
        res.status(200).json({ ok: true, resultado: evento });
    } catch (error) {
        res.status(404).json({ ok: false, error: `Error eliminando evento ${req.params.id}` });
    }
});

module.exports = router;
