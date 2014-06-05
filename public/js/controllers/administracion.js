'use strict';

angular.module('mean.administracion').controller('AdministracionController', ['$scope', '$http', '$location', 'Global',
 function ($scope, $http, $location, Global) {
    $scope.global = Global;
    if ($scope.global.authenticated) {
        $scope.adminMenus = [{
            'title': 'Categorias',
            'link': 'categorias',
            'descripcion': 'Administracion de categorias, para crear editar o borrar',
            'ver': $scope.global.user.administracion
        }, {
            'title': 'Usuarios',
            'link': 'users',
            'descripcion': 'Administracion de usuarios, para crear editar o borrar',
            'ver': $scope.global.user.seguridad
        }, {
            'title': 'Crear Procedimiento',
            'link': 'procedimientos/create',
            'descripcion': 'Crear un nuevo procedimiento',
            'ver': $scope.global.user.administracion
        }];
    }

    /**
     * redirige a una direccion
     *@param {string} link link hacia donde redigir
     */
    $scope.ir = function(link) {
        $location.path(link);
    };
}]);
