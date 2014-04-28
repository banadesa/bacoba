'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', 'Global', 'AppAlert',
 function ($scope, Global, AppAlert) {
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
}]);
