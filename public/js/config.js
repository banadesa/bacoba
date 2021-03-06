'use strict';

//Setting up route
angular.module('mean').config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/', {
            templateUrl: 'views/index.html',
            reloadOnSearch: false
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
        when('/procedimientos/pasos/:procedimientoId/:numeroPaso', {
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
            templateUrl: 'views/categorias/list.html',
            reloadOnSearch: false
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
        when('/users', {
            templateUrl: 'views/users/list.html',
            reloadOnSearch: false
        }).
        when('/users/create', {
            templateUrl: 'views/users/create.html'
        }).
        when('/users/:userId/edit', {
            templateUrl: 'views/users/edit.html'
        }).
        when('/users/:userId', {
            templateUrl: 'views/users/view.html'
        }).
        when('/users/:userId/cambiarclave', {
            templateUrl: 'views/users/cambiarClave.html'
        }).
        when('/users/create', {
            templateUrl: 'views/users/create.html'
        }).
        when('/administracion', {
            templateUrl: 'views/administracion.html'
        }).
        otherwise({
            redirectTo: '/'
        });
    }
]);
angular.module('mean').run(['Global', '$rootScope',
    function(Global, $rootScope) {
      $rootScope.$on('$routeChangeStart', function(event,currRoute) {
        if(!Global.authenticated){
          window.location = '/signin';
        }
        if (currRoute.$$route) {
            if (currRoute.$$route.originalPath === '/administracion') {
                if (!Global.user.administracion && !Global.user.seguridad) {
                    window.location = '/';
                }
            }

            if (currRoute.$$route.originalPath === '/users') {
                if (!Global.user.seguridad) {
                    window.location = '/';
                }
            }

            if (currRoute.$$route.originalPath === '/users/:userId/edit') {
                if (!Global.user.seguridad) {
                    window.location = '/';
                }
            }

            if (currRoute.$$route.originalPath === '/users/create') {
                if (!Global.user.seguridad) {
                    window.location = '/';
                }
            }

            if (currRoute.$$route.originalPath === '/categorias') {
                if (!Global.user.administracion) {
                    window.location = '/';
                }
            }

            if (currRoute.$$route.originalPath === '/categorias/:categoriaId/edit') {
                if (!Global.user.administracion) {
                    window.location = '/';
                }
            }

            if (currRoute.$$route.originalPath === '/categorias/create') {
                if (!Global.user.administracion) {
                    window.location = '/';
                }
            }

            if (currRoute.$$route.originalPath === '/procedimientos/create') {
                if (!Global.user.administracion) {
                    window.location = '/';
                }
            }

            if (currRoute.$$route.originalPath === '/procedimientos/pasos/:procedimientoId') {
                if (!Global.user.administracion) {
                    window.location = '/';
                }
            }

            if (currRoute.$$route.originalPath === '/users/:userId/cambiarclave') {
                if (!Global.user.seguridad) {
                    if (Global.user._id !== currRoute.params.userId) {
                        window.location = '/';
                    }
                }
            }
        }
      });
}]);
//Setting HTML5 Location Mode
angular.module('mean').config(['$locationProvider',
    function($locationProvider) {
        $locationProvider.hashPrefix('!');
    }
]);
