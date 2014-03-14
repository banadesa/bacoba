'use strict';

angular.module('mean.procedimientos').
controller('ProcedimientosController', ['$scope', '$rootScope', '$routeParams', '$location', '$anchorScroll', '$timeout', 'Global', 'Procedimientos','Categorias','cargarArchivo', 'modalService',
   function ($scope, $rootScope, $routeParams, $location, $anchorScroll, $timeout, Global, Procedimientos, Categorias, cargarArchivo, modalService) {
    $scope.global = Global;

    /**
     *Busca todas las cateogrias y las mete a un arreglo
     */
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
        var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Eliminar Procedimiento',
            headerText: '¿Eliminar el procedimiento "' + $scope.procedimiento.nombre + '"?',
            bodyText: 'Se eliminar el procedimiento de forma permanente'
        };

        modalService.showModal({}, modalOptions).then(function (/*result*/) {
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
        });
    };

    /**
     *Resuelve el paso ya sea para editar o agregarlo
     */
    $scope.manejarPaso = function () {

        var files = [];
        var cont = 0;
        if ($scope.fileImagen) {
            files[cont] = $scope.fileImagen;
            cont++;
        }
        if ($scope.fileVideo) {
            console.log($scope.fileVideo.name);
            files[cont] = $scope.fileVideo;
        }

        var uploadUrl = '/procedimientos/upload?procedimientoId=' + $scope.procedimiento._id;

        cargarArchivo
            .uploadFileToUrl(files, uploadUrl)
            .then(function(data) {
                /*Asigna la imagen guardada en el servidor*/
                if (data.imagenUrl) {
                    $scope.imagenPaso = data.imagenUrl;
                }
                /*Asigna el video guardado en el servidor*/
                if (data.videoUrl) {
                    $scope.videoPaso = data.videoUrl;
                }

                if ($scope.edicionPaso) {
                    $scope.editarPaso();
                } else {
                    $scope.agregarPaso();
                }
                $scope.updatePaso();
                $scope.sortPasos();
                $scope.reiniciarForma();
            });
    };
    /**
     *Edita un paso segun los cambios y aumenta el numero de version
     */
    $scope.editarPaso = function() {
        $scope.procedimiento.versionActual = $scope.versionEdita;
        if ($scope.procedimiento.pasos[$scope.indexPaso].version === $scope.versionEdita ) {
            $scope.procedimiento.pasos[$scope.indexPaso].descripcion = $scope.descripcionPaso;
            $scope.procedimiento.pasos[$scope.indexPaso].imagen = $scope.imagenPaso;
            $scope.procedimiento.pasos[$scope.indexPaso].video = $scope.videoPaso;
        } else {
            $scope.procedimiento.pasos[$scope.indexPaso].actual = false;
            $scope.procedimiento.pasos.push({
                'numeroPaso': this.numeroPaso,
                'descripcion': this.descripcionPaso,
                'imagen': this.imagenPaso,
                'video': this.videoPaso,
                'version': this.versionEdita,
                'actual': true,
                'eliminado': false
            });
        }
    };

    /**
     *Mande la instruccion de update del procedimiento al servidor
     *cuando se modifica un paso
     */
    $scope.updatePaso = function() {
        var procedimiento = $scope.procedimiento;
        if (procedimiento.updated) {
            procedimiento.updated = [];
        }

        procedimiento.updated.push(new Date().getTime());
        $scope.sortPasos();
        procedimiento.$update();
    };

    /**
     *Mande la instruccion de update del procedimiento al servidor
     *cuando agrega un comentario
     */
    $scope.updateComentario = function() {
        var procedimiento = $scope.procedimiento;
        procedimiento.$update();
    };
    /**
     *Agrega un paso al procedimiento, y reinicia la forma
     */
    $scope.agregarPaso = function() {
        if ($scope.indexPaso !== -1 ) {
            $scope.cambiarOrdenPasos($scope.indexPaso-1,'agregar');
        }
        $scope.versionEdita = $scope.versionAgruegaQuita;
        $scope.procedimiento.versionActual = $scope.versionAgruegaQuita;
        $scope.procedimiento.pasos.push({
            'numeroPaso': $scope.numeroPaso,
            'descripcion': $scope.descripcionPaso,
            'imagen': $scope.imagenPaso,
            'video': $scope.videoPaso,
            'version': $scope.versionAgruegaQuita,
            'actual': true,
            'eliminado': false
        });
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

    /**
     *Encuentra un procedimiento especifico
     *
     *@param {boolean} edita describe si la busqueda es para editar el paso
     */

    $scope.findOne = function(edita) {
        Procedimientos.get({
            procedimientoId: $routeParams.procedimientoId
        }, function(procedimiento) {
            $scope.procedimiento = procedimiento;
            $scope.sortPasos();
            $scope.numeroPaso = $scope.ultimoPaso();

            $scope.edicionPaso = false;
            $scope.indexPaso = -1;
            $scope.categoriaSel = [];
            for (var i = $scope.procedimiento.categorias.length - 1; i >= 0; i--) {
                $scope.categoriaSel.push($scope.procedimiento.categorias[i]._id);
            }
            $scope.alerts = [];
            if (edita) {
                $scope.rutaUpload='/procedimientos/upload?procedimientoId='+ $scope.procedimiento._id;
                $scope.versionEdita = $scope.modificaVersion('+',3,$scope.procedimiento.versionActual);
                $scope.versionAgruegaQuita = $scope.modificaVersion('+',2,$scope.procedimiento.versionActual);
                $scope.modificando = true; //Para saber si estoy modificando los pasos
            }
            else {
                $scope.sortPasosAsc();
                $scope.modificando = false;
                $scope.calculaRating();
                $scope.btnComentar = true;
                $scope.frmComentar = false;
                $scope.rateUser = 0;
            }
        });
    };
    /**
     *Calcula el rating y suma la cantidad de votos  de un procedimiento
     */
    $scope.calculaRating = function() {
        $scope.totalVotos = $scope.procedimiento.rating.uno +
            $scope.procedimiento.rating.dos +
            $scope.procedimiento.rating.tres +
            $scope.procedimiento.rating.cuatro +
            $scope.procedimiento.rating.cinco;
        $scope.rate = Math.round((($scope.procedimiento.rating.uno * 1) +
            ($scope.procedimiento.rating.dos * 2) +
            ($scope.procedimiento.rating.tres * 3) +
            ($scope.procedimiento.rating.cinco * 5) +
            ($scope.procedimiento.rating.cuatro * 4)) /
            ($scope.totalVotos));
    }

    /**
     *Recibe un numero de version y lo modifica segun los parametros
     *
     *@param {string} signo indica si suma o resta al numero de version
     *@param {number} posicion posicion del numero de version que desea modificar
     *@param {string} version version que se modificara
     *
     *@return {string} numero de version modificado
     */

    $scope.modificaVersion = function(signo, posicion, version) {
        var resultado,inicio, medio, fin;
        var posInicial = -1;
        var nomas = false;
        var i = 0;
        var posFinal = 0;
        // Si es recien creado o no tiene ninguna version
        if (version === '0' || !version || $scope.procedimiento.pasos.length < 2) {
            return '1.0.0';
        }
        //Si la posicion es mayor a las existentes retornar
        //la misma version
        if (version.match(/\./g).length +1 < posicion) {
            return version;
        }

        //Busca la posicion del numero a editar
        while (i < posicion-1 && version.indexOf('.', posInicial+1) !== -1){
            posInicial = version.indexOf('.', posInicial+1);
            i++;
        }

        //Le suma uno ya que el posInicial esta en el .
        posInicial++;

        //Si no es el ultimo digiyo busque la posicion final, si no
        //asigne la longitud de la version
        if (version.indexOf('.', posInicial) !== -1) {
            posFinal = version.indexOf('.', posInicial);
        } else {
            posFinal = version.length;
        }
        //Asigna las partes que forman la nueva version
        inicio= version.substr(0,posInicial);
        medio = parseInt(version.substr(posInicial,posFinal - posInicial));
        fin = version.substr(posFinal);

        // Si la posicion final es igual a la longitud salirse del ciclo
        // de poner en 0 las subversiones subsiguientes
        if (posFinal === version.length) {
            nomas = true;
        }

        //Dependiendo del signo suma, resta o pone en 0 la version segun la
        //posicion enviada, mientras no sea el fin llama recursivamente el
        //procedimiento para poner en 0 las subversiones subsiguientes.
        if (signo === '+') {
            if (nomas) {
                return inicio + (medio + 1).toString() + fin;
            } else {
                resultado = $scope.modificaVersion('0',posicion+1,inicio + (medio + 1).toString() + fin);
            }
        } else if (signo === '-') {
            if (nomas) {
                return inicio + (medio - 1).toString() + fin;
            } else {
                resultado = $scope.modificaVersion('0',posicion+1,inicio + (medio - 1).toString() + fin);
            }
        } else if (signo === '0') {
            if (nomas) {
                return inicio + '0' + fin;
            } else {
                resultado = $scope.modificaVersion('0',posicion+1,inicio + '0' + fin);
            }
        } else {
            return version;
        }

        return resultado;
    };

    /**
     * Pone el foco en un elemento segun su id y va al top de la pagina
     *
     * @Param {string} elemento Elemento que se desea poner el foco
     */
    $scope.focusElement = function(elemento) {
        document.getElementById(elemento).focus();
    };

    /**
     * Elimina un paso del procedimiento
     *
     * @Param {number} id numero de indice en la tabla mostrarPasos
     * @Param {number} paso numero de paso en la tabla mostrarPasos
     */
    $scope.eliminarPaso = function(id, paso) {
        var modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Eliminar Paso',
            headerText: '¿Eliminar el Paso N° ' + paso + '?',
            bodyText: 'Esta seguro que desea eliminar el paso "' + $scope.procedimiento.pasos[id].descripcion +  '"?'
        };

        modalService.showModal({}, modalOptions).then(function (/*result*/) {
            var pasoBorrar = $scope.procedimiento.pasos[id].numeroPaso;

            //Ya que la version al eliminar un paso es mayor a la edicion
            //se iguala la version de editar
            $scope.versionEdita = $scope.versionAgruegaQuita;
            $scope.procedimiento.versionActual = $scope.versionAgruegaQuita;
            //Asigna la nueva version al paso y lo identifica como eliminado y no actual
            $scope.procedimiento.pasos[id].version = $scope.versionAgruegaQuita;
            $scope.procedimiento.pasos[id].eliminado = true;
            $scope.procedimiento.pasos[id].actual = false ;

            //Si es el utltimo paso no cambia el orden del resto
            if (id !== 0) {
                $scope.cambiarOrdenPasos(id-1,'eliminar');
            }

            $scope.updatePaso();
            //Si el paso a borrar es igual al paso que se esta editando
            //reiniciar la forma
            if (pasoBorrar === $scope.numeroPaso) {
                $scope.reiniciarForma();
            }
            else {
                $scope.numeroPaso = $scope.ultimoPaso();
            }
        });
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
                if ($scope.procedimiento.pasos[i].version === $scope.versionAgruegaQuita) {
                    $scope.procedimiento.pasos[i].numeroPaso = $scope.procedimiento.pasos[i].numeroPaso - 1;
                } else {
                    if ($scope.procedimiento.pasos[i].actual && !$scope.procedimiento.pasos[i].eliminado) {
                        $scope.procedimiento.pasos[i].actual = false;
                        $scope.procedimiento.pasos.push({
                            'numeroPaso': $scope.procedimiento.pasos[i].numeroPaso - 1,
                            'descripcion': $scope.procedimiento.pasos[i].descripcion,
                            'imagen': $scope.procedimiento.pasos[i].imagen,
                            'video': $scope.procedimiento.pasos[i].video,
                            'version': $scope.versionAgruegaQuita,
                            'actual': true,
                            'eliminado': false
                        });
                    }
                }
            }
        }
        if (accion === 'agregar') {
            for (i =  id; i >= 0; i--) {
                if ($scope.procedimiento.pasos[i].version === $scope.versionAgruegaQuita) {
                    $scope.procedimiento.pasos[i].numeroPaso = $scope.procedimiento.pasos[i].numeroPaso + 1;
                } else {
                    if ($scope.procedimiento.pasos[i].actual && !$scope.procedimiento.pasos[i].eliminado) {
                        $scope.procedimiento.pasos[i].actual = false;
                        $scope.procedimiento.pasos.push({
                            'numeroPaso': $scope.procedimiento.pasos[i].numeroPaso + 1,
                            'descripcion': $scope.procedimiento.pasos[i].descripcion,
                            'imagen': $scope.procedimiento.pasos[i].imagen,
                            'video': $scope.procedimiento.pasos[i].video,
                            'version': $scope.versionAgruegaQuita,
                            'actual': true,
                            'eliminado': false
                        });
                    }
                }
             //   $scope.procedimiento.pasos[i].numeroPaso = $scope.procedimiento.pasos[i].numeroPaso + 1;
            }
        }
        if (accion === 'sube') {
            if ($scope.procedimiento.pasos[id-1]) {
                $scope.procedimiento.pasos[id].numeroPaso = $scope.procedimiento.pasos[id].numeroPaso + 1;
                $scope.procedimiento.pasos[id-1].numeroPaso = $scope.procedimiento.pasos[id-1].numeroPaso - 1;
                $scope.updatePaso();
            }
        }
        if (accion === 'baja') {
            if ($scope.procedimiento.pasos[id+1]) {
                $scope.procedimiento.pasos[id].numeroPaso = $scope.procedimiento.pasos[id].numeroPaso - 1;
                $scope.procedimiento.pasos[id+1].numeroPaso = $scope.procedimiento.pasos[id+1].numeroPaso + 1;
                $scope.updatePaso();
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
        $scope.videoPasoFake = $scope.procedimiento.pasos[id].video.substring(10,$scope.procedimiento.pasos[id].video.length);
        $scope.edicionPaso = true;
    };

    /**
     * Preparacion previa al insertar un paso intermedio en los pasos
     *
     * @Param {number} id numero del indice en la tabla de mostrarPasos
     */
    $scope.agregarPasoIntermedio = function(id) {
        $scope.indexPaso = id;
        $scope.numeroPaso = $scope.procedimiento.pasos[$scope.indexPaso].numeroPaso + 1;
        $scope.descripcionPaso = 'baujar';
        $scope.descripcionPaso = '';
    };

    /**
     * Retorna el ultimo paso del procedimiento + 1
     *
     * @return {number} Ultimo paso + 1
     */
    $scope.ultimoPaso = function() {
        var up = 0;
        for (var i = $scope.procedimiento.pasos.length - 1; i >= 0; i--) {
            if ($scope.procedimiento.pasos[i].actual && !$scope.procedimiento.pasos[i].eliminado) {
                if (up < $scope.procedimiento.pasos[i].numeroPaso) {
                    up = $scope.procedimiento.pasos[i].numeroPaso;
                }
            }
        }
        return up + 1;
    };

    /**
     *Reinicia la forma,limpia todos los models, y pone el poco en descripcionPaso
     */
    $scope.reiniciarForma  = function() {
        document.getElementById('formaPaso').reset();
        $scope.formaPaso.$setPristine();
        $scope.edicionPaso = false;
        $scope.indexPaso = -1;
        $scope.fileImagen = '';
        $scope.fileVideo = '';
        $scope.videoPasoFake = '';
        $scope.imagenPaso = '';
        $scope.descripcionPaso = null;
        $scope.numeroPaso = $scope.ultimoPaso();
    };

    /**
     *Ordena los pasos en orden Descendente
     */
    $scope.sortPasos = function() {
        $scope.procedimiento.pasos.sort(function(a,b) {
            var n = b.actual - a.actual;
            if (n !== 0) {
                return n;
            }
            n = parseInt(b.numeroPaso) - parseInt(a.numeroPaso);
            if (n !== 0) {
                return n;
            }
            return b.version - a.version;
        });
    };

    /**
     *Ordena los pasos en orden Ascendente
     */
    $scope.sortPasosAsc = function() {
        $scope.procedimiento.pasos.sort(function(a,b) {
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
    };

    /**
     *Determinar si es el ultimo o primer paso
     *@param {string} tipo si se quiere saber si el ultimo o primer paso
     *@param {number) id  numero de paso o id del array
     *@return {boolean} regresa true si el es ultimo primer paso
     */
    $scope.ultimoOPrimerPaso = function(tipo, id) {
        if (tipo === 'u' && id === 0) {
            return true;
        }
        if (tipo === 'p' && id === 1) {
            return true;
        }
        return false;
    };

     /**
       *Redirige a la pagina que muestra el procedimiento y los pasos
       */
    $scope.irProcedimiento = function() {
        $location.path('procedimientos/' + $scope.procedimiento._id );
    };

    /**
     *Se va al elemento deseado segun el id
     *@param {string} elemento al que se desea ir
     */
    $scope.irElemento = function(elemento) {
        //var pasoId = '#paso' + elemento;
        console.log(elemento);
        $('html, body').animate({
            scrollTop: $(elemento).offset().top
        });
    };

    /**
     *Guarda el rating dado por un usuario a un procedimiento
     *y el comentario
     */
    $scope.guardarRating = function(){
        if ($scope.descripcionComentario && $scope.rateUser !== 0) {
            switch($scope.rateUser) {
                case 1:
                    $scope.procedimiento.rating.uno =$scope.procedimiento.rating.uno + 1;
                    break;
                case 2:
                    $scope.procedimiento.rating.dos =$scope.procedimiento.rating.dos + 1;
                    break;
                case 3:
                    $scope.procedimiento.rating.tres =$scope.procedimiento.rating.tres + 1;
                    break;
                case 4:
                    $scope.procedimiento.rating.cuatro =$scope.procedimiento.rating.cuatro + 1;
                    break;
                case 5:
                    $scope.procedimiento.rating.cinco =$scope.procedimiento.rating.cinco + 1;
                    break;
            }
            console.log('$scope.procedimiento.rating');
            console.log($scope.procedimiento.rating);
            $scope.procedimiento.comentarios.unshift({
                'user': this.global.user._id,
                'comentario': this.descripcionComentario,
                'rating': this.rateUser
            });
            $scope.updateComentario();
            $scope.btnComentar=false;
            $scope.frmComentar=false;
            $scope.calculaRating();
            $scope.agregarAlerta('success','¡Gracias por su comentario!');
        }
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
    /**
     *Muestra la forma de comentario y esconde el boton
     */
    $scope.muestraComentario = function() {
        $scope.btnComentar=!$scope.btnComentar;
        $scope.frmComentar=!$scope.frmComentar;
        $timeout(function() {$scope.focusElement('comentario')},100);
    }
}]);


