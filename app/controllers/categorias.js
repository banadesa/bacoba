'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Categoria = mongoose.model('Categoria'),
    _ = require('lodash');


/**
 * Find categoria by id
 */
exports.categoria = function(req, res, next, id) {
    Categoria.load(id, function(err, categoria) {
        if (err) return next(err);
        if (!categoria) return next(new Error('Failed to load categoria ' + id));
        req.categoria = categoria;
        next();
    });
};

/**
 * Create a categoria
 */
exports.create = function(req, res) {
    var categoria = new Categoria(req.body);
    categoria.user = req.user;

    categoria.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                categoria: categoria
            });
        } else {
            res.jsonp(categoria);
        }
    });
};

/**
 * Update a categoria
 */
exports.update = function(req, res) {
    var categoria = req.categoria;

    categoria = _.extend(categoria, req.body);

    categoria.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                categoria: categoria
            });
        } else {
            res.jsonp(categoria);
        }
    });
};

/**
 * Delete an categoria
 */
exports.destroy = function(req, res) {
    var categoria = req.categoria;

    categoria.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                categoria: categoria
            });
        } else {
            res.jsonp(categoria);
        }
    });
};

/**
 * Show an categoria
 */
exports.show = function(req, res) {
    res.jsonp(req.categoria);
};

/**
 * List of categorias
 */
exports.all = function(req, res) {
    Categoria.find().sort('-padre').populate('padre', 'name').populate('user', 'name username').exec(function(err, categorias) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(categorias);
        }
    });
};
