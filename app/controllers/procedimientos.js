'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Procedimiento = mongoose.model('Procedimiento'),
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    pdfDoc = require('pdfkit');

/**
 *Crea el archivo PDF
 *@param {object} proc objeto que contiene el procedimiento del procedimiento
 *@param {boolean} subpaso indica si es un subpaso o no, y asi saber si crear un nuevo doc
 *@param {PdfDocument} doc PDF
 */

var crearPDF = function(proc, subpaso, doc, callback) {
    var sizeOf = require('image-size');
    var rootPath = path.normalize(__dirname + '/../..');
    var fechaActualizacion;
    var imgActual; //ruta completa de la imagen que se mostrara;
    var imgWidth; // anchura de la imagen que se mostrara;
    var imgHeight; //altura de la imagen que se mostrara;
    var tamañoMaximo = 400; //tamaño maximo de las imagenes a mostrar
    var nuevoProc = {}; //nuevo procedimiento donde se pondran los pasos y subpasos
    nuevoProc._id = proc._id;
    nuevoProc.nombre = proc.nombre;
    nuevoProc.updated = proc.updated;
    nuevoProc.versionActual= proc.versionActual;
    nuevoProc.descripcion= proc.descripcion;
    nuevoProc.updated = proc.updated;
    nuevoProc.updated = proc.updated;
    nuevoProc.pasos = [];
    /**
     *Funcion que llena el array de los procedimientos con los usbpasos
     *@param {object} proc procedimiento original
     *@param {object} nuevoProc agregando los pasos
     *@param {number} veces cantindad de veces que se "metera" a un subproceso
     *@param {function} callback
     *@return {object} objeto modificado
     */
    var llenarProc = function(proc, nuevoProc , veces, callback) {
        for (var i = proc.pasos.length - 1; i >= 0; i--) {
            nuevoProc.pasos.push(proc.pasos[i]);
            nuevoProc.pasos[nuevoProc.pasos.length -1 ].rutaImg = proc._id;
            if (proc.pasos[i].procedimiento) {
                if (veces >= 0) {
                    Procedimiento.load(proc.pasos[i].procedimiento._id, function(err, procedimiento) {
                        console.log('tengo el resultado de' + procedimiento.nombre)
                        if (err) return next(err);
                        if (!procedimiento) return next(new Error('Error al cargar el procedimiento ' + id));
                        veces--;
                        llenarProc(procedimiento, nuevoProc,veces, function() {
                        });
                    });
                }
            }
        }
        //console.log('llamado a callback');
        callback();
    }

    /**
     *Recibe texto en html y lo transforma al formato PDF  necesario
     */
    var htmlAPdf = function (texto){
        var extracto=''; //texto que ya ha sido extraidp
        var tag=''; //tag que se encontro en el texto
        var tamTexto = 12; //tamaño del texto en el pdf
        var continuar = false; // si continua en la misma linea o hace salto
        var subrayado = false; // si el texto va subrayado o no
        var indentado = 0; // si va indentado o no
        var bajar = 0; //cuantas lineas debe bajar
        var textColor = 'black'; // color del texto
        var refLink = ''; // link al que apunta el tag a
        var tags = []; //tags a los que he entrado pero no he cerrado
        var numLi = -1; //si esta en ol el numero que muestra el Li.
        var bulletLi = ''; //si esta en ul ponga el bullet Point.
        //replace el caracter &#160 de forma global con un espacio
        texto = texto.replace(/&#160;/g,' ');
        // el span solo indica que el texto va corrido, que es asi por defecto asi
        //que se quita
        texto = texto.replace(/<span>/g,'').replace(/<\/span>/g,' ');
        //reemplado el <br/> por <p></p> porque resulta mas facil manejar el salto
        texto = texto.replace(/<br\/>/g,'<p></p>');
        for (var i = 0; i <= texto.length - 1; i++) {
            if (texto[i] !== '<') {
                extracto = extracto + texto[i];
            }
            else {
                if (extracto) {
                    if (refLink) {
                        doc.fontSize(tamTexto)
                        .fillColor(textColor)
                        .text(extracto, {
                            underline: subrayado,
                            indent: indentado,
                            continued: continuar,
                            link: refLink
                        })
                        .moveDown(bajar);
                        refLink='';
                    } else {
                        doc.fontSize(tamTexto)
                        .fillColor(textColor)
                        .text(extracto, {
                            underline: subrayado,
                            indent: indentado,
                            continued: continuar
                        })
                        .moveDown(bajar);
                    }
                    extracto = '';
                    continuar = true;
                }
                if (texto[i+1] !== '/') {
                    tag=texto.substring(i +1 ,texto.indexOf('>',i+1));
                    i = i + tag.length + 1;
                    if (tag.substr(0,1) === 'a') {
                        refLink =  tag.substring(tag.indexOf('"') + 1, tag.indexOf('"', tag.indexOf('"') + 1));
                        tag = 'a';
                    }
                    tags.push(tag);
                    switch (tag) {
                    case 'h1':
                        tamTexto = tamTexto + 6;
                        continuar = false;
                        bajar = bajar + 0.5;
                        break;
                    case 'h2':
                        tamTexto = tamTexto + 4;
                        continuar = false;
                        bajar = bajar + 0.5;
                        break;
                    case 'b':
                        tamTexto = tamTexto + 1;
                        continuar = true;
                        break;
                    case 'u':
                        subrayado = true;
                        continuar = true;
                        break;
                    case 'li':
                        if (numLi >= 0 ) {
                            numLi ++;
                            extracto = extracto + numLi + '.  ';
                            console.log('numLi');
                            console.log(numLi);
                        }
                        if (bulletLi) {
                            extracto = extracto + bulletLi + '  ';
                            console.log('bulletLi');
                            console.log(bulletLi);
                        }
                        indentado = indentado + 10;
                        continuar = false;
                        break;
                    case 'div':
                        doc.text('')
                        .moveDown(1);
                        break;
                    case 'p':
                        continuar = false;
                        bajar = bajar + 1;
                        break;
                    case 'pre':
                        continuar = false;
                        bajar = bajar + 1;
                        break;
                    case 'i':
                        continuar = true;
                        textColor = 'red';
                        break;
                    case 'ul':
                        bulletLi = '•';
                        continuar = false;
                        break;
                    case 'ol':
                        numLi = 0;
                        continuar = false;
                        break;
                    case 'a':
                        textColor = 'blue';
                        break;
                    }
                }
                else {
                    tag = tags.pop();
                    i = i + 2 + tag.length;
                    console.log(tag);
                    switch (tag) {
                    case 'h1':
                        tamTexto = tamTexto - 6;
                        bajar = bajar - 0.5;
                        break;
                    case 'h2':
                        tamTexto = tamTexto - 4;
                        bajar = bajar - 0.5;
                        break;
                    case 'b':
                        tamTexto = tamTexto - 1;
                        break;
                    case 'u':
                        subrayado = false;
                        break;
                    case 'li':
                        indentado = indentado - 10;
                        break;
                    case 'div':
                        break;
                    case 'p':
                        bajar = bajar - 1;
                        break;
                    case 'pre':
                        bajar = bajar - 1;
                        break;
                    case 'i':
                        textColor = 'black';
                        break;
                    case 'ul':
                        bulletLi = '';
                        break;
                    case 'ol':
                        numLi = -1;
                        break;
                    case 'a':
                        textColor = 'black';
                        break;
                    }
                }
            }
        }
        if (extracto) {
            doc.fontSize(tamTexto)
            .fillColor(textColor)
            .text(extracto, {
                underline: subrayado,
                indent: indentado,
                continued: continuar
            })
            //.text(' ')
            .moveDown(bajar);
        }
    };
/**
     *Guarda paso a paso el documento en el archivo PDF
     *recursivamente por la espera que daba leer el tamaño de
     *las imagenes
     *@param {number} i numero de paso
     *@param {function} Callbacks()
     */
    function pasoAPdf(i, callback) {
        //TODO hacer por lo menos 3 nivel de recursivo
        //TODO hace que el comentario no cambie el orden
        //TODO borrar la clase cuando se graba un paso
        //TODO cambiar que solo acepte imagenes png y jpeg

        if (proc.pasos[i].actual) {
            doc.moveDown(1);
            doc.fontSize(15)
            .fillColor('green')
            .text('No.' + subpaso + proc.pasos[i].numeroPaso);
            doc.moveDown();
            htmlAPdf(proc.pasos[i].descripcion);
            doc.moveDown(1);
            if (proc.pasos[i].imagen) {
                imgActual = rootPath + proc.pasos[i].rutaImg + '/imagenes/' + proc.pasos[i].imagen;
                imgWidth = undefined;
                imgHeight = undefined;
                sizeOf(imgActual, function (err, dimensions) {
                    imgWidth = dimensions.width;
                    imgHeight = dimensions.height;
                    if (imgHeight > tamañoMaximo || imgWidth > tamañoMaximo) {
                        if (tamañoMaximo + doc.y > 730) {
                            doc.addPage();
                        }
                        doc.image(imgActual,
                        {
                            fit: [tamañoMaximo, tamañoMaximo]
                        });
                    }
                    else {
                        if (imgHeight + doc.y > 730) {
                            doc.addPage();
                        }
                        doc.image(imgActual);
                    }
                    callback();
                });
            } else {
                callback();
            }
        } else {
            callback();
        }
    }

    /**
     *Si existe otro paso llama al siguiente,
     *sino termina el documento PDF o
     *@param {number} i numero de paso
     */
    function final(i) {
        if (i +1 > proc.pasos.length -1) {
                doc.end();
        } else {
            pasoAPdf(i+1,function(){
                return final(i+1);
            });
        }
    }


    rootPath = rootPath + '/public/contenido/';
    doc.pipe(fs.createWriteStream(rootPath + proc.nombre +'.pdf'));
    //Inserta la Pagina Inicia
    fechaActualizacion = proc.updated[proc.updated.length -1].toISOString().substring(8,10) + '/' +
                            proc.updated[proc.updated.length -1].toISOString().substring(5,7) + '/' +
                            proc.updated[proc.updated.length -1].toISOString().substring(0,4);
    doc.fontSize(25)
    .text('Banco Nacional de Desarrollo Agricola',doc.x,100, {
        align: 'center'
    })
    .moveDown(1);

    //Inserta el logo de la pagina principal
    doc.image(path.normalize(__dirname + '/../..') + '/public/img/logo.jpg', 200,doc.y);

    //nombre del procedimiento
    doc.fontSize(30)
    .fillColor('green')
    .text(proc.nombre,doc.x,400,{
        align: 'center',
        fill: true
    });

    //fecha de actualizacion del procedimiento
    doc.fontSize(16)
    .fillColor('black')
    .text(fechaActualizacion, doc.x, 650, {
        align: 'center'
    })
    .moveDown(1);

    //version a imprimir del documento
    doc.fontSize(10)
    .text('Version ' + proc.versionActual, doc.x, 680, {
        align: 'right'
    });

    doc.addPage();

    //Inserta la Pagina de descripcion
    //titulo
    doc.fontSize(20)
    .fillColor('black')
    .text('Descripcion', doc.x, doc.y, {
        align: 'center'
    })
    .moveDown(2);

    //Descripcion del procedimiento
    doc.fontSize(14)
    .fillColor('black')
    .text(proc.descripcion, doc.x, doc.y, {
        align: 'left'
    });

    doc.addPage();

    llenarProc(proc,nuevoProc, 4, function () {
            pasoAPdf(0, function(){
                console.log('voy a empezar a generar los pasos');
                proc = nuevoProc;
                return final(0);
            });
    });
};
/**
 * Find procedimiento by id
 */
exports.procedimiento = function(req, res, next, id) {
    Procedimiento.load(id, function(err, procedimiento) {
        if (err) return next(err);
        if (!procedimiento) return next(new Error('Error al cargar el procedimiento ' + id));
        req.procedimiento = procedimiento;
        var doc = new pdfDoc();
        crearPDF(procedimiento, '', doc);
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


