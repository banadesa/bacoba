'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    Procedimiento = mongoose.model('Procedimiento'),
    User = mongoose.model('User'),
    _ = require('lodash'),
    fs = require('fs'),
    fse = require('fs-extra'),
    path = require('path'),
    pdfDoc = require('pdfkit'),
    nodemailer = require('nodemailer');

/**
 *Crea el archivo PDF
 *@param {object} req envio
 *@param {object} res respuesta
 *@param {function} callback funcion despues que se termine de hacer el pdf
 *@param {boolean} tieneCb si tiene callback o no
 */

var crearPdf = exports.crearPdf = function(req, res, next) {
    var doc = new pdfDoc();
    var externo = req.body.externo;
    var sizeOf = require('image-size');
    var rootPath = path.normalize(__dirname + '/../..');
    var fechaActualizacion;
    var nombrePdf; // nombre del documento Pdf, sin ruta
    var pdfPath; // ruta de la carpeta del pdf
    var procPath; // ruta de la carpeta del procedimiento
    var docPath; // ruta donde esta el documento
    var url; // url del pdf
    var imgActual; //ruta completa de la imagen que se mostrara;
    var imgWidth; // anchura de la imagen que se mostrara;
    var imgHeight; //altura de la imagen que se mostrara;
    var tamañoMaximo = 400; //tamaño maximo de las imagenes a mostrar
    var nuevoProc = {}; //nuevo procedimiento donde se pondran los pasos y subpasos
    var proc = req.procedimiento;
    var categoriasP = []; // categorias a las que el usuario tiene acceso
    if (req.user.categorias) {
        categoriasP = req.user.categorias;
    } else {
        categoriasP = ['nada'];
    }
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
     *@param {string} err Error
     *@param {object} proc procedimiento original
     *@param {number} i numero de posicion del objeto en el array
     *@param {object} padreProc procedimiento padre
     *@param {number} iPadre numero de posicion del objeto en el array del procedimiento Padre
     *@param {object} nuevoProc procedimiento agregando los pasos
     *@param {number} veces cantindad de veces que se "metera" a un subproceso
     *@param {function} callback
     *@return {object} objeto modificado
     */
    var llenarProc = function(proc, i, padreProc, iPadre, pasoPadre, nuevoProc , veces, callback) {
            var actual = false;
            if (proc.pasos[i]) {
                actual = proc.pasos[i].actual
                nuevoProc.pasos.push(proc.pasos[i]);

                //Asigno el id del procedimiento por si este es distinto al procedimiento original
                nuevoProc.pasos[nuevoProc.pasos.length -1 ].rutaImg = proc._id;
                //Asigno el paso que aparece en pantalla recorriendo todos los padres ej 1.1.1.2
                for (var j = pasoPadre.length - 1; j >= 0; j--) {
                    if (nuevoProc.pasos[nuevoProc.pasos.length -1 ].numeroPasoReal) {
                        nuevoProc.pasos[nuevoProc.pasos.length -1 ].numeroPasoReal = pasoPadre[j] + '.' + nuevoProc.pasos[nuevoProc.pasos.length -1 ].numeroPasoReal;
                    } else {
                        nuevoProc.pasos[nuevoProc.pasos.length -1 ].numeroPasoReal = pasoPadre[j] + '.' + nuevoProc.pasos[nuevoProc.pasos.length -1 ].numeroPaso;
                    }
                }
                //Si no tiene un pasoReal porque no tiene padres se le asigna en base al numero de paso
                if (!nuevoProc.pasos[nuevoProc.pasos.length -1 ].numeroPasoReal) {
                    nuevoProc.pasos[nuevoProc.pasos.length -1 ].numeroPasoReal = nuevoProc.pasos[nuevoProc.pasos.length -1 ].numeroPaso;
                }
                //Hago una division del numero de paso real por cada . para poder ordernarlo despues
                //separo el numero real en un array
                var aArray = nuevoProc.pasos[nuevoProc.pasos.length -1 ].numeroPasoReal.toString().split('.');
                //creo el nuevo elemento de numeroPasoDivido en el objeto
                nuevoProc.pasos[nuevoProc.pasos.length -1 ].numeroPasoDivido = 0;
                var divisor = 1;
                    for (var t = 0; t < aArray.length; t++) {
                        nuevoProc.pasos[nuevoProc.pasos.length -1 ].numeroPasoDivido = nuevoProc.pasos[nuevoProc.pasos.length -1 ].numeroPasoDivido +
                            (aArray[t] * divisor);
                        divisor = divisor / 100;
                    };
            }

            //Inserto el procedimiento a nuevo proc
            //si es un paso actual si aparecera en el pdf por lo que se continua, esto cambiara cuando se
            //puedan mostrar las versiones.
            if (actual) {
                //si el paso es otro procedimiento se cargan los procedimientos de este
                if (proc.pasos[i].procedimiento) {
                    //Que tantos niveles se debe indagar en los subpasos se controla en la variable de veces
                    //en cada nivel si resta el numero de veces, al llegar a cero no seguira bajando niveles
                    if (veces >= 0) {
                        //Busco el procedimiento del paso en la base de datos
                        Procedimiento.load(proc.pasos[i].procedimiento._id, categoriasP, function(err, procedimiento) {
                            //si hay error lo muestro en consola
                            if (err) return console.log(err);
                            //si el procedimiento esta vacio lo muestro en consola
                            if (!procedimiento) return console.log('Error al cargar el procedimiento ' +
                                proc.pasos[i].procedimiento.nombre);
                            //ya que baje de nivel resto uno al numero de veces
                            veces--;
                            //inserto el numero de paso del procedimiento como el paso del padre
                            pasoPadre.push(proc.pasos[i].numeroPaso);
                            //inserto el procedimiento como el procedimiento padre
                            padreProc.push(proc);

                            //el padre sera el siguiente paso al que me quede
                            iPadre.push(i+1);
                            //aumento el i

                            //si no es el ultimo paso del procedimiento
                            if (i <= proc.pasos.length -1) {
                                //llamo al llenar proc con
                                llenarProc(procedimiento, //proc: procedimiento devuelto en la consulta de la BD
                                    0, // i
                                    padreProc,
                                    iPadre,
                                    pasoPadre,
                                    nuevoProc,
                                    veces,
                                    callback);
                            } else { //si es el utlimo paso
                                //si tiene un padre
                                if (padreProc.length > 0) {
                                    //
                                    pasoPadre.pop();
                                    llenarProc(padreProc.pop(),  // proc el utlimo procedimiento padre
                                        iPadre.pop(), //i el i por donde nos habiamos quedado
                                        padreProc, //el resto del padre
                                        iPadre,
                                        pasoPadre,
                                        nuevoProc,
                                        veces,
                                        callback);
                                } else { //si no tiene un padre y es el utlimo paso llamo el callback(salida)
                                    callback();
                                }
                            }
                        }); //termino de hacer la busqueda en la BD
                    }
                //si no el paso no es un procedimiento
                } else {
                    //aumento el i
                    i++;
                    //si no es el ultimo paso
                    if (i <= proc.pasos.length -1) {
                        llenarProc(proc, i, padreProc, iPadre, pasoPadre, nuevoProc, veces, callback);
                    } else { //si es el utlimo paso
                        //si tiene un padre
                        if (padreProc.length > 0) {
                            pasoPadre.pop();
                            llenarProc(padreProc.pop(),  //proc saco el procedimiento padre
                                iPadre.pop(), //i
                                padreProc,
                                iPadre,
                                pasoPadre,
                                nuevoProc,
                                veces,
                                callback);
                        } else {//si todavia tiene padre
                            callback();
                        }
                    }
                }
            } else { //si no es un paso actual salto al siguiente en caso que no sea el ultimo
                i++; //aumento el i
                //si no es el ultimo paso
                if (i <= proc.pasos.length -1) {
                    llenarProc(proc, i, padreProc, iPadre, pasoPadre, nuevoProc, veces, callback);
                } else { //si es el ultimo paso reviso que no tenga un padre
                    if (padreProc.length > 0) {
                        llenarProc(padreProc.pop(), iPadre.pop(), padreProc,
                                iPadre, pasoPadre, nuevoProc, veces, callback);
                    } else { //si es el utimo paso y no tiene padres llamo el callback(salida)
                        callback();
                    }
                }
            }
    };

    /**
     *Recibe texto en html y lo transforma al formato PDF  necesario
     */
    var htmlAPdf = function (texto){
        var extracto=''; //texto que ya ha sido extraidp
        var tag=''; //tag que se encontro en el texto
        var tamTexto = 12; //tamaño del texto en el pdf
        var continuar = true; // si continua en la misma linea o hace salto
        var subrayado = false; // si el texto va subrayado o no
        var indentado = 0; // si va indentado o no
        var textColor = 'black'; // color del texto
        var refLink = ''; // link al que apunta el tag a
        var tags = []; //tags a los que he entrado pero no he cerrado
        var numLi = -1; //si esta en ol el numero que muestra el Li.
        var bulletLi = ''; //si esta en ul ponga el bullet Point.
        // el span solo indica que el texto va corrido, que es asi por defecto asi
        //que se quita
        texto = texto.replace(/<span>/g,'').replace(/<\/span>/g,' ');
        //reemplado el <br/> por '' porque no debe haber saltos asi
        texto = texto.replace(/<br\/>/g,'');
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
                        });
                        refLink='';
                    } else {
                        doc.fontSize(tamTexto)
                        .fillColor(textColor)
                        .text(extracto, {
                            underline: subrayado,
                            indent: indentado,
                            continued: continuar
                        });
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
                        doc.text('')
                        .moveDown(1);
                        break;
                    case 'h2':
                        tamTexto = tamTexto + 4;
                        doc.text('')
                        .moveDown(1);
                        break;
                    case 'b':
                        tamTexto = tamTexto + 1;
                        break;
                    case 'u':
                        subrayado = true;
                        break;
                    case 'li':
                        if (numLi >= 0 ) {
                            numLi ++;
                            extracto = extracto + numLi + '.  ';
                        }
                        if (bulletLi) {
                            extracto = extracto + bulletLi + '  ';
                        }
                        indentado = indentado + 10;
                        doc.text('')
                        .moveDown(1);
                        break;
                    case 'div':
                        doc.text('')
                        .moveDown(1);
                        break;
                    case 'p':
                        doc.text('')
                        .moveDown(1);
                        break;
                    case 'pre':
                        doc.text('')
                        .moveDown(1);
                        break;
                    case 'i':
                        textColor = 'red';
                        break;
                    case 'ul':
                        bulletLi = '•';
                        doc.text('')
                        .moveDown(1);
                        break;
                    case 'ol':
                        numLi = 0;
                        doc.text('')
                        .moveDown(1);
                        break;
                    case 'a':
                        textColor = 'blue';
                        break;
                    }
                }
                else {
                    tag = tags.pop();
                    i = i + 2 + tag.length;
                    switch (tag) {
                    case 'h1':
                        tamTexto = tamTexto - 6;
                        break;
                    case 'h2':
                        tamTexto = tamTexto - 4;
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
                        break;
                    case 'pre':
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
            });
            extracto = '';
        }
    };
