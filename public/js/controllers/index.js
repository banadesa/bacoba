'use strict';

angular.module('mean.index').controller('IndexController', ['$scope', '$location',
 '$http', '$routeParams', 'Global', 'Usuarios',
 function ($scope, $location, $http, $routeParams, Global, Usuarios) {
    $scope.global = Global;
    $scope.find = function() {
        var limite = 4;
        $scope.noVistos = false;
        $scope.busqueda = false;
        $scope.filtro = {};
        //Busca las categorias del usuario
        $http.get('categorias/',{
            params: {
                campoQ: '_id',
                valorQ: $scope.global.user.categorias,
                sort: 'padre',
                nav: true
            }
        }).then(function(res){
            $scope.categoriasUsuario = res.data;
            var tienePadre = false;
            var loop = 0;
            var categoriasUsuarioOrdenado = [];
            var cantHijosSuperior = 1;
            var divisor;
            //recorro todos el array y voy sacando segun ya no tengan el padre en el array
            while ($scope.categoriasUsuario.length > 0) {
                //Busco categorias sin papa en el array
                for (var i = $scope.categoriasUsuario.length - 1; i >= 0; i--) {
                    if ($scope.categoriasUsuario[loop].padre) {
                        if ($scope.categoriasUsuario[i]._id === $scope.categoriasUsuario[loop].padre._id) {
                            tienePadre = true;
                            break;
                        }
                    }
                }
                //si no tiene padre, no cambio la variable tiene padre a True
                if (!tienePadre) {
                    //Agrego al nuevo array la categoria sin padre
                    categoriasUsuarioOrdenado.push($scope.categoriasUsuario[loop]);
                    //Saco la categoria agregada del array y reinicio el loop
                    $scope.categoriasUsuario.splice(loop,1);
                    loop=0;
                    //busco el tamaño del array ya que el ultimo elemento que agregue es el que quiero evaluar
                    var pos = categoriasUsuarioOrdenado.length -1;
                    if (categoriasUsuarioOrdenado.length < 2) {
                            categoriasUsuarioOrdenado[pos].orden = cantHijosSuperior;
                            cantHijosSuperior++;
                    }
                    //Busco en el nuevo array si el padre del elemento que acabo de agregar esta incluido
                    for (var r = 0 ; r <= categoriasUsuarioOrdenado.length - 2; r++) {
                        //si el nuevo elemento tiene padre aumento la cantidad de hijos que tiene el padre y cambio
                        //su nivel
                        if (categoriasUsuarioOrdenado[pos].padre) {
                            //Si encuentro al papa y este tiene hijos, le sumo a la cantidad de hijos sino le asigno 1
                            if (categoriasUsuarioOrdenado[r]._id === categoriasUsuarioOrdenado[pos].padre._id) {
                                if (categoriasUsuarioOrdenado[r].cantHijos) {
                                    categoriasUsuarioOrdenado[r].cantHijos = categoriasUsuarioOrdenado[r].cantHijos +1 ;
                                } else {
                                    categoriasUsuarioOrdenado[r].cantHijos = 1;
                                }
                                categoriasUsuarioOrdenado[pos].orden = categoriasUsuarioOrdenado[r].orden + '.' + categoriasUsuarioOrdenado[r].cantHijos;
                                categoriasUsuarioOrdenado[pos].nivel = categoriasUsuarioOrdenado[r].nivel + 1;
                                categoriasUsuarioOrdenado[r].cantProcs = categoriasUsuarioOrdenado[r].cantProcs + categoriasUsuarioOrdenado[pos].cantProcs;
                                break;
                            }
                        }
                        if (r === categoriasUsuarioOrdenado.length - 2) {
                            categoriasUsuarioOrdenado[pos].orden = cantHijosSuperior.toString();
                            cantHijosSuperior++;
                        }
                    }
                    var aArray = categoriasUsuarioOrdenado[pos].orden.toString().split('.');
                    //creo el nuevo elemento de numeroPasoDivido en el objeto
                    categoriasUsuarioOrdenado[pos].numeroPasoDivido = 0;
                    divisor= 1;
                    for (var t = 0; t < aArray.length; t++) {
                        categoriasUsuarioOrdenado[pos].numeroPasoDivido = categoriasUsuarioOrdenado[pos].numeroPasoDivido +
                            (aArray[t] * divisor);
                        divisor = divisor / 100;
                    }
                } else {
                    tienePadre= false;
                    loop++;
                }
            }
            //Ordeno las categorias por el orden
            categoriasUsuarioOrdenado.sort(function(a,b) {
                return a.numeroPasoDivido - b.numeroPasoDivido;
            });
            $scope.categoriasUsuario = categoriasUsuarioOrdenado;

            if ($routeParams.filtro) {
                $scope.filtro.nombre = $routeParams.filtro;
            }
            if ($routeParams.categoria) {
                $scope.mostrarProcs($routeParams.categoria);
            } else {
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
            }
        });
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
     $scope.mostrarProcs = function(id, nombre,indice, orden) {
        //si solo manda el id entonces la busqueda es por nombre
        //asi que busco los otros datos
        var cateArray=[];
        if (!nombre) {
            nombre= id;
            id = '';
            indice = 0;
            for (var e = 0; e < $scope.categoriasUsuario.length; e++) {
                if ($scope.categoriasUsuario[e].cantProcs !== 0) {
                    if ($scope.categoriasUsuario[e].name === nombre) {
                        id = $scope.categoriasUsuario[e]._id;
                        orden = $scope.categoriasUsuario[e].orden;
                        break;
                    }
                    indice++;
                }
            }
        } else {
            $scope.filtro.nombre = '';
            $location.search('categoria', nombre);
        }
        if (!id) {
                $location.path('/#!/');
        } else {
            for (var g = $scope.categoriasUsuario.length - 1; g >= 0; g--) {
                 console.log(orden.length,orden);
                if (orden === $scope.categoriasUsuario[g].orden.toString().substr(0,orden.length)) {
                    cateArray.push($scope.categoriasUsuario[g]._id);
                }
            }
            var params = {};
            for (var a = 0; a < $scope.categoriasUsuario.length; a++) {
                if ($scope.categoriasUsuario[a].cantProcs === 0) {
                    indice = indice +1;
                }
                $scope.categoriasUsuario[a].actual = 'nav-lateral-no-actual';
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
                    valorQ: cateArray
                };
            } else {
                params = {
                    limite: 100,
                    sort: 'created',
                    tipoSort: '-1'
                };
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
            });
        }
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

    /**
     * Agrega un parametro a la Url
     */
     $scope.AgregarParametroUrl = function(parametro, nombre) {
        $location.search(parametro, nombre);
     };
}]);
