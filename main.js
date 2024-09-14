let userId = null;
let questions = [];
let currentQuestionIndex = 0;
let startTime;

// Función para obtener parámetros de la URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Si estamos en examen.html, obtener el ID del usuario desde la URL
if (window.location.pathname.includes('examen.html')) {
  userId = getQueryParam('id');
  if (!userId) {
    alert('No se encontró el ID del usuario.');
    window.location.href = 'index.html';
  }
}

document.getElementById('iniciarExamenBtn')?.addEventListener('click', iniciarExamen);
document.getElementById('finalizarExamenBtn')?.addEventListener('click', finalizarExamen);

function iniciarExamen() {
  // Primero generar el ID de usuario
  fetch('https://simulacro-dlo9.onrender.com/generate_id', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
      userId = data.id;
      console.log('ID generado:', userId); // Verificar ID generado
      
      // Redirigir a la página de examen con el ID en la URL
      window.location.href = `examen.html?id=${userId}`;
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Hubo un error al iniciar el examen.');
    });
}

function mostrarPregunta(index) {
  if (index < questions.length) {
    const pregunta = questions[index];
    document.getElementById('preguntaTexto').textContent = pregunta.pregunta;

    const opcionesDiv = document.getElementById('opciones');
    opcionesDiv.innerHTML = ''; // Limpiar las opciones anteriores

    // Crear las opciones con sus letras correspondientes
    const opciones = ['A', 'B', 'C', 'D', 'E'];
    opciones.forEach((letra, i) => {
      const clave = pregunta[`clave${letra}`];
      if (clave) {
        const button = document.createElement('button');
        button.innerHTML = `<span class="clave">${letra}</span><span class="contenido">${clave}</span>`;
        button.onclick = () => responderPregunta(letra);
        opcionesDiv.appendChild(button);
      }
    });

    document.getElementById('preguntaCard').style.display = 'block'; // Mostrar la pregunta
  } else {
    // Ocultar la tarjeta de pregunta y mostrar el botón de finalizar examen solo en esta ventana
    document.getElementById('preguntaCard').style.display = 'none';
    document.getElementById('finalizarExamenBtn').style.display = 'inline-block';
  }
}

function responderPregunta(respuesta) {
  const campo = `campo${currentQuestionIndex + 1}`;

  const data = {
    id: userId,
    campo: campo,
    contenido: respuesta
  };

  console.log('Enviando respuesta:', JSON.stringify(data, null, 2));

  fetch('https://simulacro-dlo9.onrender.com/update_field', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(() => {
      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        mostrarPregunta(currentQuestionIndex); // Pasar automáticamente a la siguiente pregunta
      } else {
        // Mostrar el botón de finalizar examen solo después de la última pregunta
        document.getElementById('preguntaCard').style.display = 'none';
        document.getElementById('finalizarExamenBtn').style.display = 'inline-block';
      }
    })
    .catch(error => console.error('Error al enviar respuesta:', error));
}

function finalizarExamen() {
  const data = {
    id_b: userId,
    random_ids: questions.map(q => q.id) // Aquí también obtenemos los IDs de las preguntas
  };

  console.log('Enviando respuestas finales:', JSON.stringify(data, null, 2));

  fetch('https://simulacro-dlo9.onrender.com/compare_answers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(resultados => {
      const tiempoFinal = (new Date() - startTime) / 1000; // Calcular tiempo en segundos
      const correctas = resultados.correctas;
      const incorrectas = questions.length - correctas;

      document.getElementById('finalizarExamenBtn').style.display = 'none'; // Ocultar el botón de finalizar examen después de hacer clic
      document.getElementById('resultado').style.display = 'block';
      document.getElementById('correctas').textContent = `Correctas: ${correctas}`;
      document.getElementById('incorrectas').textContent = `Incorrectas: ${incorrectas}`;
      document.getElementById('tiempoTotal').textContent = `Tiempo total: ${tiempoFinal} segundos`;
    })
    .catch(error => {
      console.error('Error al finalizar examen:', error);
      alert('Hubo un error al obtener los resultados del examen.');
    });
}

// Si estamos en examen.html, cargar las preguntas y mostrar la primera pregunta
if (userId && window.location.pathname.includes('examen.html')) {
  fetch('https://simulacro-dlo9.onrender.com/random_questions')
    .then(response => response.json())
    .then(data => {
      questions = data;
      console.log('Preguntas obtenidas:', questions); // Verificar preguntas obtenidas
      startTime = new Date(); // Iniciar el contador de tiempo

      // Mostrar la primera pregunta
      mostrarPregunta(0);
      
      // Mostrar la sección del examen
      document.getElementById('examenScreen').style.display = 'block';
    })
    .catch(error => {
      console.error('Error al obtener preguntas:', error);
      alert('Hubo un error al obtener las preguntas.');
    });
}