/**
     *Guarda paso a paso el documento en el archivo PDF
     *recursivamente por la espera que daba leer el tamaño de
     *las imagenes
     *@param {number} iPdf numero de paso
     *@param {object} procPdf procedimiento que se hara PDF
     */
    var pasoAPdf = function(iPdf, procPdf) {

        var factor; //factor por el que se debe multiplicar la imagen para reducir el tamaño
        if (procPdf.pasos[iPdf].actual) {
            //Inserta un espacio entre el paso anterior y este
            doc.text('')
            .moveDown(1);
            doc.fontSize(15)
            .fillColor('green')
            //Inserta el numero de paso
            .text('No° ' + procPdf.pasos[iPdf].numeroPasoReal, {
                underline: false,
                indent: false,
                align: 'left'
            }).moveDown();
            //manda la descripcion a la funcion htmlaPdf
            htmlAPdf(procPdf.pasos[iPdf].descripcion);
            doc.moveDown(1);
            //Si es una imagen busca que las dimensiones de la misma y determina si es necesario un salto de pagina
            if (procPdf.pasos[iPdf].imagen) {
                imgActual = procPath + procPdf.pasos[iPdf].rutaImg + '/imagenes/' + procPdf.pasos[iPdf].imagen;
                imgWidth = undefined;
                imgHeight = undefined;
                sizeOf(imgActual, function (err, dimensions) {
                    imgWidth = dimensions.width;
                    imgHeight = dimensions.height;
                    if (imgHeight > tamañoMaximo || imgWidth > tamañoMaximo) {
                        if (imgHeight > imgWidth) {
                            factor = tamañoMaximo/imgHeight;
                        } else {
                            factor = tamañoMaximo/imgWidth;
                        }
                        if (factor*imgHeight + doc.y > 800) {
                            doc.addPage();
                        }
                        doc.image(imgActual,
                        {
                            fit: [factor * imgWidth, factor * imgHeight]
                        });
                    }
                    else {
                        if (imgHeight + doc.y > 800) {
                            doc.addPage();
                        }
                        doc.image(imgActual);
                    }
                    final(iPdf, procPdf);
                });
            } else {
                final(iPdf, procPdf);
            }
        } else {
            final(iPdf, procPdf);
        }
};

    /**
     *Si existe otro paso llama al siguiente,
     *sino termina el documento PDF o
     *@param {number} iFinal numero de paso
     *@param {object} procFinal procedimiento que se hara PDF
     */
    function final(iFinal, procFinal) {
        if (iFinal + 1 > procFinal.pasos.length -1) {
            doc.end();
            setTimeout(function(){
            console.log('supuestamente termine');
            if (externo) {
                res.send({url: url});
            } else {
                next (docPath);
            }}, 2000);
        } else {
            pasoAPdf(iFinal + 1, procFinal);
        }
    }

    /**
     *saca un string aleatorio de una longitud len
     *sacado de http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
     *@param {number} len longitud del string a generarse
     */

    function stringGen(len) {
        var text =' ';
        var charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
        for( var i=0; i < len; i++ )
            text += charset.charAt(Math.floor(Math.random() * charset.length));
        return text;
    }
    nombrePdf = proc.nombre.replace(/ /g,'_') + '_' + proc.versionActual + '_' + stringGen(5) + '.pdf';
    rootPath = rootPath + '/public/';
    procPath = rootPath + '/contenido/';
    pdfPath = rootPath + '/pdfs/';
    docPath = pdfPath + nombrePdf;
    url = '/pdfs/' + nombrePdf;
    doc.pipe(fs.createWriteStream(docPath));
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
    if (proc.pasos) {
        if (proc.pasos.length > 0) {
            llenarProc(proc, 0, [], [], [], nuevoProc, 4, function () {
                //Orden los pasos del procedimiento de forma ascendente
                nuevoProc.pasos.sort(function(a,b) {
                    var n = b.actual - a.actual;
                    if (n !== 0) {
                        return n;
                    }
                    n = a.numeroPasoDivido - b.numeroPasoDivido;
                    if (n !== 0) {
                        return n;
                    }
                    return a.version - b.version;
                });
                pasoAPdf(0, nuevoProc);
            });
        }
    }
};

