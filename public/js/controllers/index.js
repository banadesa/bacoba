'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', '$location',
 'Global', 'Procedimientos',
 function ($scope, $location, Global, Procedimientos) {
    $scope.global = Global;
    $scope.find = function() {
        Procedimientos.query(function(procedimientos) {
            $scope.procedimientos = procedimientos;
            for (var i = $scope.procedimientos.length - 1; i >= 0; i--) {
                $scope.procedimientos[i] = $scope.calculaRating($scope.procedimientos[i]);
            }
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
