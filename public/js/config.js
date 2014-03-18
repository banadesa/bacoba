'use strict';

//Setting up route
angular.module('mean').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'views/index.html'
        }).
        when('/procedimientos', {
            templateUrl: 'views/procedimientos/list.html'
        }).
        when('/procedimientos/create', {
            templateUrl: 'views/procedimientos/create.html'
        }).
        when('/procedimientos/:procedimientoId/edit', {
            templateUrl: 'views/procedimientos/edit.html'
        }).
        when('/procedimientos/:procedimientoId', {
            templateUrl: 'views/procedimientos/view.html'
        }).
        when('/procedimientos/pasos/:procedimientoId', {
            templateUrl: 'views/procedimientos/pasos.html'
        }).
        when('/categorias', {
            templateUrl: 'views/categorias/list.html'
        }).
        when('/categorias/create', {
            templateUrl: 'views/categorias/create.html'
        }).
        when('/categorias/:categoriaId/edit', {
            templateUrl: 'views/categorias/edit.html'
        }).
        when('/categorias/:categoriaId', {
            templateUrl: 'views/categorias/view.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);

//Setting HTML5 Location Mode
angular.module('mean').config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);
