'use strict';

angular.module('mean.usuarios').controller('UsersController', ['$scope', '$routeParams', '$location', '$http',
 'Global', 'Categorias', 'Usuarios', 'modalService',
 function ($scope, $routeParams, $location, $http, Global, Categorias, Usuarios, modalService) {
    $scope.global = Global;

    $scope.create = function() {
        var user = {
            name: this.name,
            email: this.email,
            username: this.username,
            password: this.password,
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
            actionButtonText: 'Eliminar Usuario',
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
        console.log('1');
        console.log($scope.usuario);
        var usuario = $scope.usuario;
        $scope.alerts = [];
        if (!usuario.updated) {
            usuario.updated = [];
        }
        usuario.updated.push(new Date().getTime());
        usuario.categorias = [];
        for (var i = $scope.categoriaSel.length - 1; i >= 0; i--) {
            usuario.categorias.push($scope.categoriaSel[i]);
        }
        usuario.$update(function(data) {
            if (data.success) {
                $location.path('users/');
            } else {
                $location.path('users/');
                console.log('despues del path');
                $scope.agregarAlerta('danger','Error al actualizar el usuario ya que ' + data.message);
            }
        });
    };

    $scope.find = function() {
        Usuarios.query(function(usuarios) {
            $scope.usuarios = usuarios;
        });
    };

    $scope.findOne = function() {
        Usuarios.get({
            userId: $routeParams.userId
        }, function(usuario) {
            $scope.usuario = usuario;
            $scope.categoriaSel = [];
            for (var i = $scope.usuario.categorias.length - 1; i >= 0; i--) {
                $scope.categoriaSel.push($scope.usuario.categorias[i]._id);
            }
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
        console.log('agregue una alerta');
        console.log($scope.alerts);
    };

    /**
     *Cierre una alerta
     *@param {number} posicion en el array
     */
    $scope.cerrarAlerta = function(index) {
        $scope.alerts.splice(index,1);
    };

}]);
