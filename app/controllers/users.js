'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    _ = require('lodash');

/**
 * Auth callback
 */
exports.authCallback = function(req, res) {
    res.redirect('/');
};

/**
 * Show login form
 */
exports.signin = function(req, res) {
    res.render('users/signin', {
        title: 'Iniciar Sesion',
        message: req.flash('error')
    });
};

/**
 * Show sign up form
 */
exports.signup = function(req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new User()
    });
};

/**
 * Logout
 */
exports.signout = function(req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Session
 */
exports.session = function(req, res) {
    res.redirect('/');
};

/**
 * Create user
 */
exports.create = function(req, res) {
    var user = new User(req.body);
    var message = null;

    user.provider = 'local';
    user.save(function(err) {
        if (err) {
            switch (err.code) {
                case 11000:
                case 11001:
                    message = 'Usuario  o Correo ya Existe';
                    break;
                default:
                    message = 'Favor Llene todos los campos';
            }
            res.send({
            message: message,
            success: true,
            id: user._id
        });
        }
        res.send({
            message: message,
            success: true,
            id: user._id,
            usuario: user.username
        });
    });
};

/**
 * Send User
 */
exports.me = function(req, res) {
    res.jsonp(req.user || null);
};


/**
 * Show an user
 */
exports.show = function(req, res) {
    res.jsonp(req.usuario);
};

/**
 * List of users
 */
exports.all = function(req, res) {
    User.find().populate('categorias', 'name').exec(function(err, users) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(users);
        }
    });
};


/**
 * Update a categoria
 */
exports.update = function(req, res) {
    var user = req.usuario;
    var message = '';
    user = _.extend(user, req.body);
    user.save(function(err) {
        if (err) {
            switch (err.code) {
                case 11000:
                case 11001:
                    message = 'Usuario  o Correo ya Existe';
                    break;
                default:
                    message = 'Favor Llene todos los campos';
            }
            res.send({'success': false, 'message':message, 'usuario': user});
        } else {
            res.send({'success': true, 'message': '','usuario': user});
        }
    });
};

/**
 * Delete an user
 */
exports.destroy = function(req, res) {
    var user = req.usuario;

    user.remove(function(err) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(user);
        }
    });
};

/**
 * Find user by id
 */
exports.user = function(req, res, next, id) {
    User.load(id, function(err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Error al cargar el usuario ' + id));
        req.usuario = user;
        next();
    });
};

/**
 * Cambia la clave del usuario
 */
exports.cambiarClave = function(req,res) {
    var id = 0;
    var nuevaClave = '';
    if (req.body.id) {
        id = req.body.id;
    }
    if (req.body.nuevaClave) {
        nuevaClave = req.body.nuevaClave;
    }
    User.findOne({_id: id}, function(err, usuario) {
        if (err) console.log(err);
        usuario.hashed_password = usuario.encryptPassword(nuevaClave);
        usuario.save(function(err){
            if (err) console.log(err);
            res.send({success: true});
        });
    });
};
