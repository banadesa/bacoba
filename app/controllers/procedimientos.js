'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Procedimiento = mongoose.model('Procedimiento'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path');


/**
 * Find procedimiento by id
 */
exports.procedimiento = function(req, res, next, id) {
    Procedimiento.load(id, function(err, procedimiento) {
        if (err) return next(err);
        if (!procedimiento) return next(new Error('Failed to load procedimiento ' + id));
        req.procedimiento = procedimiento;
        next();
    });
};

/**
 * Create a procedimiento
 */
exports.create = function(req, res) {
    var procedimiento = new Procedimiento(req.body);
    procedimiento.user = req.user;

    procedimiento.save(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                procedimiento: procedimiento
            });
        } else {
            //Crea el directorio del procedimiento,
            //imagenes y videos del mismo
            var rootPath = path.normalize(__dirname + '/../..');
            rootPath = rootPath + '/public/contenido/' + procedimiento._id;
            var imagenesPath = rootPath + '/imagenes';
            var imagenesThumbsPath = rootPath + '/imagenes/thumbs';
            var videosPath = rootPath + '/videos';
            fs.mkdir(rootPath, function(e){
                console.log(e);
            });
            fs.mkdir(imagenesPath, function(e){
                fs.mkdir(imagenesThumbsPath, function(e){
                    console.log(e);
                });
                console.log(e);
            });
            fs.mkdir(videosPath, function(e){
                console.log(e);
            });

            res.jsonp(procedimiento);
        }
    });
};

/**
 * Update a procedimiento
 */
exports.update = function(req, res) {
    var procedimiento = req.procedimiento;
    procedimiento.categorias=[];
    procedimiento = _.extend(procedimiento, req.body);
    procedimiento.save(function(err) {
        if (err) {
            console.log(err);
            return res.send('users/signup', {
                errors: err.errors,
                procedimiento: procedimiento
            });
        } else {
            res.jsonp(procedimiento);
        }
    });
};

/**
 * Delete an procedimiento
 */
exports.destroy = function(req, res) {
    var procedimiento = req.procedimiento;

    procedimiento.remove(function(err) {
        if (err) {
            return res.send('users/signup', {
                errors: err.errors,
                procedimiento: procedimiento
            });
        } else {
            res.jsonp(procedimiento);
        }
    });
};

/**
 * Show an procedimiento
 */
exports.show = function(req, res) {
    res.jsonp(req.procedimiento);
};

/**
 * List of procedimientos
 */
exports.all = function(req, res) {
    var nombreConsulta;
    var campos;
    if (req.query.nombre) {
        nombreConsulta = new RegExp(req.query.nombre,'gi');
        campos = {nombre: 1, _id: 1, descripcion: 1};
    }
    else {
        nombreConsulta = new RegExp('','gi');
        campos = {};
    }

    Procedimiento.find({nombre: nombreConsulta},campos).sort('-created').populate('categorias', 'name')
    .populate('comentarios.user', 'name')
    .populate('user', 'name username')
    .populate('pasos.procedimiento','pasos')
    .exec(function(err, procedimientos) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(procedimientos);
        }
    });
};
/**
 *Carga la imagen y video del procedimiento ademas de hacer
 *un thumbnail de la imagen
 */
exports.upload = function (req, res) {
    var im = require('imagemagick');
    var procedimientoId = req.param('procedimientoId');
    var newVideoName, newImagenName;
    if (req.files){
        if (req.files.length === 0)
            res.send({ msg: 'No hay nada que subir' });
        else {
            var rootPath = path.normalize(__dirname + '/../..');
            rootPath = rootPath + '/public/contenido/' + procedimientoId;
            /*Guarda la imagen*/
            if (req.files.image) {
                if (req.files.image.size !== 0) {
                    var imagen = req.files.image;
                    var imagenName = imagen.name;
                    newImagenName = Math.round(new Date().getTime() / 1000) + imagenName ;
                    var newPathImagen = rootPath + '/imagenes/' + newImagenName;
                    var thumbPath = rootPath + '/imagenes/thumbs/' + newImagenName;
                    fs.readFile(imagen.path, function (err, data) {
                        /// If there's an error
                        if(!imagenName){
                            console.log('There was an error');
                            res.send('Nose se guardo la imagen');
                        } else {
                            /// write file to uploads/fullsize folder
                            fs.writeFile(newPathImagen, data, function (err) {
                                im.resize({
                                    srcPath: newPathImagen,
                                    dstPath: thumbPath,
                                    width:   '300!',
                                    height:   '150!'
                                }, function(err){
                                    if (err) throw err;
                                });
                                res.send('no se pudo cargar la imagen');
                                console.log(err);
                            });
                        }
                    });
                } else {
                    newImagenName = '';
                }
            }

            /*Guarda el video*/
            if (req.files.video){
                if (req.files.video.size !== 0) {
                    var video = req.files.video;
                    var videoName = video.name;
                    newVideoName = Math.round(new Date().getTime() / 1000) + videoName;
                    var newPathVideo = rootPath + '/videos/' + newVideoName;
                    fs.readFile(video.path, function (err, data) {
                        /// If there's an error
                        if(!videoName){
                            console.log('There was an error');
                            res.send('no existe el nombre del video');
                        } else {
                            /// write file to uploads/fullsize folder
                            fs.writeFile(newPathVideo, data, function (err) {
                                res.send('no se pudo cargar el video');
                                console.log(err);
                            });
                        }
                        console.log(err);
                    });
                } else {
                    newVideoName = '';
                }
            }

            var responseObj = {
                videoUrl: newVideoName,
                imagenUrl: newImagenName
            };
            res.send(JSON.stringify(responseObj));
        }
    }
    else {
        res.send({ msg: 'No existia el archivo ' + new Date().toString() });
    }
};
