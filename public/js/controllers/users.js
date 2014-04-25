'use strict';

angular.module('mean.users').controller('UsersController', ['$scope', '$routeParams', '$location', '$http',
 'Global', 'Categorias', 'modalService',
 function ($scope, $routeParams, $location, $http, Global, Categorias, modalService) {
    $scope.global = Global;

    $scope.create = function() {
        var user = {
            name: this.nombre,
            email: this.email,
            username: this.usuario,
            password: this.clave,
            administracion: this.administracion,
            seguridad: this.seguridad,
            categorias: []
        };
        $scope.alerts = [];
        user.categorias = [];
        for (var i = $scope.categoriaSel.length - 1; i >= 0; i--) {
            user.categorias.push($scope.categoriaSel[i]);
        }
        $http.post('/users',user)
        .success(function(data) {
            console.log(data);
            console.log(data.message);
            if (data.message) {
                $scope.agregarAlerta('danger',data.message);
            } else {
                $scope.nombre = '';
                $scope.email = '';
                $scope.usuario = '';
                $scope.clave = '';
                $scope.administracion = false;
                $scope.seguridad = false;
                $location.path('/');
            }
        })
        .error(function(data) {
            $scope.agregarAlerta('danger',data);
        });
    };

    /**
     *Elimina la user
     *@param {object} user Categoria que se desea eliminar
     *
     */
    $scope.remove = function(user) {
        var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Eliminar Categoria',
            headerText: '¿Eliminar el usuario '+ user.name + '?',
            bodyText: 'Esta seguro que desea eliminar este usuario?'
        };

        modalService.showModal({}, modalOptions).then(function (/*result*/) {
            if (user) {
                user.$remove();
                for (var i in $scope.users) {
                    if ($scope.users[i] === user) {
                        $scope.users.splice(i, 1);
                    }
                }
            }
        });
    };

    $scope.update = function() {
        var user = $scope.user;
        if (!user.updated) {
            user.updated = [];
        }
        user.updated.push(new Date().getTime());

        user.$update(function() {
            $location.path('users/' + user._id );
        });
    };

    $scope.find = function() {
        Users.query(function(users) {
            $scope.users = users;
        });
    };

    $scope.findOne = function() {
        Users.get({
            userId: $routeParams.userId
        }, function(user) {
            $scope.user = user;
        });
    };

    /**
     *Busca todas las cateogrias y las mete a un arreglo
     */
    $scope.popularCategorias = function(query) {
        Categorias.query(query, function (categorias) {
            $scope.categorias = categorias;
        });
    };

    /**
     *Agrega alertas que se mostraran en pantalla
     *@param {string} type  tipo alerta **danger rojo **success verde
     *@param {string} msg mensaje que se mostrara
     */
    $scope.agregarAlerta = function(type,msg) {
        $scope.alerts.push({type: type, msg: msg});
    };

    /**
     *Cierre una alerta
     *@param {number} posicion en el array
     */
    $scope.cerrarAlerta = function(index) {
        $scope.alerts.splice(index,1);
    };

}]);
