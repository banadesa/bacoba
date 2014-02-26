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
    rating: [{
        1: Number,
        2: Number,
        3: Number,
        4: Number,
        5: Number
    }],
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
});

/**
 * Validations
 */
ProcedimientoSchema.path('nombre').validate(function(nombre) {
    return nombre.length;
}, 'Name cannot be blank');

/**
 * Statics
 */
ProcedimientoSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id,
    },
    function(err, procedimiento){
        if (err) { return next(err);}
        procedimiento.visitas += 1;
        procedimiento.save(function(err) {
            if (err) { return next(err);}
        })
    }).populate('categorias', 'name').populate('user', 'name username').exec(cb);
};

mongoose.model('Procedimiento', ProcedimientoSchema);
