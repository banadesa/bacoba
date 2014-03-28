'use strict';

angular.module('mean.directives', [])
    .directive('agregarPasos', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/procedimientos/agregarPasos.html'
        };
    })
    .directive('mostrarPasosEdit', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/procedimientos/mostrarPasosEdit.html'
        };
    })
    .directive('agregarComentario', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/procedimientos/agregarComentario.html'
        };
    })
    .directive('mostrarProcedimiento', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/procedimientos/mostrarProcedimiento.html'
        };
    })
    .directive('mostrarComentarios', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/procedimientos/mostrarComentarios.html'
        };
    })
    .directive('mostrarPasos', ['$filter', function() {
        return {
            restrict: 'E',
            priority: 451,
            scope: {numpaso: '@', procid: '@'},
            templateUrl: 'views/procedimientos/mostrarPasos.html',
            controller : function($scope, $compile, $http, Procedimientos){
                /**
                 *Se va al elemento deseado segun el id
                 *@param {string} elemento al que se desea ir
                 */
                $scope.irElemento = function(elemento) {
                    //var pasoId = '#paso' + elemento;
                    $('html, body').animate({
                        scrollTop: $(elemento).offset().top
                    });
                };
                /**
                 *Muestra un procedimiento dentro de un paso
                 *@param {string} _id _id del procedimiento que se cargara
                 *@param {number} paso numero de paso al que pertence el procedimiento
                 *@param {number} indice indice del paso
                 *
                 */
                $scope.mostrarProcedimiento = function(_id, paso, indice) {
                    var subpaso = '#'+ $scope.subpaso + paso;
                    if ($scope.btnMostrarProc[indice].visible) {
                        $scope.btnMostrarProc[indice].visible = false;
                        $scope.btnMostrarProc[indice].btnMsj = 'Ocultar Detalle';
                        if (angular.element(subpaso).children().length === 0) {
                            var procs = angular.element('<mostrar_pasos numpaso="' + $scope.numpaso + paso + '" procid="' + _id + '" id="procs' + paso + '"></mostrar_pasos>');
                            var el = $compile( procs )( $scope );
                            angular.element(subpaso).append(procs);
                            $scope.insertHere = el;
                        } else {
                            $scope.btnMostrarProc[indice].verDiv = true;
                        }
                    } else {
                        $scope.btnMostrarProc[indice].visible = true;
                        $scope.btnMostrarProc[indice].btnMsj = 'Ver Detalle';
                        $scope.btnMostrarProc[indice].verDiv = false;
                    }
                };
                /**
                 *Busca los pasos de un procedimiento y los ordena de menor a
                 *mayor
                 *
                 *@param {string} procid _id del procedimiento
                 *
                 */
                $scope.buscarPasos = function(procid) {
                    Procedimientos.get({
                          procedimientoId: procid
                        })
                        .$promise.then(function(value){
                            $scope.pasosd = value.pasos;
                            $scope.pasosd.sort(function(a,b) {
                                var n = b.actual - a.actual;
                                if (n !== 0) {
                                    return n;
                                }
                                n = parseInt(a.numeroPaso) - parseInt(b.numeroPaso);
                                if (n !== 0) {
                                    return n;
                                }
                                return a.version - b.version;
                            });
                            $scope.btnMostrarProc = [];
                            angular.forEach($scope.pasosd,function(value) {
                                if (value.procedimiento) {
                                    $scope.btnMostrarProc.push({procedimientoId: value.procedimiento, btnMsj: 'Ver Detalle', visible: true, verDiv : true});
                                }
                                else $scope.btnMostrarProc.push({procedimientoId: null, btnMsj: '', visible: false});
                            });
                        })
                };
            },
            link: function(scope, element, attrs, controller) {
                if (attrs.numpaso === '0') {
                    attrs.numpaso = '';
                } else {
                    attrs.numpaso = attrs.numpaso + '.';
                }
                scope.subpaso = 'subpaso' + attrs.numpaso.replace(/\./g,'');
                scope.buscarPasos(scope.procid);
            }
        };
    }])
    .directive('fileInput', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileInput);
                var modelSetter = model.assign;
                element.bind('change', function(){
                    scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }])
    .directive('videoPaso', function() {
        return {
            template: '<input value=\"{{videoPasoFake}}\" id=\"videoPaso\" cols=\"30\" placeholder=\"Video\" class=\"form-control\">',
            restrict: 'E',
            link: function(scope) {
                scope.$watch('fileVideo', function(value) {
                    if (value) {
                        scope.videoPasoFake = value.name;
                    }
                });
            }
        };
    })
    .directive('ngThumb', function() {
        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function(scope, element, attributes) {
                scope.$watch('fileImagen', function(value){

                    var onLoadFile = function(event) {
                        var img = new Image();
                        img.onload = onLoadImage;
                        img.src = event.target.result;
                    };

                    var onLoadImage = function() {
                        var width = params.width || this.width / this.height * params.height;
                        var height = params.height || this.height / this.width * params.width;
                        canvas.attr({ width: width, height: height });
                        canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                    };

                    scope.formaPaso.$pristine = false;
                    var params = scope.$eval(attributes.ngThumb);
                    var canvas = element.find('canvas');
                    if (!value) {
                        canvas[0].getContext('2d').clearRect(0, 0, 300, 300);
                        canvas[0].getContext('2d').fillStyle = '#999999';
                        canvas[0].getContext('2d').font = 'italic 15px sans-serif Helvetica';
                        canvas[0].getContext('2d').fillText('Seleccione una Imagen', 70, 80);
                    } else {
                        var reader = new FileReader();
                        reader.onload = onLoadFile;
                        reader.readAsDataURL(scope.fileImagen);
                    }
                });
                scope.$watch('imagenPaso', function(value) {
                    var canvas = element.find('canvas');
                    var img = new Image();
                    if (value) {
                        img.src='/contenido/'+ scope.procedimiento._id + '/imagenes/thumbs/' + value;
                        img.onload = function(){
                            canvas[0].getContext('2d').drawImage(this,0,0);
                        };
                    } else {
                        canvas[0].getContext('2d').clearRect(0, 0, 300, 300);
                        canvas[0].getContext('2d').fillStyle = '#999999';
                        canvas[0].getContext('2d').font = 'italic 15px sans-serif Helvetica';
                        canvas[0].getContext('2d').fillText('Seleccione una Imagen', 70, 80);
                    }
                });
            }
        };
    })
    .directive('baImagen',function() {
        return {
            restrict: 'E',
            template: '<canvas/>',
            link: function(scope, element, attributes) {
                var value = attributes.value;
                var canvas = element.find('canvas');
                var img = new Image();
                var width, height;
                var porcentaje; //porcentaje que se necesita multiplicar para que quede con 1000 de width
                if (value) {
                    img.onload = function(){
                        //Si el width es mayor que
                        if (this.width > 1000) {
                            porcentaje = (1 - ((this.width - 1000)/this.width));
                            width = porcentaje*this.width;
                            height = porcentaje*this.height;
                        } else {
                            width = this.width;
                            height = this.height;
                        }

                        canvas.attr({ width: width, height: height });
                        canvas[0].getContext('2d').drawImage(this,0,0,width,height);
                    };
                    img.src='/contenido/'+ scope.procid + '/imagenes/' + value;
                }
            }
        };
    });

