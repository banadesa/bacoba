'use strict';

angular.module('mean.system').controller('HeaderController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;

    $scope.menu = [{
        'title': 'procedimientos',
        'link': 'procedimientos'
    }, {
        'title': 'categorias',
        'link': 'categorias'
    }];
    
    $scope.isCollapsed = false;
}]);