'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', 'Global', 'Procedimientos',
 function ($scope, Global, Procedimientos) {
    $scope.global = Global;
    $scope.find = function() {
        Procedimientos.query(function(procedimientos) {
            $scope.procedimientos = procedimientos;
        });
    };
}]);
