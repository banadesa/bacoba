<h1>Base de Conocimientos de BANADESA</h1>
<pre>se hizo cambios en la libreria textAngular para que hiciese foco en la descripcion cuando se agrega un paso
de un prodecimiento</pre>
Los cambios son los siguienes
<ol>
    <li>Despues de la linea 479 "scope.displayElements.forminput.val(newValue);
                        }" se agrego la linea
        <pre>scope.displayElements.text[0].focus();</pre>
    </li>
    <li>Despues de la linea 554 "scope.displayElements.text.on('mouseup', _mouseup);" se agrego la linea
        <pre>scope.displayElements.text[0].focus();</pre>
    </li>
</ol>

<h3>Pendientes para version 1.0.0</h3>
<ul>
    <li><del>Advertencia al eliminar un procedimiento o paso</del></li>
    <li><del>Se puedan crear procedimientos</del></li>
    <li><del>Cada procedimiento puede tener infinitos pasos</del></li>
    <li><del>Cada paso puede incluir videos o fotos</del></li>
    <li><del>Los procedimientos pueden tener varias categorias</del></li>
    <li><del>Debe ser registrado por usuarios</del></li>
    <li><del>Manejo de versiones en los procedimientos</del> Se manejan versiones pero no permite
    mostrar o editar versiones anteriores</li>
    <li><del>Cada categoria puede tener infinita subcategorias</del></li>
    <li><del>Los usuarios puedan dar rating a los procedimientos</del></li>
    <li><del>Los usuarios puedan dejar comentarios en los procedimientos</del></li>
    <li>Un paso pueda ser otro procedimiento</li>
    <li>Se pueda exportar un procedimiento a PDF</li>
    <li>Se pueda compartir un procedimiento por correo</li>
    <li>Se pueda crear un procedimiento a partir de otro</li>
    <li>Los usuarios solo pueden ver los procedimientos de sus categorias</li>
    <li>Se puede navegar por categorias</li>
    <li>Hacer que se puedan enlazar otros pasos</li>
    <li>En la pagina principal se muestren los ultimos procedimientos visitos</li>
    <li>En la pagina principal se muestren los procedimientos mas vistos en la categoria del usuario</li>
    <li>Se pueda hacer una busqueda del procedimiento segun el nombre o la descripcion</li>
</ul>
