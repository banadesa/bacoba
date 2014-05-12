'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', '$location',
 '$http', 'Global', 'Usuarios',
 function ($scope, $location, $http, Global, Usuarios) {
    $scope.global = Global;
    $scope.find = function() {
        var limite = 4;
        $scope.noVistos = false;
        $scope.busqueda = false;
        //busca los procedimientos con mas visitas
        $http.get('procedimientos/', {
            params: {
                sort: 'visitas',
                tipoSort: -1,
                limite: limite
            }
        }).then(function(res){
            $scope.procedimientosVisitas = res.data;
            for (var i = $scope.procedimientosVisitas.length - 1; i >= 0; i--) {
                $scope.procedimientosVisitas[i] = $scope.calculaRating($scope.procedimientosVisitas[i]);
            }
        });

        //busca los ultimos procedimientos creados
        $http.get('procedimientos/', {
            params: {
                sort: 'created',
                tipoSort: -1,
                limite: limite
            }
        }).then(function(res){
            $scope.procedimientosUltimosCreados = res.data;
            for (var i = $scope.procedimientosUltimosCreados.length - 1; i >= 0; i--) {
                $scope.procedimientosUltimosCreados[i] = $scope.calculaRating($scope.procedimientosUltimosCreados[i]);
            }
        });
        //Vistos Recientemente
        Usuarios.get({
            userId: $scope.global.user._id
        }, function(usuario) {
            $http.get('procedimientos/', {
                params: {
                    campoQ: '_id',
                    valorQ: usuario.ultimosProcedimientos.splice(0,limite),
                    limite: limite
                }
            }).then(function(res){
                $scope.procedimientosUltimosVistos = res.data;
                for (var i = $scope.procedimientosUltimosVistos.length - 1; i >= 0; i--) {
                    $scope.procedimientosUltimosVistos[i] = $scope.calculaRating($scope.procedimientosUltimosVistos[i]);
                }
                if ($scope.procedimientosUltimosVistos.length === 0) {
                    $scope.noVistos = true;
                }
            });
        });

        $http.get('categorias/',{
            params: {
                campoQ: '_id',
                valorQ: $scope.global.user.categorias,
                sort: 'name'
            }
        }).then(function(res){
            var cantProcsTodos = 0;
            $scope.categoriasUsuario = res.data
            for (var w = $scope.categoriasUsuario.length - 1; w >= 0; w--) {
                cantProcsTodos = cantProcsTodos + $scope.categoriasUsuario[w].cantProcs;
                $scope.categoriasUsuario[w].actual = '';
            };
            $scope.categoriasUsuario.unshift({_id: 'todos', name: 'Todos', cantProcs: cantProcsTodos, actual: ''});
        })
    };

    $scope.filtroCategoria = function (categoria) {
        return categoria.cantProcs > 0;
    };

    /**
     * Muestra los procedimientos segun la categoria
     *@param {string} id id de la categoria a mostrar
     *@param {string} nombre nombre de la categoria a mostrar
     *@param {number} indice indice de la categoria seleccionada
     */
     $scope.mostrarProcs = function(id, nombre,indice) {
        var params = {};
        for (var a = 0; a < $scope.categoriasUsuario.length; a++) {
            if ($scope.categoriasUsuario[a].cantProcs === 0) {
                indice = indice +1
            }
            $scope.categoriasUsuario[a].actual = '';
            if (a === indice) {
                $scope.categoriasUsuario[a].actual = 'nav-lateral-actual';
            }
        }
        if (id !== 'todos') {
            params = {
                limite: 100,
                sort: 'visitas',
                tipoSort: '-1',
                campoQ: 'categorias',
                valorQ: id
            }
        } else {
            params = {
                limite: 100,
                sort: 'created',
                tipoSort: '-1'
            }
        }
        $http.get('/procedimientos', {
            params: params
        }).then(function(res){
            $scope.procedimientosCategoria = res.data;
            for (var i = $scope.procedimientosCategoria.length - 1; i >= 0; i--) {
                $scope.procedimientosCategoria[i] = $scope.calculaRating($scope.procedimientosCategoria[i]);
            }
            $scope.busqueda = true;
            $scope.nombreCategoria = nombre;
        })
     };

    /**
     *va al procedimiento
     *@param {string} id del procedimiento al que se quiere ir
     */
    $scope.irProcedimiento = function(id) {
        $location.path('/procedimientos/' + id);
    };

    /**
     *Calcula el rating y suma la cantidad de votos  de un procedimiento
     */
    $scope.calculaRating = function(procedimiento) {
        procedimiento.totalVotos = procedimiento.rating.uno +
            procedimiento.rating.dos +
            procedimiento.rating.tres +
            procedimiento.rating.cuatro +
            procedimiento.rating.cinco;
            if (procedimiento.totalVotos > 0) {
                procedimiento.rate = Math.round(((procedimiento.rating.uno * 1) +
                    (procedimiento.rating.dos * 2) +
                    (procedimiento.rating.tres * 3) +
                    (procedimiento.rating.cinco * 5) +
                    (procedimiento.rating.cuatro * 4)) /
                    (procedimiento.totalVotos));
            } else {
                procedimiento.rate = 0;
            }
        return procedimiento;
    };
}]);
