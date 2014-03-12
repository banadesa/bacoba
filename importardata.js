// mongoimport.js
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bacoba-dev');
var db = mongoose.connection;
var Schema = mongoose.Schema;
db.on('error', console.error.bind(console, 'connection error:'));

var data = require('./procedimientomuestra');


var Procedimiento = mongoose.model(
    'Procedimiento',
    mongoose.Schema({
        created: {
            type: Date,
            default: Date.now
        },
        updated: [{
            type: Date,
        }],
        nombre: {
            type: String,
            default: '',
            trim: true
        },
        descripcion: {
            type: String,
            default: '',
            trim: true
        },
        pasos: [{
            numeroPaso: {
                type: Number,
                default: '',
                trim: true
            },
            descripcion: {
                type: String,
                default: '',
                trim: true
            },
            imagen: {
                type: String,
                default: '',
                trim: true
            },
            video: {
                type: String,
                default: '',
                trim: true
            },
            version: {
                type: String,
                default: '1.0.0',
                trim: true
            },
            eliminado: {
                type: Boolean,
                default: false
            },
            actual: {
                type: Boolean,
                default: true
            }
        }],
        estado: {
            type: String,
            default: 'I',
            trim: true
        },
        versionActual: {
            type: String,
            default: '0',
            trim: true
        },
        versiones: [{
            version: {
                type: String,
                default: '',
                trim: true
            },
            fecha: {
                type: Date,
                default: Date.now
            }
        }],
        categorias: [{
            type: Schema.ObjectId,
            ref: 'Categoria'
        }],
        comentarios: [{
            user: {
                type: Schema.ObjectId,
                ref: 'User'
            },
            comentario: {
                type: String,
                default: '',
                trim: true
            },
            fecha: {
                type: Date,
                default: Date.now
            },
            rating: {
                type: Number,
                default: '',
                trim: true
            }
        }],
        rating: {
            uno: {
                type: Number,
                default: 0
             },
            dos: {
                type: Number,
                default: 0
             },
            tres: {
                type: Number,
                default: 0
             },
            cuatro: {
                type: Number,
                default: 0
             },
            cinco: {
                type: Number,
                default: 0
            }
        },
        user: {
            type: Schema.ObjectId,
            ref: 'User'
        },
        visitas: {
            type: Number,
            default: 0
        },
        eliminado: {
            type: String,
            default: 'N',
            trim: true
        }
    })
);

Procedimiento.find({},function(err,dbprocedimientos){

    for(var i=0; i<dbprocedimientos.length; i++) {
        dbprocedimientos[i].remove();
    }

    for(var i=0; i<data.length; i++) {
        var procedimiento = new Procedimiento({
        created: data[i].created,
        updated: data[i].updated,
        nombre: data[i].nombre,
        descripcion: data[i].descripcion,
        pasos: data[i].pasos,
        estado: data[i].estado,
        versionActual: data[i].versionActual,
        versiones:data[i].versiones,
        categorias: data[i].categorias,
        comentarios: data[i].comentarios,
        rating: data[i].rating,
        user: data[i].user,
        visitas: data[i].visitas,
        eliminado: data[i].eliminado
        });

        procedimiento.save(function(err,dbprocedimientos){
            if (err)
            console.log("No se pudo guardar el procedimiento");
        })
    }

    console.log("Se finalizo de importar la data de prueba, presione Ctrl+C");
})
