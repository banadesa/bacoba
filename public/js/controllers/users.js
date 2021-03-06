'use strict';

angular.module('mean.usuarios').controller('UsersController', ['$scope', '$routeParams', '$location', '$http',
 '$window', 'Global', 'AppAlert', 'Categorias', 'Usuarios', 'modalService',
 function ($scope, $routeParams, $location, $http, $window, Global, AppAlert, Categorias, Usuarios, modalService) {
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
            if (data.message) {
                AppAlert.add('danger',data.message);
            } else {
                $scope.nombre = '';
                $scope.email = '';
                $scope.usuario = '';
                $scope.clave = '';
                $scope.administracion = false;
                $scope.seguridad = false;
                AppAlert.add('success','¡Se creo el usuario ' + data.usuario + ' exitosamente!');
                $scope.irAtras();
            }
        })
        .error(function(data) {
            AppAlert.add('danger',data);
        });
    };

    /**
     *Elimina la user
     *@param {object} user Usuario que se desea eliminar
     *
     */
    $scope.remove = function(usuario) {
        var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Eliminar Usuario',
            headerText: '¿Eliminar el usuario '+ usuario.username + '?',
            bodyText: 'Esta seguro que desea eliminar este usuario?'
        };

        modalService.showModal({}, modalOptions).then(function (/*result*/) {
            if (usuario) {
                usuario.$remove();
                for (var i in $scope.usuarios) {
                    if ($scope.usuarios[i] === usuario) {
                        $scope.usuarios.splice(i, 1);
                        AppAlert.add('success','¡Se elimino el usuario ' + usuario.username + ' exitosamente!');
                    }
                }
            }
        });
    };

    $scope.update = function() {
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
        $http({method:'PUT', url:'users/'+ usuario._id, data: usuario})
        .success(function(data) {
            if (data.success) {
                $scope.irAtras();
                AppAlert.add('success','¡Se actualizo el usuario ' + data.usuario.username + ' exitosamente! ' + data.message);
            } else {
                AppAlert.add('danger','Error al actualizar el usuario ' + data.usuario.username + ' ya que ' + data.message);
            }
        })
        .error(function(data) {
             AppAlert.add('danger','Error al actualizar el usuario ya que ' + data);
        });
    };

    $scope.find = function() {
        $scope.busqueda = {};
        Usuarios.query(function(usuarios) {
            $scope.usuarios = usuarios;
            if ($routeParams.nombre) {
                $scope.busqueda.name = $routeParams.nombre;
            }
            if ($routeParams.usuario) {
                $scope.busqueda.username = $routeParams.usuario;
            }
            if ($routeParams.correo) {
                $scope.busqueda.email = $routeParams.correo;
            }
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

    /*
     *Busca todas las cateogrias y las mete a un arreglo
     */
    $scope.popularCategorias = function(query) {
        Categorias.query(query, function (categorias) {
            $scope.categorias = categorias;
        });
    };

    /**
     * Agrega un parametro a la Url
     */
     $scope.AgregarParametroUrl = function(parametro, nombre) {
        if (nombre !=='') {
            $location.search(parametro, nombre);
        } else {
            $location.search(parametro, null);
        }
     };

     /*
     *va a la pagina anterior
     */
    $scope.irAtras = function() {
        $window.history.back();
    };


    /**
     *Redirige a la pagina que muestra el procedimiento y los pasos
     @param {string} url pagina a la que se ira
     */
    $scope.ir = function(url) {
        $location.path(url);
    };

    /**
    *
    */
    $scope.limpiarBusqueda = function() {
        $scope.busqueda.name='';
        $scope.busqueda.username='';
        $scope.busqueda.email='';
        $location.search('nombre',null);
        $location.search('descripcion',null);
        $location.search('padre',null);
    };

    /*
     *
     */
    $scope.cambiarClave = function() {
        if ($scope.clave !== $scope.confirmacion) {
            AppAlert.add('danger','La contraseña no coincide con la confirmacion');
        } else {
            var url = 'users/' + $routeParams.userId + '/cambiarclave';
            $http.post(url, {id: $routeParams.userId, nuevaClave : $scope.clave})
            .then(function() {
                $scope.irAtras();
            });
        }
    };

}]);
