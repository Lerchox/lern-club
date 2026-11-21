/*
 * Spanische Übersetzungen der Inhalte (Rätsel, Warum-Karten, Club).
 * Wird nach den anderen data/*.js geladen und fügt jedem Eintrag ein «es»-Feld hinzu.
 * Fehlt eine Übersetzung, zeigt die App automatisch Deutsch.
 */
(function () {
  const PZ = {
    p01: { q: "Mía tiene 3 hermanos. Cada uno de sus hermanos tiene 2 hermanas. ¿Cuántos hijos hay en la familia?",
           explain: "Las 2 hermanas son Mía y otra chica. 3 chicos + 2 chicas = 5." },
    p02: { q: "El reloj marca las 10:45. ¿Qué hora es 50 minutos después?",
           explain: "15 minutos hasta las 11:00 y luego 35 minutos más: 11:35." },
    p03: { q: "¿Qué número falta? 2, 4, 8, 16, ?, 64",
           explain: "Cada número es el doble del anterior: 16 · 2 = 32." },
    p04: { q: "En un dado normal, las caras opuestas siempre suman 7. ¿Qué número está opuesto al 2?",
           explain: "7 − 2 = 5." },
    p05: { q: "¿Qué número es el mayor?", opts: ["1/3", "0,45", "2/5", "0,5", "3/8"],
           explain: "1/3 ≈ 0,33; 2/5 = 0,4; 3/8 = 0,375. El mayor es 0,5." },
    p06: { q: "En el aula hay 5 filas con 6 sillas cada una. 7 sillas están vacías. ¿Cuántos niños están sentados?",
           explain: "5 · 6 = 30 sillas, 30 − 7 = 23." },
    p07: { q: "Un canguro salta siempre 3 m hacia delante y luego resbala 1 m hacia atrás. ¿En qué salto hacia delante está por primera vez a 10 m o más de la salida?",
           opts: ["3.º", "4.º", "5.º", "6.º", "10.º"],
           explain: "Después de cada salto está en 3, 5, 7, 9, 11 m. El 5.º salto llega a 11 m." },
    p08: { q: "Lea tiene 4 años más que Tim. Juntos tienen 20 años. ¿Cuántos años tiene Lea?",
           explain: "Tim 8, Lea 12: 8 + 12 = 20 y 12 − 8 = 4." },
    p09: { q: "¿Cuántos cuadrados ves en una cuadrícula de 2 × 2 casillas?",
           explain: "4 cuadrados pequeños y 1 grande alrededor = 5." },
    p10: { q: "Un cuaderno tiene las páginas 1 a 30. ¿Cuántas veces aparece la cifra 3 en los números de página?",
           explain: "3, 13, 23 y 30: cuatro veces." },
    p11: { q: "Alguien se comió el pastel. Anna dice: «Fue Ben.» Ben dice: «Yo no fui.» Cem dice: «Yo no fui.» Exactamente uno dice la verdad. ¿Quién fue?",
           opts: ["Anna", "Ben", "Cem", "Nadie", "No se puede saber"],
           explain: "Pruébalos todos: solo si fue Cem hay exactamente una frase verdadera (la de Ben)." },
    p12: { q: "Cinco números consecutivos suman 100. ¿Cuál es el mayor?",
           explain: "El del medio es 100 : 5 = 20. Entonces 18, 19, 20, 21, 22." },
    p13: { q: "Un rectángulo tiene un perímetro de 20 cm. Sus lados miden centímetros enteros. ¿Cuál es el área más grande posible?",
           explain: "Largo + ancho = 10. Lo máximo es 5 · 5 = 25." },
    p14: { q: "Hoy es miércoles. ¿Qué día de la semana será dentro de 100 días?",
           opts: ["jueves", "viernes", "sábado", "domingo", "miércoles"],
           explain: "100 = 14 · 7 + 2. Después de 14 semanas vuelve a ser miércoles, más 2 días = viernes." },
    p15: { q: "Se encuentran 5 niños. Cada uno da la mano a cada uno de los otros exactamente una vez. ¿Cuántos apretones de manos son?",
           explain: "4 + 3 + 2 + 1 = 10." },
  };

  const W = {
    w1: { title: "La escuela entrena el cerebro",
          punch: "Cada año de escuela te hace mediblemente más listo. No solo en datos, sino al pensar.",
          story: "Unos investigadores analizaron datos de más de 600 000 personas. Resultado: cada año extra de escuela sube el CI entre 1 y 5 puntos aproximadamente. La escuela es como un gimnasio para el cerebro, incluso los días en que no lo parece.",
          prompt: "¿En qué has notado que ahora sabes hacer algo mejor que el año pasado?" },
    w2: { title: "El saber gana al talento",
          punch: "Si sabes cosas, entiendes más. Aunque otros lean mejor que tú.",
          story: "En un experimento, unos niños leyeron un texto sobre un partido de béisbol. Los que leían mal pero sabían mucho de béisbol lo entendieron mejor que los muy buenos lectores que no sabían nada de béisbol. El saber es como una llave: abre puertas nuevas.",
          prompt: "¿De qué tema sabes tanto que podrías explicárselo a un adulto?" },
    w3: { title: "El saber crece como el interés compuesto",
          punch: "Quien empieza pronto, gana. El saber atrae más saber.",
          story: "Quien sabe y lee mucho aprende cosas nuevas cada vez más rápido, porque su cerebro tiene más ganchos donde colgar lo nuevo. La distancia con los demás crece cada año. Los investigadores lo llaman el efecto Mateo. Por eso el «Club» de esta app funciona como funciona.",
          prompt: "¿Qué te gustaría saber tan bien que te dé ventaja más adelante?" },
    w4: { title: "La IA es un amplificador",
          punch: "Cero por un amplificador sigue siendo cero. La IA solo te hace tan fuerte como ya eres.",
          story: "En Turquía, unos alumnos pudieron usar ChatGPT para practicar matemáticas. Al practicar les fue genial. Pero en el examen sin IA sacaron un 17 % menos que los que practicaron sin ella. La IA había pensado por ellos y su cerebro no había entrenado. Si tú sabes cosas, notas cuando la IA dice tonterías.",
          prompt: "¿Cuándo sería peligroso creerse sin más lo que dice una IA?" },
    w5: { title: "Difícil significa que creces",
          punch: "Cuando cuesta, es que estás aprendiendo.",
          story: "Los investigadores del aprendizaje descubrieron que lo que parece fácil (como leer algo por tercera vez) se olvida pronto. Lo que cuesta (preguntarte a ti mismo, equivocarte, volver a intentarlo) se queda mucho mejor. Como en el deporte: los músculos solo crecen con esfuerzo.",
          prompt: "¿Qué te costó al principio y ahora se te da muy bien?" },
    w6: { title: "Los profesionales entrenan lo aburrido",
          punch: "Los gamers profesionales también practican lo aburrido. Justo por eso son profesionales.",
          story: "En los e-sports, el fútbol o la música, los profesionales repiten lo básico miles de veces, aunque no sea divertido. En la escuela pasa lo mismo. Las tablas de multiplicar, la ortografía y el vocabulario son tu base. Si la dominas, puedes centrarte en lo emocionante.",
          prompt: "¿Qué habilidad básica de tu hobby has practicado más?" },
    w7: { title: "Aburrido, pero importante",
          punch: "Quien sabe para qué aprende, aguanta más.",
          story: "Unos adolescentes escribieron cómo podrían usar lo que aprenden para ayudar a otros o cambiar algo. Después aguantaron mucho más tiempo con tareas aburridas que los demás. Tu propio «porqué» es más fuerte que cualquier premio.",
          prompt: "¿A quién te gustaría ayudar con lo que sabes? ¿Qué te gustaría cambiar?" },
    w8: { title: "¿Quién controla tu tiempo?",
          punch: "Las redes sociales quieren tu tiempo. El saber te lo devuelve.",
          story: "Detrás de muchas apps hay equipos de profesionales cuyo trabajo es que te quedes el máximo tiempo posible: scroll infinito, likes, videos que empiezan solos. No es casualidad, es su negocio. Si lo descubres, decides tú. La pregunta es: ¿quién gana, tú o la app?",
          prompt: "¿Qué app te «roba» más tiempo? ¿Cómo podrías ganarle?" },
    w9: { title: "Explicar te hace listo",
          punch: "Si sabes explicarlo, lo has entendido de verdad.",
          story: "Quien enseña algo a otra persona lo aprende mejor que quien solo lo vuelve a leer. Por eso esta app tiene el quiz al revés: tú inventas preguntas para tus padres. ¡A ver quién sabe más!",
          prompt: "¿Qué podrías enseñar a tus padres que todavía no saben?" },
  };

  const C = {
    c01: { title: "El caballo de Troya",
           text: "Los griegos asediaron la ciudad de Troya durante diez años sin éxito. Entonces construyeron un enorme caballo de madera, escondieron soldados dentro y fingieron marcharse. Los troyanos metieron el «regalo» en la ciudad. Por la noche, los soldados salieron y abrieron las puertas.",
           seen: "Hoy un «troyano» es un virus informático que se disfraza de programa inofensivo.",
           q: "¿Qué había escondido dentro del caballo de madera?", opts: ["Oro", "Soldados", "Comida", "Una carta"] },
    c02: { title: "El talón de Aquiles",
           text: "De bebé, el héroe Aquiles fue sumergido en un río mágico y se volvió invulnerable, excepto en el talón por donde lo sujetaba su madre. Justo ahí le alcanzó una flecha más tarde.",
           seen: "«Es mi talón de Aquiles» significa: es mi punto débil. El tendón de Aquiles del pie también lleva su nombre.",
           q: "¿Qué significa hoy «talón de Aquiles»?", opts: ["Un corredor rápido", "Un punto débil", "Un zapato", "Un héroe"] },
    c03: { title: "Sísifo",
           text: "El rey Sísifo había engañado a los dioses. Como castigo tuvo que empujar una roca pesada montaña arriba para siempre. Justo antes de la cima, la roca siempre volvía a rodar hacia abajo.",
           seen: "Un «trabajo de Sísifo» es un trabajo pesado que nunca se acaba, como ordenar tu cuarto. 😉",
           q: "¿Qué es un trabajo de Sísifo?", opts: ["Un trabajo rápido", "Un trabajo que nunca se acaba", "Un trabajo en el jardín", "Un trabajo bien pagado"] },
    c04: { title: "La Carta Federal de 1291",
           text: "A principios de agosto de 1291, Uri, Schwyz y Unterwalden se prometieron ayuda mutua en una carta. Esta Carta Federal se considera el documento fundacional de la Confederación Suiza. Por eso la fiesta nacional suiza es el 1 de agosto.",
           seen: "Hogueras, farolillos y fuegos artificiales el 1 de agosto. La carta se guarda en el Museo de las Cartas Federales en Schwyz.",
           q: "¿En qué año se escribió la Carta Federal?" },
    c05: { title: "Guillermo Tell",
           text: "Según la leyenda, Guillermo Tell tuvo que disparar con su ballesta a una manzana sobre la cabeza de su hijo porque no quiso saludar el sombrero del alguacil Gessler. Nadie sabe si Tell existió de verdad. Se hizo famoso sobre todo por la obra de teatro del poeta alemán Friedrich Schiller (1804).",
           seen: "El monumento a Tell en Altdorf, la obertura de Guillermo Tell de Rossini, escenas con arco en películas y videojuegos.",
           q: "¿Quién escribió la famosa obra de teatro «Guillermo Tell»?", opts: ["Goethe", "Schiller", "Shakespeare", "El propio Tell"] },
    c06: { title: "Las pirámides de Guiza",
           text: "La Gran Pirámide de Egipto se construyó hace unos 4500 años como tumba del faraón Keops. Durante casi 4000 años fue el edificio más alto del mundo. No la construyeron esclavos, sino trabajadores con sueldo.",
           seen: "Assassin's Creed Origins, Astérix y Cleopatra, montones de documentales.",
           q: "¿Cuántos años tiene más o menos la Gran Pirámide?", opts: ["450 años", "1000 años", "4500 años", "45 000 años"] },
    c07: { title: "Gutenberg y la imprenta",
           text: "Hacia 1450, Johannes Gutenberg inventó en Maguncia la imprenta de tipos móviles. Antes, los libros se copiaban a mano. De repente, miles de personas podían leer lo que antes solo conocían unos pocos. Muchos la llaman la primera revolución de los medios; internet fue la siguiente.",
           seen: "Cada libro, cada periódico y, de forma indirecta, cada página web.",
           q: "¿Cómo se hacían los libros antes de Gutenberg?", opts: ["Con computadora", "Copiados a mano", "Con fotocopiadora", "No había libros"] },
    c08: { title: "La llegada a la Luna en 1969",
           text: "El 20 de julio de 1969, Neil Armstrong fue la primera persona en pisar la Luna. Su frase: «Es un pequeño paso para el hombre, pero un gran salto para la humanidad.» La computadora del Apolo 11 tenía menos potencia que una calculadora de hoy.",
           seen: "Películas como «Apolo 13» y «First Man», cohetes en Kerbal Space Program y mods de Minecraft.",
           q: "¿Quién fue la primera persona en pisar la Luna?", opts: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "Elon Musk"] },
    c09: { title: "Galileo Galilei",
           text: "Hacia 1610, Galileo fue uno de los primeros en apuntar un telescopio al cielo. Descubrió lunas que giran alrededor de Júpiter y estaba convencido: la Tierra gira alrededor del Sol, no al revés. La Iglesia le obligó a retractarse. Aun así, tenía razón.",
           seen: "La sonda espacial «Galileo» y el sistema europeo de navegación Galileo de tu celular.",
           q: "¿Qué descubrió Galileo con su telescopio?", opts: ["Lunas alrededor de Júpiter", "Agujeros negros", "El planeta Neptuno", "Extraterrestres"] },
    c10: { title: "Einstein en Berna",
           text: "De joven, Albert Einstein trabajó en la oficina de patentes de Berna. En su tiempo libre pensaba sobre la luz, el espacio y el tiempo. En 1905 publicó allí varios trabajos que cambiaron la física para siempre, entre ellos la famosa fórmula E = mc².",
           seen: "La Casa de Einstein en Berna. El GPS de tu celular solo funciona porque tiene en cuenta la relatividad de Einstein.",
           q: "¿En qué ciudad suiza trabajó Einstein en la oficina de patentes?", opts: ["Zúrich", "Basilea", "Berna", "Ginebra"] },
    c11: { title: "La Mona Lisa",
           text: "Leonardo da Vinci pintó la Mona Lisa hace más de 500 años. Hoy cuelga en el Louvre de París detrás de un cristal blindado. Leonardo no solo era pintor, también inventor: dibujó máquinas voladoras mucho antes de que existieran los aviones.",
           seen: "Innumerables memes y anuncios, y Leonardo como personaje en Assassin's Creed II.",
           q: "¿En qué museo cuelga la Mona Lisa?", opts: ["Louvre (París)", "British Museum (Londres)", "Kunsthaus Zürich", "MoMA (Nueva York)"] },
    c12: { title: "Wolfgang Amadeus Mozart",
           text: "Mozart nació en Salzburgo en 1756. Con 5 años compuso sus primeras piezas y de niño viajó por toda Europa, también por Suiza. Escribió más de 600 obras, aunque solo vivió 35 años.",
           seen: "Bombones Mozartkugeln, bandas sonoras, tonos de llamada y anuncios.",
           q: "¿En qué ciudad nació Mozart?", opts: ["Viena", "Salzburgo", "Berna", "Berlín"] },
    c13: { title: "Luchar contra molinos de viento",
           text: "En la novela española «Don Quijote de la Mancha» (1605), de Miguel de Cervantes, un hombre se cree caballero. Ve molinos de viento, cree que son gigantes y los ataca con su lanza. Por supuesto, pierde.",
           seen: "«Luchar contra molinos de viento» significa librar una batalla inútil contra algo que no se puede vencer. ¡Y es el libro más famoso escrito en español!",
           q: "¿Qué creía Don Quijote que eran los molinos?", opts: ["Castillos", "Gigantes", "Dragones", "Barcos"] },
    c14: { title: "Una victoria pírrica",
           text: "Hace más de 2000 años, el rey Pirro ganó una batalla contra los romanos, pero perdió tantos soldados que, según cuentan, dijo: «¡Otra victoria como esta y estamos perdidos!»",
           seen: "Una «victoria pírrica» cuesta tanto que en realidad es una derrota. Como ganar una partida y perder una noche entera de sueño.",
           q: "¿Qué es una victoria pírrica?", opts: ["Una victoria ajustada", "Una victoria que cuesta demasiado", "Una victoria en un incendio", "Un empate"] },
  };

  const add = (target, key, val) => {
    if (val === undefined) return;
    if (target[key] && typeof target[key] === "object" && !Array.isArray(target[key])) target[key].es = val;
    else if (Array.isArray(target[key])) target[key] = { de: target[key], en: target[key], es: val };
    else target[key] = { de: target[key], en: target[key], es: val };
  };
  const merge = (list, tr) => list.forEach((item) => {
    const t = tr[item.id];
    if (t) for (const k of Object.keys(t)) add(item, k, t[k]);
  });

  merge(window.PUZZLES, PZ);
  merge(window.WARUM, W);
  merge(window.CLUB, C);

  // Opciones solo con números: iguales en todos los idiomas, no hace falta traducir.
  // Ajustes del «Club» y frases del día
  window.CLUB_CATEGORIES.myth.es = "Mitos y leyendas";
  window.CLUB_CATEGORIES.history.es = "Historia";
  window.CLUB_CATEGORIES.science.es = "Ciencia";
  window.CLUB_CATEGORIES.art.es = "Arte y música";
  window.CLUB_CATEGORIES.words.es = "Expresiones";
  ["Invitado", "Curioso", "Socio", "Insider", "Socio de honor"].forEach((r, i) => (window.CLUB_RANKS[i].es = r));

  window.PUNCHLINES.es = [
    "La IA es un amplificador. Cero por un amplificador sigue siendo cero.",
    "Quien no sabe nada tiene que creérselo todo.",
    "Solo puedes preguntar a ChatGPT tan bien como tú piensas.",
    "Los gamers profesionales también entrenan lo aburrido. Por eso son profesionales.",
    "Las redes sociales quieren tu tiempo. El saber te lo devuelve.",
    "Si cuesta, algo está creciendo.",
    "El saber es como el interés compuesto: quien empieza pronto, gana.",
    "Los errores son datos, no derrotas.",
    "Si sabes explicarlo, lo has entendido.",
    "Todo nivel empieza en el nivel 1.",
  ];
})();
