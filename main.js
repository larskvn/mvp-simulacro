document.addEventListener('DOMContentLoaded', function() {
  let userId = null;
  let currentQuestionIndex = 0;
  let questions = [];
  let randomIds = [];

  document.getElementById('probarmeBtn').addEventListener('click', generarId);
  document.getElementById('iniciarExamenBtn').addEventListener('click', iniciarExamen);

  function generarId() {
    // Llamada a la API para generar ID de usuario
    fetch('https://simulacro-dlo9.onrender.com/generate_id', {
      method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
      userId = data.id;
      alert(`ID de usuario generado: ${userId}`);
      document.getElementById('probarmeScreen').style.display = 'none';
      document.getElementById('examenScreen').style.display = 'block';
    })
    .catch(error => console.error('Error al generar ID:', error));
  }

  function iniciarExamen() {
    // Llamada a la API para obtener preguntas aleatorias
    fetch('https://simulacro-dlo9.onrender.com/random_questions')
      .then(response => response.json())
      .then(data => {
        questions = data;
        randomIds = questions.map(q => q.id);
        mostrarPregunta(0);
        document.getElementById('iniciarExamenBtn').style.display = 'none';
      })
      .catch(error => console.error('Error al iniciar examen:', error));
  }

  function mostrarPregunta(index) {
    if (index < questions.length) {
      const pregunta = questions[index];
      document.getElementById('preguntaTexto').textContent = pregunta.pregunta;

      ['A', 'B', 'C', 'D'].forEach(letra => {
        document.getElementById(`opcion${letra}`).onclick = () => responderPregunta(letra);
      });

      document.getElementById('preguntaCard').style.display = 'block';
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
    .then(data => {
      alert(`Respuesta ${respuesta} guardada para la pregunta ${currentQuestionIndex + 1}`);
      mostrarSiguientePregunta();
    })
    .catch(error => console.error('Error al enviar respuesta:', error));
  }

  function mostrarSiguientePregunta() {
    currentQuestionIndex++;
    mostrarPregunta(currentQuestionIndex);
  }

  document.getElementById('finalizarExamenBtn').addEventListener('click', finalizarExamen);

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
      const incorrectas = resultados.incorrectas !== undefined ? resultados.incorrectas : 0;

      document.getElementById('finalizarExamenBtn').style.display = 'none';
      document.getElementById('resultado').style.display = 'block';
      document.getElementById('correctas').textContent = `Correctas: ${resultados.correctas}`;
      document.getElementById('incorrectas').textContent = `Incorrectas: ${incorrectas}`;
    })
    .catch(error => {
      console.error('Error al finalizar examen:', error);
      alert('Hubo un error al obtener los resultados del examen.');
    });
  }
});
