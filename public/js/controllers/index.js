'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', '$location',
 '$http', 'Global', 'Usuarios',
 function ($scope, $location, $http, Global, Usuarios) {
    $scope.global = Global;
    $scope.find = function() {
        var limite = 4
        //busca los procedimientos con mas visitas
        $http.get('procedimientos/', {
            params: {
                sort: 'visitas',
                tipoSort: -1,
                limite: limite
            }
        }).then(function(res){
            $scope.procedimientosVisitas = res.data;
            for (var i = $scope.procedimientosVisitas.length - 1; i >= 0; i--) {
                $scope.procedimientosVisitas[i] = $scope.calculaRating($scope.procedimientosVisitas[i]);
            }
        });

        //busca los ultimos procedimientos creados
        $http.get('procedimientos/', {
            params: {
                sort: 'created',
                tipoSort: -1,
                limite: limite
            }
        }).then(function(res){
            $scope.procedimientosUltimosCreados = res.data;
            for (var i = $scope.procedimientosUltimosCreados.length - 1; i >= 0; i--) {
                $scope.procedimientosUltimosCreados[i] = $scope.calculaRating($scope.procedimientosUltimosCreados[i]);
            }
        });
        //Vistos Recientemente
        Usuarios.get({
            userId: $scope.global.user._id
        }, function(usuario) {
            $http.get('procedimientos/', {
                params: {
                    campoQ: '_id',
                    valorQ: usuario.ultimosProcedimientos.splice(0,limite),
                    limite: limite
                }
            }).then(function(res){
                $scope.procedimientosUltimosVistos = res.data;
                for (var i = $scope.procedimientosUltimosVistos.length - 1; i >= 0; i--) {
                    $scope.procedimientosUltimosVistos[i] = $scope.calculaRating($scope.procedimientosUltimosVistos[i]);
                }
            });
        });
    };

    /**
     *va al procedimiento
     *@param {string} id del procedimiento al que se quiere ir
     */
    $scope.irProcedimiento = function(id) {
        $location.path('/procedimientos/' + id);
    };

    /**
     *Calcula el rating y suma la cantidad de votos  de un procedimiento
     */
    $scope.calculaRating = function(procedimiento) {
        procedimiento.totalVotos = procedimiento.rating.uno +
            procedimiento.rating.dos +
            procedimiento.rating.tres +
            procedimiento.rating.cuatro +
            procedimiento.rating.cinco;
            if (procedimiento.totalVotos > 0) {
                procedimiento.rate = Math.round(((procedimiento.rating.uno * 1) +
                    (procedimiento.rating.dos * 2) +
                    (procedimiento.rating.tres * 3) +
                    (procedimiento.rating.cinco * 5) +
                    (procedimiento.rating.cuatro * 4)) /
                    (procedimiento.totalVotos));
            } else {
                procedimiento.rate = 0;
            }
        return procedimiento;
    };
}]);