/**
 *Envia correos a solicitud
 */
exports.enviarCorreo = function(req, res) {
    // create reusable transport method (opens pool of SMTP connections)
    var destinatario = {};
    var comentario = ''
    destinatario = req.body.destinatario;
    // destinatario.correo = 'jperdomo@banadesa.hn';
    // destinatario.nombre = 'Jose Eduardo Perdomo';
    if (destinatario.comentario) {
         comentario = 'con el siguiente comentario: <p>'+ destinatario.comentario + '</p>';
    }
    var proc = req.procedimiento;
    var smtpTransport = nodemailer.createTransport('SMTP',{
        host: "129.200.10.10",
        secureConnection: false, // use SSL
        port: 25, // port for secure SMTP
        auth: {
            user: "git@banadesa.hn",
            pass: "tecno2013"
        }
    });
    crearPdf(req,res, function(rutaArchivo) {
        var mailOptions = {
            from: 'Base de Conocimiento Banadesa<git@banadesa.hn>', // sender address
            to: destinatario.correo, // list of receivers
            subject: proc.nombre, // Subject line
            text: 'Distinguido' + destinatario.nombre + ',\n' + req.user.name + 'le ha enviado el manual ' +
                proc.nombre + ' ' + comentario.replace('<p>', '').replace('</p>','\n') + ' \n*****favor no responder este correo*****', // plaintext body
            html: '<p>Distinguido ' + destinatario.nombre + ',</p>' + '<b>' + req.user.name + '</b> le ha enviado el manual <b>' +
               '<a href="http://localhost:3000/#!/procedimientos/' + proc.id +'">' + proc.nombre + '</a></b> ' + comentario +
               '<p><small>***favor no responder este correo</small></p>***',
            attachments: [
                {
                    fileName: proc.nombre + '.pdf',
                    filePath: rutaArchivo
                }
            ]
        };
        console.log('mailOptions.attachments');
        console.log(mailOptions.attachments);
        // send mail with defined transport object
        smtpTransport.sendMail(mailOptions, function(error, response){
            if(error){
                console.log(error);
                res.send(error);
            }else{
                console.log('Message sent: ' + response.message);
                res.send({success: true});
            }

            // if you don't want to use this transport object anymore, uncomment following line
            //smtpTransport.close(); // shut down the connection pool, no more messages
        });
    });
    // setup e-mail data with unicode symbols
};


