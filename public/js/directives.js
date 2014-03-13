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
    .directive('mostrarComentarios', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/procedimientos/mostrarComentarios.html'
        };
    })
    .directive('mostrarProcedimiento', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/procedimientos/mostrarProcedimiento.html'
        };
    })
    .directive('mostrarPasos', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/procedimientos/mostrarPasos.html'
        };
    })
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
                    console.log('qui toy');
                    console.log(value);
                    if (value) {
                        img.src='/contenido/'+ scope.procedimiento._id + '/imagenes/thumbs/' + value;
                        img.onload = function(){
                            console.log('this');
                            console.log(this);
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
                    img.src='/contenido/'+ scope.procedimiento._id + '/imagenes/' + value;
                }
            }
        };
    }) ;

