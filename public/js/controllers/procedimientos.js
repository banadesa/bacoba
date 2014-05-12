// 'use strict';

angular.module('mean.procedimientos').
controller('ProcedimientosController', ['$scope', '$rootScope', '$routeParams', '$location',
    '$anchorScroll', '$timeout', '$http', '$window' ,'$q', 'Global', 'AppAlert',
    'Procedimientos','Categorias','cargarArchivo', 'modalService', 'proc',
    function ($scope, $rootScope, $routeParams, $location, $anchorScroll, $timeout, $http,
        $window, $q, Global, AppAlert, Procedimientos, Categorias, cargarArchivo, modalService, proc) {
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
            files[cont] = $scope.fileVideo;
            cont++;
        }

        if ($scope.fileAdjunto) {
            files[cont] = $scope.fileAdjunto;
            cont++;
        }

        console.log(files);
        var uploadUrl = '/procedimientos/upload?procedimientoId=' + $scope.procedimiento._id;
        if ($scope.procedimientoRelacionado.nombre) {
            $scope.descripcionPaso = $scope.procedimientoRelacionado.nombre;
            $scope.videoPaso='';
            $scope.adjuntoPaso='';
            $scope.imagenPaso='';
            $scope.procedimientoPaso = $scope.procedimientoRelacionado._id;
        } else {
            $scope.procedimientoPaso = null;
        }
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

                if (data.adjuntoUrl) {
                    $scope.adjuntoPaso = data.adjuntoUrl;
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
        $scope.procedimiento.versiones.push({version: $scope.versionEdita, fecha: new Date().getTime()});
        $scope.descripcionPaso = $scope.formatearDescripcion($scope.descripcionPaso);
        if ($scope.procedimiento.pasos[$scope.indexPaso].version === $scope.versionEdita ) {
            $scope.procedimiento.pasos[$scope.indexPaso].descripcion = $scope.descripcionPaso;
            $scope.procedimiento.pasos[$scope.indexPaso].imagen = $scope.imagenPaso;
            $scope.procedimiento.pasos[$scope.indexPaso].video = $scope.videoPaso;
            $scope.procedimiento.pasos[$scope.indexPaso].adjunto = $scope.adjuntoPaso;
            $scope.procedimiento.pasos[$scope.indexPaso].procedimiento = $scope.procedimientoPaso;
        } else {
            $scope.procedimiento.pasos[$scope.indexPaso].actual = false;
            $scope.procedimiento.pasos.push({
                'numeroPaso': this.numeroPaso,
                'descripcion': this.descripcionPaso,
                'imagen': this.imagenPaso,
                'video': this.videoPaso,
                'adjunto': this.adjuntoPaso,
                'version': this.versionEdita,
                'procedimiento': $scope.procedimientoPaso,
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
        var comentario = $scope.comentario;
        var comentar = '/procedimientos/' + $scope.procedimiento._id + '/comentar';
        $http.post( comentar,  comentario);
        $scope.procedimiento.comentarios.unshift($scope.comentario);
    };

    /**
     *Crear el Pdf en el servidor y lo abre en una nueva ventana
     */
    $scope.crearPdf = function() {
        var crearPdf = '/procedimientos/' + $scope.procedimiento._id + '/crearPdf';
        $http.post(crearPdf, {externo: true})
        .success(function(data) {
            $timeout(function() {
                $window.open(data.url);
            }, 2);
        })
        .error(function(data) {
            console.log('hubo un error ' + data);
        });
    };

    $scope.enviarCorreo = function() {
        var enviarCorreo = '/procedimientos/' + $scope.procedimiento._id + '/enviarCorreo';
        var destinatario = {};
        destinatario.nombre = $scope.nombreDestinatario;
        destinatario.correo = $scope.correoDestinatario;
        destinatario.comentario = $scope.comentarioDestinatario;
        $http.post(enviarCorreo, {destinatario: destinatario})
        .success(function(data) {
            if (data.success) {
                AppAlert.add('success','El correo se ha enviado Exitosamente!');
            }
        })
        .error(function(data) {
            console.log('hubo un error ' + data);
        });
        $scope.frmCorreo = false;
    };

    /**
     *Agrega un paso al procedimiento, y reinicia la forma
     */
    $scope.agregarPaso = function() {
        if ($scope.indexPaso !== -1 ) {
            $scope.cambiarOrdenPasos($scope.indexPaso-1,'agregar');
        }
        $scope.descripcionPaso = $scope.formatearDescripcion($scope.descripcionPaso);
        $scope.versionEdita = $scope.versionAgruegaQuita;
        $scope.procedimiento.versionActual = $scope.versionAgruegaQuita;
        $scope.procedimiento.versiones.push({version: $scope.versionAgruegaQuita, fecha: new Date().getTime()});
        $scope.procedimiento.pasos.push({
            'numeroPaso': $scope.numeroPaso,
            'descripcion': $scope.descripcionPaso,
            'imagen': $scope.imagenPaso,
            'video': $scope.videoPaso,
            'adjunto': $scope.adjuntoPaso,
            'procedimiento': $scope.procedimientoPaso,
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
        $scope.procedimientos = proc;
    };

    /**
     *Busca procedimientos por el nombre
     *@param {string} val nombre del procedimiento
      *@return {object} procedimiento con el nombre y la descripcion
     */
    $scope.buscaProcedimientos = function(val) {
        return $http.get('procedimientos/', {
            params: {
                nombre: val
            }
        }).then(function(res){
            var procedimientos = [];
            angular.forEach(res.data, function(item){
                procedimientos.push(item);
            });
            return procedimientos;
        });
    };

    /**
     *Encuentra un procedimiento especifico
     *
     *@param {boolean} edita describe si la busqueda es para editar el paso
     */

    $scope.findOne = function(edita) {
        if (proc.nombre) {
            $scope.procedimiento = proc;
            $scope.sortPasos();
            $scope.numeroPaso = $scope.ultimoPaso();

            $scope.edicionPaso = false;
            $scope.indexPaso = -1;
            $scope.categoriaSel = [];
            for (var i = $scope.procedimiento.categorias.length - 1; i >= 0; i--) {
                $scope.categoriaSel.push($scope.procedimiento.categorias[i]._id);
            }
            if (edita) {
                $scope.rutaUpload='/procedimientos/upload?procedimientoId='+ $scope.procedimiento._id;
                $scope.versionEdita = $scope.modificaVersion('+',3,$scope.procedimiento.versionActual);
                $scope.versionAgruegaQuita = $scope.modificaVersion('+',2,$scope.procedimiento.versionActual);
                $scope.modificando = true; //Para saber si estoy modificando los pasos
                $scope.relProcedimiento = false;
                $scope.seleccionProcedimientoActivo = true;
                $scope.btnDesRelProcedimiento = 'Relacionar Procedimiento';
                $scope.procedimientoRelacionado = {};
            }
            else {
                $scope.sortPasosAsc();
                $scope.modificando = false;
                $scope.calculaRating();
                $scope.btnComentar = true;
                $scope.frmComentar = false;
                $scope.frmCorreo = false;
                $scope.rateUser = 0;
            }
        } else {
            AppAlert.add('danger', 'Error al intentar acceder al procedimiento');
           $location.path('procedimientos/');
        }
    };

    /**
     * aumenta el numero de veces que un procedimiento a sido visitado
     */
    $scope.visitas = function() {
        $http.post(/procedimientos/ +  $routeParams.procedimientoId + '/visitas')
        .success(function(data){
            if (!data.success) {
                console.log(data.err);
            }
        });
    };
    /**
     *funciones luego que se selecciona un procedimiento en la busqueda
     *@param {object} $item objeto que contiene la respuesta del typeahead
     */
    $scope.seleccionarProcedimiento = function($item) {
        $scope.procedimientoRelacionado = $item;
        $scope.seleccionProcedimientoActivo = false;
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
    };

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
                            'adjunto': $scope.procedimiento.pasos[i].adjunto,
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
                            'adjunto': $scope.procedimiento.pasos[i].adjunto,
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
        $scope.edicionPaso = true;
        if ($scope.procedimiento.pasos[id].procedimiento) {
            $scope.procedimientoRelacionado.nombre = $scope.procedimiento.pasos[id].descripcion;
            $scope.procedimientoRelacionado._id = $scope.procedimiento.pasos[id].procedimiento;
            $scope.procedimientoPaso = $scope.procedimiento.pasos[id].procedimiento;
            $scope.relacionarProcedimiento(true);
            $scope.seleccionProcedimientoActivo = false;
        } else {
            $scope.procedimientoRelacionado = {};
            $scope.seleccionProcedimientoActivo = true;
            $scope.relacionarProcedimiento(false);
            $scope.imagenPaso = $scope.procedimiento.pasos[id].imagen;
            $scope.videoPasoFake = $scope.procedimiento.pasos[id].video.substring(10,$scope.procedimiento.pasos[id].video.length);
            $scope.adjuntoPasoFake = $scope.procedimiento.pasos[id].adjunto.substring(10,$scope.procedimiento.pasos[id].adjunto.length);
        }
    };

    /**
     * Preparacion previa al insertar un paso intermedio en los pasos
     *
     * @Param {number} id numero del indice en la tabla de mostrarPasos
     */
    $scope.agregarPasoIntermedio = function(id) {
        $scope.indexPaso = id;
        $scope.numeroPaso = $scope.procedimiento.pasos[$scope.indexPaso].numeroPaso + 1;
        $scope.descripcionPaso = '';
        $scope.imagenPaso = '';
        $scope.videoPaso = '';
        $scope.adjuntoPaso = '';
        $scope.procedimientoRelacionado = {};
        $scope.seleccionProcedimientoActivo = true;
        $scope.relacionarProcedimiento(false);
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
        $scope.adjuntoPasoFake = '';
        $scope.imagenPaso = '';
        $scope.descripcionPaso = null;
        $scope.numeroPaso = $scope.ultimoPaso();
        $scope.seleccionProcedimientoActivo = true;
        $scope.procedimientoRelacionado = {};
        $scope.relProcedimiento = false;
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
        if (elemento !== 'top') {
            $('html, body').animate({
                scrollTop: $(elemento).offset().top - 60
            });
        } else {
            $('html, body').animate({ scrollTop: 0 });
        }
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
            $scope.comentario = {
                'user': this.global.user._id,
                'comentario': this.descripcionComentario,
                'rating': this.rateUser
            };

            $scope.updateComentario();
            $scope.btnComentar=false;
            $scope.frmComentar=false;
            $scope.calculaRating();
            AppAlert.add('success','¡Gracias por su comentario!');
        }
    };

    /**
     *Muestra la forma de comentario y esconde el boton
     */
    $scope.muestraComentario = function() {
        $scope.btnComentar=!$scope.btnComentar;
        $scope.frmComentar=!$scope.frmComentar;
        $timeout(function() {$scope.focusElement('comentario');},100);
    };

    /**
     *Esconde los campos de descripcion, imagen y video
     *de la forma de agregar paso y muestra un select box
     *donde se guardara el paso
     *@param {boolean} rel si se va a relacionar un procedimiento
     *o no, si se deja vacio invierte el relProcedimiento
     *
     */
    $scope.relacionarProcedimiento = function(rel){
        if (rel !== undefined) {
            $scope.relProcedimiento = rel;
        } else {
            $scope.relProcedimiento = !$scope.relProcedimiento;
        }
        if ($scope.relProcedimiento) {
            $scope.btnDesRelProcedimiento = 'Crear paso nuevo';
        } else {
            $scope.btnDesRelProcedimiento = 'Relacionar Procedimiento';
        }
    };

    /**
     *Formatear la descripcion para quitar clases en el html y
     *substituir los acentos y demas simbolos del español
     *@param {string} texto texto a formatear
     *@return {string} texto con las modificaciones
     */
    $scope.formatearDescripcion = function(texto) {
        texto = texto.replace(/&#160;/g,' ');
        texto = texto.replace(/&#241;/g,'ñ');
        texto = texto.replace(/&#209;/g,'Ñ');
        texto = texto.replace(/&#225;/g,'á');
        texto = texto.replace(/&#193;/g,'Á');
        texto = texto.replace(/&#233;/g,'é');
        texto = texto.replace(/&#201;/g,'É');
        texto = texto.replace(/&#237;/g,'í');
        texto = texto.replace(/&#205;/g,'Í');
        texto = texto.replace(/&#243;/g,'ó');
        texto = texto.replace(/&#211;/g,'Ó');
        texto = texto.replace(/&#250;/g,'ú');
        texto = texto.replace(/&#218;/g,'Ú');
        texto = texto.replace(/&#191;/g,'¿');
        texto = texto.replace(/&#161;/g,'¡');
        texto = texto.replace(/&#34;/g,'"');
        texto = texto.replace(/&#10;/g,' ');
        texto = texto.replace(/&#160;/g,' ');
        texto = texto.replace(/ class="[^"]+"/g,'');
        return texto;
    };

    /**
     *Muestra la forma para enviar el procedimiento por correo
     *
     */
    $scope.muestraFormaCorreo = function() {
        $scope.nombreDestinatario = '';
        $scope.correoDestinatario = '';
        $scope.comentarioDestinatario = '';
        $scope.frmCorreo = !$scope.frmCorreo;
        if ($scope.frmCorreo) {
            $timeout(function() {$scope.focusElement('nombreDes');},100);
        }
    };

    /**
     *Crear un nuevo procedimiento duplicando otro
     *@param {string} id id del procedimiento a duplicar
     */
    $scope.duplicarProcedimiento  = function(id) {
            $http.post('procedimientos/', {
                params: {
                    id: id
                }
            })
            .then(function(res) {
                console.log(res);
            });
    };
}]);


