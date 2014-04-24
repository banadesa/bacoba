'use strict';

angular.module('mean.users').controller('UsersController', ['$scope', '$routeParams', '$location', 'Global', 'Users', 'modalService', function ($scope, $routeParams, $location, Global, Users, modalService) {
    $scope.global = Global;

    $scope.create = function() {
        var user = new Users({
            name: this.name,
            description: this.description,
            padre: this.user.padre
        });
        user.$save(function(/*response*/) {
            $location.path('users/');
        });

        this.name = '';
        this.description = '';
        this.users = '';
        this.padre = '';
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
    $scope.popularUsers = function(query) {
        Users.query(query, function (users) {
            $scope.users = users;
        });
    };
}]);
