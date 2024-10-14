function getRandomPathImg() {
    let random = Math.floor(Math.random() * 20) + 1;
    return random < 10 ? `src/img/card/robot_0${random}.png` : `src/img/card/robot_${random}.png`;
}

class Carta {
    constructor(tipo, puntos, imagen) {
        this.tipo = tipo;
        this.puntos = puntos;
        this.imagen = imagen;
    }
}

class Jugador {
    constructor(nombre) {
        this.nombre = nombre;
        this.cartas = [];
        this.eliminado = false;
    }

    agregarCarta(carta) {
        this.cartas.push(carta);
    }

    eliminarCarta(carta) {
        const index = this.cartas.indexOf(carta);
        if (index !== -1) {
            this.cartas.splice(index, 1);
        }
    }

    getNombre() {
        return this.nombre;
    }

    isEliminado() {
        return this.eliminado;
    }

    setEliminado(eliminado) {
        this.eliminado = eliminado;
    }

    calcularPuntos() {
        return this.cartas.reduce((sum, carta) => sum + (carta.puntos || 0), 0);
    }
}

class Mazo {
    constructor() {
        this.cartas = [];
    }

    init() {
        this.cartas = [];
        for (let i = 0; i < 6; i++) {
            this.cartas.push(new Carta('Bomba', null, 'src/img/bomba/bomba.png'));
            this.cartas.push(new Carta('Desactivacion', null, 'src/img/herramienta/herramienta.png'));
        }
        for (let i = 0; i < 10; i++) {
            this.cartas.push(new Carta('SaltarTurno', null, 'src/img/pasarTurno/pasarTurno.png'));
        }
        for (let i = 0; i < 33; i++) {
            const puntos = Math.floor(Math.random() * 10) + 1;
            const imagen = getRandomPathImg();
            this.cartas.push(new Carta('Puntos', puntos, imagen));
        }
    }

    barajar() {
        for (let i = this.cartas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cartas[i], this.cartas[j]] = [this.cartas[j], this.cartas[i]];
        }
    }

    robarCarta() {
        return this.cartas.pop();
    }

    getCartas() {
        return this.cartas;
    }
}

const mazo = new Mazo();
mazo.init();

const jugador1 = new Jugador('Jugador 1');
const jugador2 = new Jugador('Jugador 2');
const jugador3 = new Jugador('Jugador 3');

mazo.barajar();

const btnRobar = document.getElementById('btnRobar');
const btnPasar = document.getElementById('btnPasar');
const btnReiniciar = document.getElementById('btnReiniciar');
const imgCartaRobada = document.getElementById('imgCartaRobada');
const jugadores = [jugador1, jugador2, jugador3];
let turnoActual = 0;

btnRobar.addEventListener('click', robarCarta);
btnPasar.addEventListener('click', pasarTurno);
btnReiniciar.addEventListener('click', resetearJuego);

function robarCarta() {
    const cartaRobada = mazo.robarCarta();
    imgCartaRobada.src = cartaRobada.imagen;
    jugadores[turnoActual].agregarCarta(cartaRobada);
    
    if (cartaRobada.tipo === 'Bomba') {
        const cartaDesactivacion = jugadores[turnoActual].cartas.find(carta => carta.tipo === 'Desactivacion');
        if (cartaDesactivacion) {
            jugadores[turnoActual].eliminarCarta(cartaDesactivacion);
        } else {
            jugadores[turnoActual].setEliminado(true);
            jugadores[turnoActual].cartas = []; // Reiniciar cartas
            do {
                turnoActual = (turnoActual + 1) % 3;
            } while (jugadores[turnoActual].isEliminado());
        }
    }
    
    actualizarEstadisticas();
    verificarGanador();
}

function pasarTurno() {
    const cartaSaltarTurno = jugadores[turnoActual].cartas.find(carta => carta.tipo === 'SaltarTurno');
    if (cartaSaltarTurno) {
        jugadores[turnoActual].eliminarCarta(cartaSaltarTurno);
    } else {
        return;
    }

    do {
        turnoActual = (turnoActual + 1) % 3;
    } while (jugadores[turnoActual].isEliminado());

    actualizarEstadisticas();
    verificarGanador();
}

function actualizarEstadisticas() {
    jugadores.forEach((jugador, index) => {
        const numCartasElem = document.getElementById(`J${index + 1}NumCartas`);
        const puntosElem = document.getElementById(`J${index + 1}Puntos`);
        const saltoTurnoElem = document.getElementById(`J${index + 1}saltoTurno`);
        const desactivacionElem = document.getElementById(`J${index + 1}Desactivacion`);
        const nombreElem = document.getElementById(`J${index + 1}Nombre`);

        nombreElem.classList.remove('current-player');

        numCartasElem.innerHTML = `⚪️ Número de cartas: ${jugador.cartas.length}`;
        puntosElem.innerHTML = `⚪️ Puntos totales: ${jugador.calcularPuntos()}`;
        saltoTurnoElem.innerHTML = `⚪️ Cartas salto turno: ${jugador.cartas.filter(carta => carta.tipo === 'SaltarTurno').length}`;
        desactivacionElem.innerHTML = `⚪️ Cartas desactivación: ${jugador.cartas.filter(carta => carta.tipo === 'Desactivacion').length}`;
    });

    const currentPlayer = jugadores[turnoActual];
    const nombreElem = document.getElementById(`J${turnoActual + 1}Nombre`);
    nombreElem.classList.add('current-player');
}

function verificarGanador() {
    const jugadoresVivos = jugadores.filter(jugador => !jugador.isEliminado());

    if (jugadoresVivos.length === 1) {
        const ganador = jugadoresVivos[0];
        alert(`El ganador es: ${ganador.getNombre()}`);
        resetearJuego();
    } else if (mazo.getCartas().length === 0) {
        const ganador = jugadoresVivos.reduce((prev, current) => {
            return (prev.calcularPuntos() > current.calcularPuntos()) ? prev : current;
        });

        alert(`El ganador por puntos es: ${ganador.getNombre()}`);
        resetearJuego();
    }
}

function resetearJuego() {
    jugadores.forEach(jugador => {
        jugador.cartas = [];
        jugador.setEliminado(false);
    });
    
    mazo.init();
    mazo.barajar();

    turnoActual = 0;
    imgCartaRobada.src = '';
    actualizarEstadisticas();
}

resetearJuego();