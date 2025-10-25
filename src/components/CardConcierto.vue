<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
// Importo el store para usar la acción de 'Asistiré' y verificar el estado
import { useConciertosStore } from '@/stores/conciertos.js'

// Defino las 'props' que este componente espera recibir desde el padre (Inicio.vue)
// En este caso, espero un objeto 'concierto' que tenga la información a mostrar.
const props = defineProps({
    concierto: {
        type: Object, // Espero un objeto
        required: true // Es obligatorio que me pasen esta prop
    }
})

// Inicializo el store para poder usar sus acciones y estado
const storeConciertos = useConciertosStore()

// Creo una propiedad computada para saber si el usuario ya marcó este concierto
const asistiendo = computed(() => storeConciertos.vaAAsistir(props.concierto.id))

// Función que se llamará al hacer clic en el botón 'Asistiré'/'Quitar'
function manejarAsistencia() {
    // Llamo a la acción del store para agregar o quitar el ID del concierto
    storeConciertos.alternarAsistencia(props.concierto.id)
}
</script>

<template>
    <div class="card-wrapper h-100">
        <article class="card h-100 shadow-sm d-flex flex-column tarjeta-concierto card-con-borde-animado">
            <img :src="props.concierto.imagen" class="card-img-top imagen-concierto"
                :alt="`Afiche o foto de ${props.concierto.artista}`" loading="lazy" />
            <div class="card-body d-flex flex-column">
                <h3 class="card-title h5 mb-2 titulo-artista">{{ props.concierto.artista }}</h3>
                <p class="card-text text-body-secondary small mb-1 info-lugar">
                    <i class="bi bi-geo-alt-fill me-1" aria-hidden="true"></i>
                    {{ props.concierto.lugar }}, {{ props.concierto.ciudad }}
                </p>
                <p class="card-text text-body-secondary small mb-3 info-fecha">
                    <i class="bi bi-calendar-event me-1" aria-hidden="true"></i>
                    {{ props.concierto.fecha }}
                </p>
                <p class="card-text fs-5 fw-semibold text-end mt-auto mb-3 precio">
                    ${{ props.concierto.precio }}
                </p>
                <div class="d-grid gap-2 d-sm-flex justify-content-sm-between align-items-center">
                    <RouterLink :to="{ name: 'detalle-concierto', params: { id: props.concierto.id } }"
                        class="btn btn-outline-light btn-sm flex-grow-1 flex-sm-grow-0">
                        Ver Detalles <i class="bi bi-arrow-right-short" aria-hidden="true"></i>
                    </RouterLink>
                    <button @click="manejarAsistencia"
                        :class="['btn btn-sm flex-grow-1 flex-sm-grow-0', asistiendo ? 'btn-success' : 'btn-outline-success']">
                        <i :class="['bi me-1', asistiendo ? 'bi-check-circle-fill' : 'bi-plus-circle']"
                            aria-hidden="true"></i>
                        {{ asistiendo ? 'Asistiré' : 'Me interesa' }}
                    </button>
                </div>
            </div>
        </article>
    </div>
</template>

<style scoped>
.card-wrapper {
    position: relative;
    /* Necesario para el posicionamiento absoluto del borde */
    padding: 3px;
    /* Espacio para que se vea el borde del pseudo-elemento */
    border-radius: calc(var(--radio-borde) + 3px);
    /* Radio exterior */
    overflow: hidden;
    /* Ocultar partes del gradiente que sobresalgan */
    z-index: 1;
    /* Asegurar que esté por encima de elementos normales */
}

/* Pseudo-elemento para el borde animado */
.card-wrapper::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -1;
    /* Detrás de la tarjeta real */
    margin: -3px;
    /* Expandir para cubrir el padding del wrapper */
    border-radius: inherit;
    /* Heredar el radio del wrapper */
    /* El gradiente, igual al del logo */
    background: linear-gradient(45deg, var(--color-primario), var(--color-secundario), var(--color-primario));
    background-size: 400% 400%;
    /* Tamaño más grande para la animación */
    animation: borde-animado 5s linear infinite;
    /* Aplicar animación */
    transition: opacity 0.3s;
    /* Transición suave por si queremos ocultarlo */
}

/* La tarjeta real dentro del wrapper */
.tarjeta-concierto.card-con-borde-animado {
    /* Ya tiene h-100 y estilos de card */
    /* Aseguramos que el fondo de la tarjeta tape el centro del gradiente */
    background-color: var(--bs-card-bg);
    /* El radio interno debe coincidir con el original */
    border-radius: var(--radio-borde);
    /* Quitamos el borde default de Bootstrap si existe, el wrapper lo simula */
    border: none;
    position: relative;
    /* Para asegurar apilamiento correcto */
    z-index: 1;
    /* Encima del pseudo-elemento */
}

/* Animación del borde */
@keyframes borde-animado {
    0% {
        background-position: 0% 50%;
    }

    50% {
        background-position: 100% 50%;
    }

    100% {
        background-position: 0% 50%;
    }
}


/* ... (resto de estilos: .imagen-concierto, .titulo-artista, etc. como antes) ... */
.imagen-concierto {
    height: 12.5rem;
    object-fit: cover;
    /* Radio solo arriba, ya que la tarjeta interna lo tiene */
    border-top-left-radius: var(--radio-borde);
    border-top-right-radius: var(--radio-borde);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

.titulo-artista {
    font-family: var(--fuente-titulos);
    color: var(--bs-emphasis-color);
}

.card-body {
    font-family: var(--fuente-parrafos);
}

.info-lugar,
.info-fecha {
    font-size: 0.875rem;
}

.precio {
    color: var(--color-texto-principal);
}

@media (max-width: 575.98px) {
    .d-grid>.btn+.btn {
        margin-top: 0.5rem;
    }
}
</style>