/**
 * Find procedimiento by id
 */
exports.procedimiento = function(req, res, next, id) {
    var categoriasP = [];
    if (req.user.categorias) {
        categoriasP = req.user.categorias;
    } else categoriasP = ['nada'];
    Procedimiento.load(id, categoriasP, function(err, procedimiento) {
        if (err) return next(err);
        if (!procedimiento) return next();
        req.procedimiento = procedimiento;
        next();

    });
};

/**
 * aumenta el numero de visitas
 */
exports.visitas = function(req, res) {
    var existe; //determina si existe en el array el procedimiento o no
    //Asigno las categorias que el usuario tiene acceso
    var categoriasP = [];
    if (req.user.categorias) {
        categoriasP = req.user.categorias;
    } else categoriasP = ['nada'];
    var id = req.params.procedimientoId; //id del procedimiento
    //actualizo el procedimiento para sumarle +1 a la visita
    Procedimiento.findOne({
        _id: id,
        categorias: {$in: categoriasP}
    },function(err, procedimiento){
        if (err) { return err;}
        if (procedimiento) {
            procedimiento.visitas += 1;
            procedimiento.save(function(err) {
                if (err) { res.send({success:false, err: err}); }
                //Busco el usuario para agregarle el procedimiento visto
                User.findOne({
                    _id: req.user._id
                }, function(err, user) {
                     if (err) { res.send({success:false, err: err}); }
                     //Busco si encontro un usuario con ese id
                     if (user) {
                        //se guardan los ultimos 10 procedimientos vistos
                        // si tiene mas saco el ultimo
                        existe = _.findIndex(user.ultimosProcedimientos, function(cat) {
                                        return cat.toString() === id.toString();
                                    });
                        if (existe === -1) {
                            if (user.ultimosProcedimientos.length > 9) {
                                user.ultimosProcedimientos.pop();
                            }
                        } else {
                            user.ultimosProcedimientos.splice(existe,1);
                        }
                        user.ultimosProcedimientos.unshift(id);
                        user.save(function(err) {
                            if (err) { res.send({success:false, err: err}); }
                            res.send({success:true});
                        });
                     }
                });
            });
        }
    });
};


