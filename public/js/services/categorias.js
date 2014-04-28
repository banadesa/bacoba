'use strict';

//categorias service used for categorias REST endpoint
angular.module('mean.categorias')
.factory('Categorias', ['$resource', function($resource) {
    return $resource('categorias/:categoriaId', {
        categoriaId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);
