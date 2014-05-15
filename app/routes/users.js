'use strict';

// User routes use users controller
var users = require('../controllers/users');

var authorization = require('./middlewares/authorization');

var mismoUsuario = function(req, res, next) {
     if (!req.user.seguridad ) {
        console.log('req.body');
        console.log(req.body);
        console.log('req.user');
        console.log(req.user);
        if (req.body.id !== req.user.id) {
            return res.send(401, 'User is not authorized');
        }
    }
    next();
};

module.exports = function(app, passport) {

    app.get('/signin', authorization.requiresNoLogin, users.signin);
    app.get('/signup', users.signup);
    app.get('/signout', users.signout);
    app.get('/users/me', users.me);

    // Setting up the users api
    app.get('/users', authorization.requiresLogin, authorization.esAdministrador, users.all);
    app.post('/users', authorization.requiresLogin, authorization.esAdministrador, users.create);
    app.get('/users/:userId', authorization.requiresLogin, users.show);
    app.put('/users/:userId', authorization.requiresLogin, authorization.esAdministrador, users.update);
    app.post('/users/:userId/cambiarclave', authorization.requiresLogin, mismoUsuario, users.cambiarClave);
    app.del('/users/:userId', authorization.requiresLogin, authorization.esAdministrador, users.destroy);

    // Setting up the userId param
    app.param('userId', users.user);

    // Setting the local strategy route
    app.post('/users/session', passport.authenticate('local', {
        failureRedirect: '/signin',
        failureFlash: true
    }), users.session);

    // Setting the facebook oauth routes
    app.get('/auth/facebook', passport.authenticate('facebook', {
        scope: ['email', 'user_about_me'],
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        failureRedirect: '/signin'
    }), users.authCallback);

    // Setting the github oauth routes
    app.get('/auth/github', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/github/callback', passport.authenticate('github', {
        failureRedirect: '/signin'
    }), users.authCallback);

    // Setting the twitter oauth routes
    app.get('/auth/twitter', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.signin);

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        failureRedirect: '/signin'
    }), users.authCallback);

    // Setting the google oauth routes
    app.get('/auth/google', passport.authenticate('google', {
        failureRedirect: '/signin',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }), users.signin);

    app.get('/auth/google/callback', passport.authenticate('google', {
        failureRedirect: '/signin'
    }), users.authCallback);

    // Setting the linkedin oauth routes
    app.get('/auth/linkedin', passport.authenticate('linkedin', {
        failureRedirect: '/signin',
        scope: [ 'r_emailaddress' ]
    }), users.signin);

    app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
        failureRedirect: '/siginin'
    }), users.authCallback);

};
