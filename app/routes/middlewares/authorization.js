'use strict';

/**
 * Generic require login routing middleware
 */
exports.requiresLogin = function(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect('/signin');
    } else {
      next();
    }
};

/**
 * middle de seguridad que determina si el usuario es administrador
 */
exports.esAdministrador = function(req, res, next) {
    if (!req.user.administracion ) {
        return res.send(401, 'El usuario no es administrador');
    }
    next();
};


/**
 * middle de seguridad que determina si el usuario es de seguridad
 */
exports.esSeguridad = function(req, res, next) {
    if (!req.user.seguridad ) {
        return res.send(401, 'El usuario no es de seguridas');
    }
    next();
};
