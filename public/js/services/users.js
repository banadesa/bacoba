'use strict';

//users service used for users REST endpoint
angular.module('mean.usuarios')
.factory('Usuarios', ['$resource', function($resource) {
    return $resource('users/:userId', {
        userId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);
