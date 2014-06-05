'use strict';

angular.module('mean.categorias').controller('CategoriasController', ['$scope', '$routeParams', '$location',
 '$window', 'Global', 'AppAlert', 'Categorias', 'modalService',
  function ($scope, $routeParams, $location, $window, Global, AppAlert, Categorias, modalService) {
    $scope.global = Global;

    $scope.create = function() {
        var categoria = new Categorias({
            name: this.name,
            description: this.description,
            padre: this.categoria.padre
        });
        categoria.$save(function(response) {
            AppAlert.add('success', '¡La categoria ' + response.name + ' fue creada exitosamente!');
            $window.history.back();
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

        modalService.showModal({}, modalOptions).then(function (/*result*/) {
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

        categoria.$update(function(response) {
            AppAlert.add('success', '¡La categoria ' + response.name + ' fue actualizada exitosamente!');
            $window.history.back();

        });
    };

    $scope.find = function() {
        $scope.busqueda = {};
        Categorias.query(function(categorias) {
            $scope.categorias = categorias;
            for (var i = 0; i < $scope.categorias.length; i++) {
                if (!$scope.categorias[i].padre) {
                    $scope.categorias[i].padre = {};
                    $scope.categorias[i].padre.name = '';
                }
            }
            if ($routeParams.nombre) {
                $scope.busqueda.name = $routeParams.nombre;
            }
            if ($routeParams.descripcion) {
                $scope.busqueda.description = $routeParams.descripcion;
            }
            if ($routeParams.padre) {
                $scope.busqueda.padre.name = $routeParams.padre;
            }
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

    /**
     * Agrega un parametro a la Url
     */
     $scope.AgregarParametroUrl = function(parametro, nombre) {
        if (nombre !=='') {
            $location.search(parametro, nombre);
        } else {
            $location.search(parametro, null);
        }
     };

     /*
     *va a la pagina anterior
     */
    $scope.irAtras = function() {
        $window.history.back();
    };


    /**
     *Redirige a la pagina que muestra el procedimiento y los pasos
     @param {string} url pagina a la que se ira
     */
    $scope.ir = function(url) {
        $location.path(url);
    };

    /**
    *
    */
    $scope.limpiarBusqueda = function() {
        $scope.busqueda.name='';
        $scope.busqueda.username='';
        $scope.busqueda.email='';
        $location.search('nombre',null);
        $location.search('correo',null);
        $location.search('email',null);
    };
}]);
