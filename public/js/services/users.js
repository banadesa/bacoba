/*'use strict';

//users service used for users REST endpoint
angular.module('mean.users')
.factory('Procedimientos', ['$resource', function($resource) {
    var Proc = $resource('users/:userId', {
        procedimientoId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
    return Proc;
}]);
*/
