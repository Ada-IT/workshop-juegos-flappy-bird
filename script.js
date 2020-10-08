// Obtenemos el canvas del documento
var canvas = document.getElementById('canvas')
// Definimos un contexto para dibujar y de qué forma
var ctx = canvas.getContext('2d')

// Variables de inicializacion

var cuadros = 0
var juegoTerminado = false

var JUEGO = {
  ANCHO: 288,
  ALTO: 624,
  GRAVEDAD: 6,
  DELAY_INICIO: 0,
}

var suelo = {
  x: 0,
  altura: 112,
}

var pajaro = {
  sprite: new Image(),
  src: 'assets/sprites/yellowbird-midflap.png',
  x: 50,
  y: 200,
  tiempoVolando: 0,
  rotacion: 0,
}

var tuberiaSprite = new Image()

var tuberias = [
  { x: JUEGO.ANCHO - 100, y: 0 }, //tuberia
]

// Funciones por cuadro

function dibujarFondo() {
  var background = new Image()
  background.src = 'assets/sprites/background-day.png'
  ctx.drawImage(background, 0, 0)
}

function dibujarSuelo() {
  // Creamos el sprite
  var suelo = new Image()
  suelo.src = 'assets/sprites/base.png'

  // Corremos el suelo uno a la izquierda
  suelo.x--

  // Si se pasa de la pantalla, lo volvemos a la posición inicial
  if (suelo.x < -suelo.width) {
    suelo.x = 0
  }

  // Dibujamos dos suelos pegados
  ctx.drawImage(suelo, suelo.x, 512)
  ctx.drawImage(suelo, suelo.x + suelo.width, 512)
}

function agregarTuberias() {
  // Si la última tubería del array pasó el lado derecho de la pantalla
  // (o sea, entró en pantalla)
  // creamos una nueva con una posición Y random y la agregamos al array

  if (tuberias[tuberias.length - 1].x < JUEGO.ANCHO) {
    var posY = Math.round(Math.random() * 200)
    tuberias.push({ x: JUEGO.ANCHO + 150, y: posY })
  }
}

function limpiarTuberias() {
  // Si la última tubería salió de la pantalla
  // la sacamos del array
  if (tuberias[0].x < -tuberiaSprite.width) {
    tuberias.shift()
  }
}

function dibujarTuberias() {
  tuberiaSprite.src = 'assets/sprites/pipe-green.png'

  // Recorremos las tuberias
  for (var i = 0; i < tuberias.length; i++) {
    // Accedemos a la posicion de la tuberia
    tuberias[i].x--
    var posX = tuberias[i].x
    var posY = JUEGO.ALTO - tuberiaSprite.height - suelo.altura + tuberias[i].y
    // Dibujamos una tuberia en su posicion
    ctx.drawImage(tuberiaSprite, posX, posY)

    // Dibujamos una nueva tubería rotada y arriba
    ctx.save()
    ctx.translate(posX + tuberiaSprite.width / 2, 0)
    ctx.rotate((Math.PI / 180) * 180)
    ctx.drawImage(
      tuberiaSprite,
      -tuberiaSprite.width / 2,
      -tuberiaSprite.height + 140 - tuberias[i].y + suelo.altura
    )
    ctx.restore()
  }

  agregarTuberias()
  limpiarTuberias()
}

function actualizarSpritePajaro() {
  if (pajaro.src === 'assets/sprites/yellowbird-midflap.png') {
    pajaro.src = 'assets/sprites/yellowbird-downflap.png'
  } else if (pajaro.src === 'assets/sprites/yellowbird-downflap.png') {
    pajaro.src = 'assets/sprites/yellowbird-upflap.png'
  } else {
    pajaro.src = 'assets/sprites/yellowbird-midflap.png'
  }
}

function actualizarPosicionPajaro() {
  if (pajaro.tiempoVolando > 0) {
    // Esta volando
    pajaro.tiempoVolando--
    pajaro.y -= 5
  } else {
    pajaro.y += JUEGO.GRAVEDAD
  }

  // Rotamos el pájaro
  if (pajaro.rotacion < 90) {
    pajaro.rotacion += 3
  }
}

function dibujarPajaro() {
  // Cada 4 cuadros por segundo actualizamos el sprite
  if (cuadros % 4 === 0) {
    actualizarSpritePajaro()
  }

  if (cuadros > JUEGO.DELAY_INICIO) {
    actualizarPosicionPajaro()
  }

  pajaro.sprite.src = pajaro.src

  // Dibujamos el pájaro con la rotación actual
  ctx.save()
  ctx.translate(
    pajaro.x + pajaro.sprite.width / 2,
    pajaro.y + pajaro.sprite.height / 2
  )
  ctx.rotate((Math.PI / 180) * pajaro.rotacion)
  ctx.drawImage(
    pajaro.sprite,
    -pajaro.sprite.width / 2,
    -pajaro.sprite.height / 2
  )
  ctx.restore()
}

function dibujar() {
  dibujarFondo()
  dibujarTuberias()
  dibujarSuelo()
  dibujarPajaro()
}

function chequearColisiones() {
  // Si choca el suelo
  if (pajaro.y + pajaro.sprite.height > JUEGO.ALTO - suelo.altura) {
    juegoTerminado = true
  }

  // Si se choca cada tubería
  // Tenemos que chequear que el lado derecho del pájaro
  // no esté entre el borde izquierdo y derecho de cada tubería
  // Y que su borde superior no estén por debajo o por encima de cada tubería
  for (var i = 0; i < tuberias.length; i++) {
    var tuberia = tuberias[i]
    var margen = 5 // Este margen es para que la "caja" de colisiones del pájaro sea un poco más chica que el cuadrado del sprite
    if (
      pajaro.x + pajaro.sprite.width - margen > tuberia.x &&
      pajaro.x + pajaro.sprite.width - margen <
        tuberia.x + tuberiaSprite.width &&
      (pajaro.y + pajaro.sprite.height - margen >
        JUEGO.ALTO - tuberiaSprite.height - suelo.altura + tuberias[i].y ||
        pajaro.y + margen <
          tuberiaSprite.height - 140 + tuberias[i].y - suelo.altura)
    ) {
      juegoTerminado = true
    }
  }
}

function volar() {
  if (cuadros > JUEGO.DELAY_INICIO) {
    pajaro.tiempoVolando = 10
    pajaro.rotacion = -40
  }
}

// Game Loop - Bucle principal
// Por cada cuadro
// - Borra el canvas
// - Dibuja todo
// - Chequea si hay colisiones
function ejecutar() {
  if (!juegoTerminado) {
    cuadros++
    ctx.clearRect(0, 0, 480, 640) // Borra el canvas
    dibujar()
    chequearColisiones()
    window.requestAnimationFrame(ejecutar)
  } else {
    // alert('Game over!')
  }
}

window.requestAnimationFrame(ejecutar)
window.addEventListener('keypress', volar)
