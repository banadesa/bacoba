'use strict';

// Categorias routes use categorias controller
var categorias = require('../controllers/categorias');
var authorization = require('./middlewares/authorization');

// // Categorias authorization helpers
// var hasAuthorization = function(req, res, next) {
// 	if (req.categoria.user.id !== req.user.id) {
// 		return res.send(401, 'User is not authorized');
// 	}
//     next();
// };

module.exports = function(app) {

    app.get('/categorias', authorization.requiresLogin, authorization.esAdministrador, categorias.all);
	app.post('/categorias', authorization.requiresLogin, authorization.esAdministrador, categorias.create);
	app.get('/categorias/:categoriaId', authorization.requiresLogin, authorization.esAdministrador, categorias.show);
	app.put('/categorias/:categoriaId', authorization.requiresLogin, authorization.esAdministrador, categorias.update);
	app.del('/categorias/:categoriaId', authorization.requiresLogin, authorization.esAdministrador, categorias.destroy);

	//Finish with setting up the categoriaId param
	app.param('categoriaId', categorias.categoria);

};
