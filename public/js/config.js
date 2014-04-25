'use strict';

//Setting up route
angular.module('mean').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'views/index.html'
        }).
        when('/procedimientos', {
            controller: 'ProcedimientosController',
            templateUrl: 'views/procedimientos/list.html',
            resolve: {
                proc: function(Procedimientos) {
                    return Procedimientos.query(function() {
                    })
                        .$promise.then(function(value){
                            return value;
                        });
                }
            }
        }).
        when('/procedimientos/create', {
            controller: 'ProcedimientosController',
            templateUrl: 'views/procedimientos/create.html',
            resolve: {
                proc: function() {
                    return 0;
                }
            }
        }).
        when('/procedimientos/:procedimientoId/edit', {
            controller: 'ProcedimientosController',
            templateUrl: 'views/procedimientos/edit.html',
            resolve: {
                proc: function($route, Procedimientos) {
                    return Procedimientos.get({
                        procedimientoId: $route.current.params.procedimientoId
                    })
                    .$promise.then(function(value){
                        return value;
                    });
                }
            }
        }).
        when('/procedimientos/:procedimientoId', {
            controller: 'ProcedimientosController',
            templateUrl: 'views/procedimientos/view.html',
            resolve: {
                proc: function($route, Procedimientos) {
                    return Procedimientos.get({
                        procedimientoId: $route.current.params.procedimientoId
                    })
                    .$promise.then(function(value){
                        return value;
                    });
                }
            }
        }).
        when('/procedimientos/pasos/:procedimientoId', {
            controller: 'ProcedimientosController',
            templateUrl: 'views/procedimientos/pasos.html',
            resolve: {
                proc: function($route, Procedimientos) {
                    return Procedimientos.get({
                        procedimientoId: $route.current.params.procedimientoId
                    })
                    .$promise.then(function(value){
                        return value;
                    });
                }
            }
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
        when('/users/create', {
            templateUrl: 'views/users/create.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);
angular.module('mean').run(['Global', '$rootScope', '$location',
    function(Global, $rootScope, $location) {
      $rootScope.$on('$routeChangeStart', function(evt) {
        if(!Global.authenticated){
          window.location = '/signin';
        }
      });
}])
//Setting HTML5 Location Mode
angular.module('mean').config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);
