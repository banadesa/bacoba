'use strict';

//procedimientos service used for procedimientos REST endpoint
angular.module('mean.procedimientos')
.factory('Procedimientos', ['$resource', function($resource) {
    return $resource('procedimientos/:procedimientoId', {
        procedimientoId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}])
.service('cargarArchivo', ['$http', '$q', function ($http, $q) {
    this.uploadFileToUrl = function(files, uploadUrl){
        var deferred = $q.defer();
        var fd = new FormData();
        var tipo;
        if (files.length > 0) {
            for (var i = files.length - 1; i >= 0; i--) {
                tipo = files[i].type.substring(0,files[i].type.indexOf('/'));
                console.log('tipo');
                console.log(tipo);
                fd.append(tipo, files[i]);
            };
            $http.post(uploadUrl, fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
            .success(function(data){
                deferred.resolve(data);
            })
            .error(function(err){
                deferred.reject(err);
            });
        } else {
            deferred.resolve('');
        };
        return deferred.promise;
    }
}]);
