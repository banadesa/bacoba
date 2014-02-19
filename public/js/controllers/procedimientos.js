'use strict';

angular.module('mean.procedimientos').
controller('ProcedimientosController', ['$scope', '$routeParams', '$location', 'Global', 'Procedimientos','Categorias','cargarArchivo',
   function ($scope, $routeParams, $location, Global, Procedimientos, Categorias, cargarArchivo) {
    $scope.global = Global;

    $scope.popularCategorias = function(query) {
        Categorias.query(query, function (categorias) {
            $scope.categorias = categorias;
        });
    };

    $scope.create = function() {
        var procedimiento = new Procedimientos({
            nombre: this.nombre,
            descripcion: this.descripcion,
            categorias: []
        });
        procedimiento.categorias = [];
        for (var i = $scope.categoriaSel.length - 1; i >= 0; i--) {
            procedimiento.categorias.push($scope.categoriaSel[i]);
        }

        procedimiento.$save(function(response) {
            $location.path('procedimientos/pasos/' + response._id);
        });

        this.nombre = '';
        this.descripcion = '';
        this.categorias = '';
    };

    $scope.remove = function(procedimiento) {
        if (procedimiento) {
            procedimiento.$remove();

            for (var i in $scope.procedimientos) {
                if ($scope.procedimientos[i] === procedimiento) {
                    $scope.procedimientos.splice(i, 1);
                }
            }
        }
        else {
            $scope.procedimiento.$remove();
            $location.path('procedimientos');
        }
    };

    /**
     *Resuelve el paso ya sea para editar o agregarlo
     *@Param content {json} Contenido de respuesta en la carga de imagen
     */
    $scope.manejarPaso = function () {

        var files = [];
        var cont = 0;
        var content;
        if ($scope.fileImagen) {
            files[cont] = $scope.fileImagen;
            cont++;
        };
        if ($scope.fileVideo) {
            files[cont] = $scope.fileVideo;
        };

        var uploadUrl = '/procedimientos/upload?procedimientoId='
            + $scope.procedimiento._id

        cargarArchivo
            .uploadFileToUrl(files, uploadUrl)
            .then(function(data) {
                /*Asigna la imagen guardada en el servidor*/
                if (data.imagenUrl) {
                    $scope.imagenPaso = data.imagenUrl
                };
                /*Asigna el video guardado en el servidor*/
                if (data.videoUrl) {
                    $scope.videoPaso = data.videoUrl
                };

                if ($scope.edicionPaso) {
                   $scope.editarPaso();
                } else {
                    $scope.agregarPaso();
                }
                $scope.reiniciarForma();
            });
    };

    $scope.editarPaso = function() {
        var procedimiento = $scope.procedimiento;
        if (!procedimiento.updated) {
            procedimiento.updated = [];
        }

        procedimiento.updated.push(new Date().getTime());

        procedimiento.pasos[$scope.indexPaso].descripcion = this.descripcionPaso;
        procedimiento.pasos[$scope.indexPaso].imagen = this.imagenPaso;
        procedimiento.pasos[$scope.indexPaso].video = this.videoPaso;
        procedimiento.$update();

        $scope.descripcionPaso = '';
        $scope.numeroPaso = '';
        $scope.imagenPaso = '';
        $scope.videoPaso = '';
        $scope.indexPaso = -1;
        $scope.edicionPaso = false;
    };

    $scope.agregarPaso = function() {

        var procedimiento = $scope.procedimiento;

        if (procedimiento.updated) {
            procedimiento.updated = [];
        }

        procedimiento.updated.push(new Date().getTime());
        procedimiento.pasos.push({
            'numeroPaso': $scope.numeroPaso,
            'descripcion': $scope.descripcionPaso,
            'imagen': $scope.imagenPaso,
            'video': $scope.videoPaso
        });

        /*Ordena los pasos */
        procedimiento.pasos.sort(function(a,b) {
            return parseInt(b.numeroPaso) - parseInt(a.numeroPaso);
        });

        procedimiento.$update();

        this.descripcionPaso = '';
        this.numeroPaso = '';
        this.imagenPaso = '';
        this.videoPaso = '';
        $scope.focusElement('descripcionPaso');
        $scope.edicionPaso = false;
        $scope.indexPaso = -1;

        $scope.ultimoPaso();
    };


    $scope.update = function() {
        var procedimiento = $scope.procedimiento;
        if (!procedimiento.updated) {
            procedimiento.updated = [];
        }
        procedimiento.updated.push(new Date().getTime());

        procedimiento.categorias = [];
        for (var i = $scope.categoriaSel.length - 1; i >= 0; i--) {
            procedimiento.categorias.push($scope.categoriaSel[i]);
        }

        procedimiento.$update(function() {
            $location.path('procedimientos/' + procedimiento._id );
        });
    };

    $scope.find = function() {
        Procedimientos.query(function(procedimientos) {
            $scope.procedimientos = procedimientos;
        });
    };

    $scope.findOne = function() {
        Procedimientos.get({
            procedimientoId: $routeParams.procedimientoId
        }, function(procedimiento) {
            $scope.procedimiento = procedimiento;
            /* Ordena los pasos en orden Ascendente */
            $scope.procedimiento.pasos.sort(function(a,b) {
                return parseInt(b.numeroPaso) - parseInt(a.numeroPaso);
            });

            $scope.ultimoPaso();

            $scope.edicionPaso = false;
            $scope.indexPaso = -1;
            $scope.categoriaSel = [];
            for (var i = $scope.procedimiento.categorias.length - 1; i >= 0; i--) {
                $scope.categoriaSel.push($scope.procedimiento.categorias[i]._id);
            }
            $scope.rutaUpload='/procedimientos/upload?procedimientoId='+ $scope.procedimiento._id
        });
    };

    /**
     * Pone el foco en un elemento segun su id
     * @Param {string} elemento Elemento que se desea poner el foco
     */
    $scope.focusElement = function(elemento) {
        $('html, body').animate({ scrollTop: 0 }, 'fast');
        document.getElementById(elemento).focus();
    };

    /**
     * Elimina un paso del procedimiento
     *
     * @Param {number} id numero de indice en la tabla mostrarPasos
     */
    $scope.eliminarPaso = function(id) {
        var pasoBorrar = $scope.procedimiento.pasos[id].numeroPaso;
        $scope.cambiarOrdenPasos(id,'eliminar');
        $scope.procedimiento.pasos.splice(id,1);
        var procedimiento = $scope.procedimiento;
        if (!procedimiento.updated) {
            procedimiento.updated = [];
        }
        procedimiento.updated.push(new Date().getTime());
        procedimiento.$update();

        if (pasoBorrar === $scope.numeroPaso) {
            $scope.reiniciarForma();
        }
        else {
            $scope.ultimoPaso();
        }
    };

    /**
     * Cambia el orden de los pasos en caso que se elimine o se agregue
     * un paso intermedio
     *
     * @Param {number} id Numero de indice en la tabla mostrarPasos
     * @Param {string} accion indica si es agregar o eliminar
     */
    $scope.cambiarOrdenPasos = function(id,accion) {
        var i;
        if (accion === 'eliminar') {
            for (i =  id; i >= 0; i--) {
                $scope.procedimiento.pasos[i].numeroPaso = $scope.procedimiento.pasos[i].numeroPaso - 1;
            }
        }
        if (accion === 'agregar') {
            for (i =  id; i >= 0; i--) {
                $scope.procedimiento.pasos[i].numeroPaso = $scope.procedimiento.pasos[i].numeroPaso + 1;
            }
        }
    };

    /**
     * Envia los datos desde la tabla a los campo de edicion, previo a la
     * edicion del paso
     *
     * @Param {number} id numero del indice en la tabla de mostrarPasos
     */
    $scope.enviarDatosEditarPaso = function(id) {
        $scope.indexPaso = id;
        $scope.descripcionPaso = $scope.procedimiento.pasos[id].descripcion;
        $scope.numeroPaso = $scope.procedimiento.pasos[id].numeroPaso;
        $scope.imagenPaso = $scope.procedimiento.pasos[id].imagen;
        $scope.videoPaso = $scope.procedimiento.pasos[id].video;
        $scope.edicionPaso = true;
        $scope.focusElement('descripcionPaso');
    };

    /**
     * Preparacion previa al insertar un paso intermedio en los pasos
     *
     * @Param {number} id numero del indice en la tabla de mostrarPasos
     */
    $scope.agregarPasoIntermedio = function(id) {
        $scope.indexPaso = id;
        $scope.cambiarOrdenPasos($scope.indexPaso-1,'agregar');
        $scope.numeroPaso = $scope.procedimiento.pasos[$scope.indexPaso].numeroPaso + 1;
        $scope.focusElement('descripcionPaso');
    };

    /**
     * Determina el ultimo numero de paso del procedimiento
     */

    $scope.ultimoPaso = function() {
        if ($scope.procedimiento.pasos.length > 0) {
            $scope.numeroPaso = $scope.procedimiento.pasos[0].numeroPaso + 1;
        }
        else {
            $scope.numeroPaso = 1;
        }
    };

    /**
     *Reinicia la forma
     */
    $scope.reiniciarForma  = function() {
        document.getElementById("formaPaso").reset();
        $scope.formaPaso.$setPristine();
        $scope.edicionPaso = false;
        $scope.indexPaso;
        $scope.ultimoPaso();
        $scope.fileImagen = '';
        $scope.fileVideo = '';
        $scope.focusElement('descripcionPaso');

    }

    /**
     *Quita la ruta falsa puesta por chrome a la imagen
     */
     $scope.quitaRutaImagen = function() {
        $scope.imagenPaso = $scope.imagenPasoFile.replace('C:\\fakepath\\','');
     }

     $scope.verImagen = function() {
        leerArchivo.readAsDataUrl($scope.fileImagen, $scope)
        .then(function(result) {
              $scope.dataurl = result;
          });
     }
}]);


