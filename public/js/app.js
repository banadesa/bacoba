'use strict';

angular.module('mean', ['ngCookies', 'ngResource', 'ngRoute', 'ui.bootstrap', 'ui.route', 'mean.system', 'mean.directives', 'mean.filters', 'mean.procedimientos', 'mean.categorias','ui.select2','textAngular']);

angular.module('mean.system', []);

angular.module('mean.procedimientos', ['ui.select2','textAngular']);
angular.module('mean.categorias', []);
