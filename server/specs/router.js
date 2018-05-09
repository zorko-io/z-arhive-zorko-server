const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { createSpec, removeSpec, getSpecs } = require('./handlers');
const config = require('./../../config');

const router = express.Router();

router.get(['/', '/:uid'], async (req, res, next) => {
    try {
        const uid = req.params.uid;
        const options = {
            limit: req.query.limit ? Number(req.query.limit) : 0,
            offset: req.query.offset ? Number(req.query.offset) : 0,
        };
        if (uid) {
            const spec = await getSpecs(uid, {});
            if (!spec) {
                res.status(404).send('Spec not found');
            }
            res.status(200).send(spec.spec);
        } else {
            const users = await getSpecs(null, options);
            res.status(200).send(users);
        }
    } catch (err) {
        next(err);
    }
});

router.post('/', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token.replace('Bearer ', ''), config.jwtsecret);
        const spec = {
            spec: req.body.spec ? req.body.spec : {},
            preview: null,
            title: req.body.title ? req.body.title : '',
            email: decoded.email,
        };
        const newSpec = await createSpec(spec);
        res.status(200).send(newSpec);
    } catch (err) {
        next(err);
    }
});

router.delete('/:uid', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const uid = req.params.uid;
        const token = req.headers.authorization;
        const decoded = jwt.verify(token.replace('Bearer ', ''), config.jwtsecret);
        const spec = await removeSpec(uid, decoded.email);
        res.status(204).send(spec);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
