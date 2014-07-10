'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Categoria = mongoose.model('Categoria'),
    Procedimiento = mongoose.model('Procedimiento'),
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
    var sort = '{}'; //campo para hacer el sort, en caso de vacio por fecha de creacion
    var limite = 20; //cuantos datos devolvera
    var query; //El query por el que se filtrara
    var campos = {}; //campos que se mostraran
    //busca si envio parametro para sort
    if (req.query.sort) {
        //si existe empieza a armar el string que se convertira en objeto tipo json
        sort = '{"' + req.query.sort + '" :';
        //determina si envio el tipo de sort y completa el string
        if (req.query.tipoSort) {
            sort = sort + ' ' + req.query.tipoSort + '}';
        } else {
            sort = sort + ' 1 }';
        }
    }

    //convierte el string a json
    sort = JSON.parse(sort);

    //determina si envio limite de envio
    if (req.query.limite) {
        limite= req.query.limite;
    }

//Query inicial donde se filtran las categorias que el usuario tiene asignado
    query = '{';

    //determina si se envio un query
    if (req.query.campoQ && req.query.valorQ) {
        //si quisieran mandar un 1 = 1 que no agregue los campos
        if (req.query.campoQ.toString() !== req.query.valorQ.toString()) {
            if (req.query.valorQ instanceof Array) {
                query = query + '"' + req.query.campoQ + '" : {"$in": [';
                for (var i = 0; i < req.query.valorQ.length; i++) {
                    if (typeof req.query.valorQ[i] === 'string') {
                        query = query + '"' + req.query.valorQ[i] + '", ';
                    } else {
                        query = query + ', ' + req.query.valorQ[i];
                    }
                }
                query = query.substring(0,query.length-2);
                query = query + ']}';

            } else {
                if (typeof req.query.valorQ === 'string') {
                    query = query + '"' + req.query.campoQ + '" : "' + req.query.valorQ + '"';
                } else {
                    query = query + '"' + req.query.campoQ + '" : ' + req.query.valorQ;
                }
            }
        }
    }

    query = query + '}';
    query = JSON.parse(query);
    Categoria.find(query,campos)
    .sort(sort)
    .populate('padre', 'name')
    .populate('user', 'name username')
    .exec(function(err, cates) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            var r = 0;
            var cuentaProcs = function() {
                 Procedimiento.count({categorias: cates[r]._id}, function(err,c) {
                    var categoriasUsuario =  [];
                    cates[r]._doc.actual = 'nav-lateral-no-actual';
                    cates[r]._doc.cantProcs = c;
                    cates[r]._doc.nivel = 1;
                    cates[r]._doc.orden = 1;
                    cates[r]._doc.cantHijos = 0;
                    if (r < cates.length-1) {
                        r++;
                        cuentaProcs();
                    } else {
                        if (req.query.nav) {
                            if( Object.prototype.toString.call( req.query.valorQ ) === '[object Array]' ) {
                                categoriasUsuario = req.query.valorQ;
                            } else {
                                categoriasUsuario.push(req.query.valorQ);
                            }
                            Procedimiento.find({categorias: {$in: categoriasUsuario}}).count({}, function(err,tot) {
                                cates.unshift({_id: 'todos', name: 'Todos', cantProcs: tot, actual: 'nav-lateral-no-actual', nivel : 1, cantHijos : 0, orden: 0});
                                res.jsonp(cates);
                            });
                        } else {
                            res.jsonp(cates);
                        }
                    }
                });
            };
            cuentaProcs();
        }
    });
};
