<h1>Base de Conocimientos de BANADESA</h1>
<pre>se hizo cambios en la libreria textAngular para que hiciese foco en la descripcion cuando se agrega un paso
de un prodecimiento</pre>
Los cambios son los siguienes
<ol>
    <li>Despues de la linea 479 "scope.displayElements.forminput.val(newValue);
                        }" se agrego la linea
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
    <li><del>Un paso pueda ser otro procedimiento</del></li>
    <li><del>Se pueda exportar un procedimiento a PDF<del></li>
    <li><del>Se pueda compartir un procedimiento por correo</del></li>
    <li><del>Los usuarios solo pueden ver los procedimientos de sus categorias</del></li>
    <li><del>Se pueda hacer una busqueda del procedimiento segun el nombre o la descripcion<del></li>
    <li><del>En la pagina principal se muestren los procedimientos mas vistos en la categoria del usuario</del></li>
    <li><del>En la pagina principal se muestren los ultimos procedimientos visitos</del></li>
    <li><del>Se puede navegar por categorias</del></li>
    <li><del>Se puedan agregar archivos adjuntos al procedimiento</del></li>
    <li><del>Se pueda crear un procedimiento a partir de otro<del></li>
</ul>
