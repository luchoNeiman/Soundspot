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
                    <template v-if="props.concierto.precio.disponible">
                        <template v-if="props.concierto.precio.min === props.concierto.precio.max">
                            {{ props.concierto.precio.moneda }} ${{ props.concierto.precio.min }}
                        </template>
                        <template v-else>
                            {{ props.concierto.precio.moneda }} ${{ props.concierto.precio.min }} - ${{
                                props.concierto.precio.max }}
                        </template>
                    </template>
                    <template v-else>
                        Precio a confirmar
                    </template>
                </p>
                <div class="d-grid gap-2 d-sm-flex justify-content-sm-between align-items-center">
                    <RouterLink :to="{ name: 'detalle-concierto', params: { id: props.concierto.id } }"
                        class="btn btn-outline-light btn-sm flex-grow-1 flex-sm-grow-0">
                        Ver Detalles
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
    padding: 3px;
    border-radius: calc(var(--radio-borde) + 3px);
    overflow: hidden;
    z-index: 1;
    display: flex;
    min-height: 26rem;
    transition: transform 0.3s ease-in-out;
}

.card-wrapper:hover {
    transform: translateY(-8px);
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
    margin: -3px;
    border-radius: inherit;
    background: linear-gradient(45deg, var(--color-primario), var(--color-secundario), var(--color-primario));
    background-size: 400% 400%;
    animation: borde-animado 5s linear infinite;
    transition: opacity 0.3s;
}

/* La tarjeta real dentro del wrapper */
.tarjeta-concierto.card-con-borde-animado {
    background-color: var(--bs-card-bg);
    border-radius: var(--radio-borde);
    border: none;
    position: relative;
    z-index: 1;
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


.imagen-concierto {
    aspect-ratio: 16/10;
    width: 100%;
    min-height: 12.5rem;
    object-fit: cover;
    object-position: center;
    border-top-left-radius: var(--radio-borde);
    border-top-right-radius: var(--radio-borde);
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    transition: transform 0.5s ease;
}

.card-wrapper:hover .imagen-concierto {
    transform: scale(1.05);
}

.titulo-artista {
    font-family: var(--fuente-titulos);
    color: var(--bs-emphasis-color);
    transition: color 0.3s ease;
    position: relative;
    display: inline-block;
}

.card-wrapper:hover .titulo-artista {
    color: var(--color-secundario);
}

.titulo-artista::after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: -2px;
    left: 0;
    background: var(--color-secundario);
    transition: width 0.3s ease;
}

.card-wrapper:hover .titulo-artista::after {
    width: 100%;
}

.card-body {
    font-family: var(--fuente-parrafos);
}

.info-lugar,
.info-fecha {
    font-size: 0.875rem;
    transition: transform 0.3s ease, color 0.3s ease;
}

.card-wrapper:hover .info-lugar,
.card-wrapper:hover .info-fecha {
    transform: translateX(5px);
    color: var(--color-texto-principal) !important;
}

.card-wrapper:hover .info-lugar i,
.card-wrapper:hover .info-fecha i {
    color: var(--color-secundario);
}

.precio {
    color: var(--color-texto-principal);
    transition: transform 0.3s ease, color 0.3s ease;
}

.card-wrapper:hover .precio {
    transform: scale(1.05);
    color: var(--color-secundario);
}

@media (max-width: 575.98px) {
    .d-grid>.btn+.btn {
        margin-top: 0.5rem;
    }
}

/* Animaciones para los botones */
.btn {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.card-wrapper:hover .btn {
    transform: translateY(-2px);
}

.btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s ease, height 0.6s ease;
}

.btn:hover::before {
    width: 300%;
    height: 300%;
}

/* Efecto de brillo en el borde animado */
.card-wrapper:hover::before {
    animation: borde-animado 3s linear infinite, brillo 2s ease-in-out infinite;
}

@keyframes brillo {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.7;
    }
}
</style>