/**
 * Create a procedimiento
 */
exports.create = function(req, res) {
    /**
     *Crea las carpetas al crear un procedimiento
     *@param {string} id id del procedimiento a crear
     *@param {string} idDup id del procedimiento que se esta duplicando
     *@param {function} cb callback a ejecturar
     */
    var crearCarpetas = function(id, idDup, cb) {
        var rootPath = path.normalize(__dirname + '/../..');
        var rootPathDup = rootPath + '/public/contenido/' + idDup;
        rootPath = rootPath + '/public/contenido/' + id;
        var imagenesPath = rootPath + '/imagenes';
        var imagenesThumbsPath = rootPath + '/imagenes/thumbs';
        var videosPath = rootPath + '/videos';
        var adjuntosPath = rootPath + '/adjuntos';
        fs.mkdir(rootPath, function(e){
            if (e) {
                console.log(e);
            }
            fs.mkdir(imagenesPath, function(e){
                if (e) {
                    console.log(e);
                }
                fs.mkdir(imagenesThumbsPath, function(e){
                    if (e) {
                        console.log(e);
                    }
                    fs.mkdir(videosPath, function(e){
                        if (e) {
                            console.log(e);
                        }
                        fs.mkdir(adjuntosPath, function(e){
                            if (e) {
                                console.log(e);
                            }
                            if (idDup) {
                                fse.copy(rootPathDup + '/imagenes/',
                                    imagenesPath,
                                    function(err){
                                        if (err) return console.error(err);
                                });
                                fse.copy(rootPathDup + '/videos/',
                                    videosPath,
                                    function(err){
                                        if (err) return console.error(err);
                                });
                                fse.copy(rootPathDup + '/adjuntos/',
                                    adjuntosPath,
                                    function(err){
                                        if (err) return console.error(err);
                                });
                                cb();
                            }
                            cb();
                        });
                    });
                });
            });
        });
    };

    if (req.body.params) {
        var id = req.body.params.id;
        Procedimiento.findOne({_id: id}, function(err, procedimiento) {
            if (err) { return console.log(err); }
            delete procedimiento._doc._id;
            delete procedimiento._doc.created;
            procedimiento._doc.nombre = procedimiento._doc.nombre + '(Copia)';
            procedimiento._doc.comentarios = [];
            procedimiento._doc.visitas = 0;
            procedimiento._doc.versiones=[];
            procedimiento._doc.updated=[];
            procedimiento._doc.versionActual='1.0.0';
            procedimiento._doc.rating.uno = 0;
            procedimiento._doc.rating.dos = 0;
            procedimiento._doc.rating.tres = 0;
            procedimiento._doc.rating.cuatro = 0;
            procedimiento._doc.rating.cinco = 0;
            procedimiento._doc.user = req.user;
            for (var h = procedimiento._doc.pasos.length - 1; h >= 0; h--) {
                if ( procedimiento._doc.pasos[h].actual){
                    procedimiento._doc.pasos[h].version = '1.0.0';
                }
                else {
                    procedimiento._doc.pasos.splice(h,1);
                }
            }

            var nuevoProcedimiento = new Procedimiento(procedimiento._doc);
            nuevoProcedimiento.save(function(err,proc) {
                if (err) {
                    return res.send('users/signup', {
                        errors: err.errors,
                        procedimiento: proc
                    });
                } else {
                    crearCarpetas(proc._id, id, function(){
                        res.send({id: proc._id});
                    });
                }
            });
        });
    } else {
        var procedimiento = new Procedimiento(req.body);
        procedimiento.user = req.user;
        procedimiento.save(function(err) {
            if (err) {
                return res.send('users/signup', {
                    errors: err.errors,
                    procedimiento: procedimiento
                });
            } else {
                crearCarpetas(procedimiento._id, null, function() {
                    res.jsonp(procedimiento);
                });
            }
        });
    }
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
    if (!req.procedimiento) {
        res.redirect('/');
    } else {
        res.jsonp(req.procedimiento);
    }
};

