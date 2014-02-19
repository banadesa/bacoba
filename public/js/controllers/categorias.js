'use strict';

angular.module('mean.categorias').controller('CategoriasController', ['$scope', '$routeParams', '$location', 'Global', 'Categorias', function ($scope, $routeParams, $location, Global, Categorias) {
    $scope.global = Global;

    $scope.create = function() {
        var categoria = new Categorias({
            name: this.name,
            description: this.description
        });
        categoria.$save(function(response) {
            $location.path('categorias/' + response._id);
        });

        this.name = '';
        this.description = '';
        this.categorias = '';
    };

    $scope.remove = function(categoria) {
        if (categoria) {
            categoria.$remove();

            for (var i in $scope.categorias) {
                if ($scope.categorias[i] === categoria) {
                    $scope.categorias.splice(i, 1);
                }
            }
        }
        else {
            $scope.categoria.$remove();
            $location.path('categorias');
        }
    };

    $scope.update = function() {
        var categoria = $scope.categoria;
        if (!categoria.updated) {
            categoria.updated = [];
        }
        categoria.updated.push(new Date().getTime());

        categoria.$update(function() {
            $location.path('categorias/' + categoria._id );
        });
    };

    $scope.find = function() {
        Categorias.query(function(categorias) {
            $scope.categorias = categorias;
        });
    };

    $scope.findOne = function() {
        Categorias.get({
            categoriaId: $routeParams.categoriaId
        }, function(categoria) {
            $scope.categoria = categoria;
        });
    };
}]);