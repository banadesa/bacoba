'use strict';

//procedimientos service used for procedimientos REST endpoint
angular.module('mean.procedimientos')
.factory('Procedimientos', ['$resource', function($resource) {
    var Proc = $resource('procedimientos/:procedimientoId', {
        procedimientoId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
    return Proc;
}])
.service('cargarArchivo', ['$http', '$q', function ($http, $q) {
    this.uploadFileToUrl = function(files, uploadUrl){
        var deferred = $q.defer();
        var fd = new FormData();
        var tipo;
        if (files.length > 0) {
            for (var i = files.length - 1; i >= 0; i--) {
                tipo = files[i].type.substring(0,files[i].type.indexOf('/'));
                if (tipo ==='' || tipo !== 'image' || tipo !== 'video') {
                    tipo = 'adjunto'
                };
                fd.append(tipo, files[i]);
            }
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
        }
        return deferred.promise;
    };
}])
.service('modalService', ['$modal',
    function ($modal) {

        var modalDefaults = {
            backdrop: true,
            keyboard: true,
            modalFade: true,
            templateUrl: '/views/modal.html'
        };

        var modalOptions = {
            closeButtonText: 'Cerrar',
            actionButtonText: 'Aceptar',
            headerText: 'Continuar?',
            bodyText: 'Continuar con la ejecucion?'
        };

        this.showModal = function (customModalDefaults, customModalOptions) {
            if (!customModalDefaults) customModalDefaults = {};
            customModalDefaults.backdrop = 'static';
            return this.show(customModalDefaults, customModalOptions);
        };

        this.show = function (customModalDefaults, customModalOptions) {
            //Create temp objects to work with since we're in a singleton service
            var tempModalDefaults = {};
            var tempModalOptions = {};

            //Map angular-ui modal custom defaults to modal defaults defined in service
            angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

            //Map modal.html $scope custom properties to defaults defined in service
            angular.extend(tempModalOptions, modalOptions, customModalOptions);

            if (!tempModalDefaults.controller) {
                tempModalDefaults.controller = function ($scope, $modalInstance) {
                    $scope.modalOptions = tempModalOptions;
                    $scope.modalOptions.ok = function (result) {
                        $modalInstance.close(result);
                    };
                    $scope.modalOptions.close = function (/*result*/) {
                        $modalInstance.dismiss('cancel');
                    };
                };
            }

            return $modal.open(tempModalDefaults).result;
        };
    }
])
.service('modalCorreoService', ['$modal',
    function ($modal) {

        var modalDefaults = {
            backdrop: true,
            keyboard: true,
            modalFade: true,
            templateUrl: '/views/procedimientos/enviarCorreo.html'
        };

        var modalOptions = {
            closeButtonText: 'Cerrar',
            actionButtonText: 'Aceptar',
            headerText: 'Continuar?',
            bodyText: 'Continuar con la ejecucion?'
        };

        this.showModal = function (customModalDefaults, customModalOptions) {
            if (!customModalDefaults) customModalDefaults = {};
            customModalDefaults.backdrop = 'static';
            return this.show(customModalDefaults, customModalOptions);
        };

        this.show = function (customModalDefaults, customModalOptions) {
            //Create temp objects to work with since we're in a singleton service
            var tempModalDefaults = {};
            var tempModalOptions = {};

            //Map angular-ui modal custom defaults to modal defaults defined in service
            angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

            //Map modal.html $scope custom properties to defaults defined in service
            angular.extend(tempModalOptions, modalOptions, customModalOptions);

            if (!tempModalDefaults.controller) {
                tempModalDefaults.controller = function ($scope, $modalInstance) {
                    $scope.modalOptions = tempModalOptions;
                    $scope.modalOptions.ok = function (result) {
                        $modalInstance.close(result);
                    };
                    $scope.modalOptions.close = function (/*result*/) {
                        $modalInstance.dismiss('cancel');
                    };
                };
            }

            return $modal.open(tempModalDefaults).result;
        };
    }
]);
