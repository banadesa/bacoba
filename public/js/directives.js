'use strict';

angular.module('mean.directives', [])
    .directive('agregarPasos', function() {
        return {
            restrict: 'E',
            templateUrl: 'views/procedimientos/agregarPasos.html'
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
    }])    .directive('ngThumb', ['$window', function($window) {

        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function(scope, element, attributes) {
                scope.$watch('fileImagen', function(value){
                    var params = scope.$eval(attributes.ngThumb);
                    var canvas = element.find('canvas');
                    var reader = new FileReader();
                    reader.onload = onLoadFile;
                    reader.readAsDataURL(scope.fileImagen);

                    function onLoadFile(event) {
                        var img = new Image();
                        img.onload = onLoadImage;
                        img.src = event.target.result;

                    }

                    function onLoadImage() {
                        var width = params.width || this.width / this.height * params.height;
                        var height = params.height || this.height / this.width * params.width;
                        canvas.attr({ width: width, height: height });
                        canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                    }
                    if (!value) {
                        canvas[0].getContext('2d').clearRect(0, 0, 300, 300);
                        canvas[0].getContext('2d').fillStyle = "#999999";
                        canvas[0].getContext('2d').font = "italic 15px sans-serif Helvetica";
                        canvas[0].getContext('2d').fillText("Seleccione una Imagen", 70, 80);
                    }
                });
            }
        };
    }]);

