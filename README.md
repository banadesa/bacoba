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
    <li>Hacer que se puedan enlazar otros pasos</li>
    <li>Advertencia al eliminar un procedimiento o paso</li>
    <!--li></li>
    <li></li>
    <li></li-->
</ul>
