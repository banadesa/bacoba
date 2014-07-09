'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Procedimiento Schema
 */
var ProcedimientoSchema = new Schema({
    created: {
        type: Date,
        default: Date.now,
        index: true
    },
    updated: [{
        type: Date,
    }],
    nombre: {
        type: String,
        default: '',
        trim: true,
        index: true
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
        adjunto: {
            type: String,
            default: '',
            trim: true
        },
        procedimiento: {
            type: Schema.ObjectId,
            ref: 'Procedimiento'
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
            default: 0,
            trim: true
        }
    }],
    adjuntos:[{
        type: String,
        trim: true
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
        default: 0,
        index: true
    },
    eliminado: {
        type: String,
        default: 'N',
        trim: true
    }
});

/**
 * Validations
 */
ProcedimientoSchema.path('nombre').validate(function(nombre) {
    return nombre.length;
}, 'El nombre no puede estar vacio');

/**
 * Statics carga la info de un procedimiento
 *@param {objectId} id llave del procedimiento
 *@param {array} categorias del procedimiento
 *@param {function} cb callback a ejecturar
 */
ProcedimientoSchema.statics.load = function(id, categoriasP, cb) {
    this.findOne({
        _id: id,
        categorias: {$in: categoriasP}
    },
    function(err){
        if (err) { return err;}
    })
    .populate('categorias', 'name')
    .populate('comentarios.user', 'name')
    .populate('user', 'name username')
    .populate('pasos.procedimiento','pasos')
    .exec(cb);
};

mongoose.model('Procedimiento', ProcedimientoSchema);
