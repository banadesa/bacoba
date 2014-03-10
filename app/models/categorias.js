'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


/**
 * Categoria Schema
 */
var CategoriaSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    updated: [{
        type: Date,
    }],
    name: {
        type: String,
        default: '',
        trim: true
    },
    description: {
        type: String,
        default: '',
        trim: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    padre: {
        type: Schema.ObjectId,
        ref: 'Categoria'
    }
});

/**
 * Validations
 */
CategoriaSchema.path('name').validate(function(name) {
    return name.length;
}, 'Name cannot be blank');

/**
 * Statics
 */
CategoriaSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate('padre', 'name').populate('user', 'name username').exec(cb);
};

mongoose.model('Categoria', CategoriaSchema);
