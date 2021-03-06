'use strict';

// Procedimientos routes use procedimientos controller
var procedimientos = require('../controllers/procedimientos');
var authorization = require('./middlewares/authorization');

module.exports = function(app) {

    app.get('/procedimientos', authorization.requiresLogin, procedimientos.all);
	app.post('/procedimientos', authorization.requiresLogin, procedimientos.create);
    app.get('/procedimientos/:procedimientoId', authorization.requiresLogin, procedimientos.show);
	app.post('/procedimientos/:procedimientoId/visitas', authorization.requiresLogin, procedimientos.visitas);
    app.put('/procedimientos/:procedimientoId', authorization.requiresLogin, authorization.esAdministrador, procedimientos.update);
    app.post('/procedimientos/:procedimientoId/comentar', authorization.requiresLogin, procedimientos.updateComentario);
    app.post('/procedimientos/:procedimientoId/crearPdf', authorization.requiresLogin, procedimientos.crearPdf);
	app.post('/procedimientos/:procedimientoId/enviarCorreo', authorization.requiresLogin, procedimientos.enviarCorreo);
	app.del('/procedimientos/:procedimientoId', authorization.requiresLogin, authorization.esAdministrador, procedimientos.destroy);
    app.post('/procedimientos/upload', procedimientos.upload);
	//Finish with setting up the procedimientoId param
	app.param('procedimientoId', procedimientos.procedimiento);

};
