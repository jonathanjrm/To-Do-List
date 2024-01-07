document.addEventListener("DOMContentLoaded", function () {
  const tareaInput = document.getElementById("tarea");
  const descripcionInput = document.getElementById("descripcion");
  const fechaInicioInput = document.getElementById("fechaInicio");
  const fechaFinInput = document.getElementById("fechaFin");
  const agregarBtn = document.getElementById("agregar");
  const listaTareas = document.getElementById("listaTareas");
  const limpiarTareasBtn = document.getElementById("limpiarTareas");
  const ventanaEmergente = document.getElementById("ventanaEmergente");
  const cuentaRegresivaElemento = document.getElementById("cuentaRegresiva");

  let tareas = [];

  // Cargar tareas almacenadas al iniciar la página
  cargarTareasAlmacenadas();

  function cargarTareasAlmacenadas() {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tareas = storedTasks;
    actualizarListaTareas();
  }

  function agregarTarea() {
    const tarea = {
      nombre: tareaInput.value,
      descripcion: descripcionInput.value,
      fechaInicio: fechaInicioInput.value,
      fechaFin: fechaFinInput.value,
      completada: false,
    };

    tareas.push(tarea);
    actualizarListaTareas();
    limpiarCampos();
    // Guardar tareas en el almacenamiento local
    guardarTareasEnAlmacenamientoLocal();
  }

  function actualizarListaTareas() {
    listaTareas.innerHTML = "";

    tareas.forEach((tarea, index) => {
      const tareaElemento = document.createElement("tr");
      tareaElemento.innerHTML = `
        <td class="px-4 py-2"><input type="checkbox" id="checkbox-${index}" ${
        tarea.completada ? "checked" : ""
      } class="mr-2"></td>
        <td class="px-4 py-2">${tarea.nombre}</td>
        <td class="px-4 py-2"><button class="mostrarDescripcionBtn">Ver Descripción</button></td>
        <td class="px-4 py-2">${tarea.fechaInicio}</td>
        <td class="px-4 py-2">${tarea.fechaFin}</td>
        <td class="px-4 py-2" id="cuentaRegresiva-${index}"></td>
      `;
      listaTareas.appendChild(tareaElemento);

      const mostrarDescripcionBtn = tareaElemento.querySelector(
        ".mostrarDescripcionBtn"
      );
      mostrarDescripcionBtn.addEventListener("click", function () {
        mostrarVentanaEmergente(index);
      });

      const checkbox = tareaElemento.querySelector(`#checkbox-${index}`);
      checkbox.addEventListener("change", function () {
        tarea.completada = checkbox.checked;
        if (tarea.completada) {
          cuentaRegresivaElemento.classList.add("hidden");
        } else {
          iniciarCuentaRegresiva(index, tarea.fechaFin);
        }
        // Guardar tareas en el almacenamiento local
        guardarTareasEnAlmacenamientoLocal();
      });

      if (!tarea.completada) {
        iniciarCuentaRegresiva(index, tarea.fechaFin);
      }
    });
  }

  function limpiarCampos() {
    tareaInput.value = "";
    descripcionInput.value = "";
    fechaInicioInput.value = "";
    fechaFinInput.value = "";
  }

  function mostrarVentanaEmergente(index) {
    const tareaSeleccionada = tareas[index];
    ventanaEmergente.classList.remove("hidden");

    const contenidoVentana = `
      <label for="editarDescripcion" class="block mb-2">Descripción:</label>
      <textarea id="editarDescripcion" class="rounded-md border-gray-300 w-full p-2 mb-4" readonly>${tareaSeleccionada.descripcion}</textarea>
      <button id="editarBtn" class="py-1 px-4 rounded bg-blue-500 text-white hover:bg-blue-700 mr-2" style="display:inline-block;">Editar</button>
      <button id="guardarBtn" class="py-1 px-4 rounded bg-green-500 text-white hover:bg-green-700" style="display:none;">Guardar</button>
      <button id="aceptarBtn" class="py-1 px-4 rounded bg-green-500 text-white hover:bg-green-700" style="display:inline-block;">Aceptar</button>
    `;
    ventanaEmergente.innerHTML = contenidoVentana;

    const editarBtn = document.getElementById("editarBtn");
    const guardarBtn = document.getElementById("guardarBtn");
    const aceptarBtnVentana = document.getElementById("aceptarBtn");

    editarBtn.addEventListener("click", function () {
      document.getElementById("editarDescripcion").removeAttribute("readonly");
      guardarBtn.style.display = "inline-block";
      editarBtn.style.display = "none";
      aceptarBtnVentana.style.display = "none";
    });

    guardarBtn.addEventListener("click", function () {
      const nuevaDescripcion =
        document.getElementById("editarDescripcion").value;
      tareas[index].descripcion = nuevaDescripcion;
      document
        .getElementById("editarDescripcion")
        .setAttribute("readonly", "true");
      guardarBtn.style.display = "none";
      editarBtn.style.display = "inline-block";
      aceptarBtnVentana.style.display = "inline-block";
      actualizarListaTareas();
      // Guardar tareas en el almacenamiento local
      guardarTareasEnAlmacenamientoLocal();
    });

    aceptarBtnVentana.addEventListener("click", function () {
      ventanaEmergente.classList.add("hidden");
      cuentaRegresivaElemento.classList.add("hidden");
    });
  }

  function guardarTareasEnAlmacenamientoLocal() {
    localStorage.setItem("tasks", JSON.stringify(tareas));
  }

  function actualizarCuentaRegresiva(tiempoRestante, index) {
    const cuentaRegresivaElemento = document.getElementById(
      `cuentaRegresiva-${index}`
    );
    const dias = Math.floor(tiempoRestante / (1000 * 60 * 60 * 24));
    const horas = Math.floor(
      (tiempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutos = Math.floor(
      (tiempoRestante % (1000 * 60 * 60)) / (1000 * 60)
    );
    const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);

    const cuentaRegresivaTexto = `${dias} días, ${horas} horas, ${minutos} minutos, ${segundos} segundos`;
    cuentaRegresivaElemento.textContent = cuentaRegresivaTexto;

    // Nueva funcionalidad: Marcar la fila con borde rojo y titilante si el tiempo es menor a 1 hora
    const horasRestantes = tiempoRestante / (1000 * 60 * 60);
    if (horasRestantes < 1) {
      cuentaRegresivaElemento.parentNode.classList.add("borde-rojo-titilar");
    } else {
      cuentaRegresivaElemento.parentNode.classList.remove("borde-rojo-titilar");
    }

    if (tiempoRestante <= 0) {
      cuentaRegresivaElemento.classList.add("hidden");
    } else {
      cuentaRegresivaElemento.classList.remove("hidden");
    }
  }

  function iniciarCuentaRegresiva(index, fechaFin) {
    const fechaFinMs = new Date(fechaFin).getTime();

    const intervalo = setInterval(function () {
      const ahora = new Date().getTime();
      const tiempoRestante = fechaFinMs - ahora;
      if (tiempoRestante <= 0) {
        clearInterval(intervalo);
        cuentaRegresivaElemento.classList.add("hidden");
      }
      actualizarCuentaRegresiva(tiempoRestante, index);
    }, 1000);
  }

  agregarBtn.addEventListener("click", agregarTarea);

  limpiarTareasBtn.addEventListener("click", function () {
    tareas = tareas.filter((tarea) => !tarea.completada);
    actualizarListaTareas();
    // Reiniciar cuentas regresivas de las tareas pendientes
    tareas.forEach((tarea, index) => {
      if (!tarea.completada) {
        iniciarCuentaRegresiva(index, tarea.fechaFin);
      }
    });
    // Guardar tareas en el almacenamiento local
    guardarTareasEnAlmacenamientoLocal();
  });
});
