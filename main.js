let userId = null;
let currentQuestionIndex = 0;
let questions = [];
let randomIds = [];
let correctas = 0;
let incorrectas = 0;
let startTime;

document.getElementById('probarmeBtn').addEventListener('click', generarId);
document.getElementById('iniciarExamenBtn').addEventListener('click', iniciarExamen);
document.getElementById('finalizarExamenBtn').addEventListener('click', finalizarExamen);

function generarId() {
  fetch('https://simulacro-dlo9.onrender.com/generate_id', { method: 'POST' })
    .then(response => response.json())
    .then(data => {
      userId = data.id;
      document.getElementById('probarmeScreen').style.display = 'none';
      document.getElementById('examenScreen').style.display = 'block';
    })
    .catch(error => console.error('Error al generar ID:', error));
}

function iniciarExamen() {
  fetch('https://simulacro-dlo9.onrender.com/random_questions')
    .then(response => response.json())
    .then(data => {
      questions = data;
      randomIds = questions.map(q => q.id); // Guardar IDs de las preguntas
      startTime = new Date(); // Iniciar el contador de tiempo
      mostrarPregunta(0); // Mostrar la primera pregunta
      document.getElementById('iniciarExamenBtn').style.display = 'none';
    })
    .catch(error => console.error('Error al iniciar examen:', error));
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
        button.textContent = `${letra}: ${clave}`;
        button.onclick = () => responderPregunta(letra);
        opcionesDiv.appendChild(button);
      }
    });

    document.getElementById('preguntaCard').style.display = 'block'; // Mostrar la pregunta
  } else {
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
        document.getElementById('finalizarExamenBtn').style.display = 'inline-block';
      }
    })
    .catch(error => console.error('Error al enviar respuesta:', error));
}

function finalizarExamen() {
  const data = {
    id_b: userId,
    random_ids: randomIds
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
      correctas = resultados.correctas;
      incorrectas = questions.length - correctas;

      document.getElementById('finalizarExamenBtn').style.display = 'none';
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
