'use strict';

angular.module('mean.categorias').controller('CategoriasController', ['$scope', '$routeParams', '$location', 'Global', 'Categorias', 'modalService', function ($scope, $routeParams, $location, Global, Categorias, modalService) {
    $scope.global = Global;

    $scope.create = function() {
        var categoria = new Categorias({
            name: this.name,
            description: this.description,
            padre: this.categoria.padre
        });
        categoria.$save(function(response) {
            $location.path('categorias/');
        });

        this.name = '';
        this.description = '';
        this.categorias = '';
        this.padre = '';
    };

    /**
     *Elimina la categoria
     *@param {object} categoria Categoria que se desea eliminar
     *
     */
    $scope.remove = function(categoria) {
         var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Eliminar Categoria',
            headerText: '¿Eliminar la categoria '+ categoria.name + '?',
            bodyText: 'Esta seguro que desea eliminar esta categoria?'
        };

        modalService.showModal({}, modalOptions).then(function (result) {
            if (categoria) {
                categoria.$remove();

                for (var i in $scope.categorias) {
                    if ($scope.categorias[i] === categoria) {
                        $scope.categorias.splice(i, 1);
                    }
                }
            }
        });
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

    /**
     *Busca todas las cateogrias y las mete a un arreglo
     */
    $scope.popularCategorias = function(query) {
        Categorias.query(query, function (categorias) {
            $scope.categorias = categorias;
        });
    };
}]);