/**
 * List of procedimientos
 */
exports.all = function(req, res) {
    // console.log('req.query');
    // console.log(req.query);
    var sort = '{}'; //campo para hacer el sort, en caso de vacio por fecha de creacion
    var limite = 20; //cuantos datos devolvera
    var query; //El query por el que se filtrara
    var nombreConsulta;
    var campos = {};
    var categoriasP = [];
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


    if (req.user.categorias) {
        categoriasP = req.user.categorias;
    } else categoriasP = ['nada'];

    //Query inicial donde se filtran las categorias que el usuario tiene asignado
    query = '{ "categorias": {"$in": [';
    for (var j = categoriasP.length - 1; j >= 0; j--) {
        query = query + '"' + categoriasP[j] + '", ';
    }
    query = query.substring(0,query.length-2);
    query = query + ']}';

    if (req.query.nombre) {
        nombreConsulta = new RegExp(req.query.nombre,'gi');
        query = query + ', "nombre": "' + nombreConsulta + '"';
        campos = {nombre: 1, _id: 1, descripcion: 1};
    }
    else {
        nombreConsulta = new RegExp('','gi');
        campos = {};
    }

    //determina si se envio un query
    if (req.query.campoQ && req.query.valorQ) {
        //si quisieran mandar un 1 = 1 que no agregue los campos
        if (req.query.campoQ.toString() !== req.query.valorQ.toString()) {
            if (req.query.valorQ instanceof Array) {
                query = query + ', "' + req.query.campoQ + '" : {"$in": [';
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
                    query = query + ', "' + req.query.campoQ + '" : "' + req.query.valorQ + '"';
                } else {
                    query = query + ', "' + req.query.campoQ + '" : ' + req.query.valorQ;
                }
            }
        }
    }

    query = query + '}';
    query = JSON.parse(query);
    query.nombre = nombreConsulta;
    Procedimiento.find(query,campos)
    .sort(sort).populate('categorias', 'name')
    .limit(limite)
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
    var newVideoName, newImagenName, newAdjuntoName;
    console.log('hola estoy aqui');
    console.log(req.files);
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

            /*Guarda el archivo Adjunto*/
            if (req.files.adjunto){
                if (req.files.adjunto.size !== 0) {
                    var adjunto = req.files.adjunto;
                    var adjuntoName = adjunto.name;
                    newAdjuntoName = Math.round(new Date().getTime() / 1000) + adjuntoName;
                    var newPathAdjunto = rootPath + '/adjuntos/' + newAdjuntoName;
                    fs.readFile(adjunto.path, function (err, data) {
                        /// If there's an error
                        if(!adjuntoName){
                            console.log('There was an error');
                            res.send('no existe el nombre del adjunto');
                        } else {
                            /// write file to uploads/fullsize folder
                            fs.writeFile(newPathAdjunto, data, function (err) {
                                res.send('no se pudo cargar el adjunto');
                                console.log(err);
                            });
                        }
                        console.log(err);
                    });
                } else {
                    newAdjuntoName = '';
                }
            }

            var responseObj = {
                videoUrl: newVideoName,
                imagenUrl: newImagenName,
                adjuntoUrl: newAdjuntoName
            };
            res.send(JSON.stringify(responseObj));
        }
    }
    else {
        res.send({ msg: 'No existia el archivo ' + new Date().toString() });
    }
};

exports.updateComentario = function (req, res, next) {
    var id = req.param('procedimientoId'); // id del procedimiento
    var comentario = req.body;
    Procedimiento.findOne({_id: id}, function(err, procedimiento){
        if (err) { return next(err); }
        procedimiento.comentarios.unshift(comentario);
        switch(comentario.rating) {
        case 1:
        procedimiento.rating.uno =procedimiento.rating.uno + 1;
        break;
        case 2:
        procedimiento.rating.dos =procedimiento.rating.dos + 1;
        break;
        case 3:
        procedimiento.rating.tres =procedimiento.rating.tres + 1;
        break;
        case 4:
        procedimiento.rating.cuatro =procedimiento.rating.cuatro + 1;
        break;
        case 5:
        procedimiento.rating.cinco =procedimiento.rating.cinco + 1;
        break;
        }
      procedimiento.save(function(err) {
        if (err) { return next(err); }
      });
    });
};




