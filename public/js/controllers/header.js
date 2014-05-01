'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', '$http', '$location', 'Global', 'AppAlert',
 function ($scope, $http, $location, Global, AppAlert) {
    $scope.global = Global;

    $scope.menu = [{
        'title': 'procedimientos',
        'link': 'procedimientos'
    }, {
        'title': 'categorias',
        'link': 'categorias'
    }, {
        'title': 'Usuarios',
        'link': 'users/'
    }];

    $scope.isCollapsed = false;

    $scope.cerrarAlerta = function(index) {
        $scope.alerts.splice(index, 1);
    }

    /**
     *Busca procedimientos por el nombre
     *@param {string} val nombre del procedimiento
      *@return {object} procedimiento con el nombre y la descripcion
     */
    $scope.buscaProcedimientos = function(val) {
        return $http.get('procedimientos/', {
            params: {
                nombre: val
            }
        }).then(function(res){
            var procedimientos = [];
            angular.forEach(res.data, function(item){
                procedimientos.push(item);
            });
            return procedimientos;
        });
    };

    /**
     *funciones luego que se selecciona un procedimiento en la busqueda
     *@param {object} $item objeto que contiene la respuesta del typeahead
     */
    $scope.seleccionarProcedimiento = function($item) {
        console.log($item);
        $location.path('/procedimientos/' + $item._id);
    };
}]);
