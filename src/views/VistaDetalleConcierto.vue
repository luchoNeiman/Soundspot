<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
// useRoute para leer parámetros de la URL, useRouter para navegar
import { useRoute, useRouter } from 'vue-router'
// Importo el store para buscar el concierto y manejar asistencia
import { useConciertosStore } from '@/stores/conciertos.js'
// Importo Leaflet para el mapa
import L from 'leaflet'
// Importo los estilos de Leaflet
import 'leaflet/dist/leaflet.css'

// Obtenemos acceso a la ruta actual y al router
const route = useRoute()
const router = useRouter()
const storeConciertos = useConciertosStore()

// Obtenemos el ID del concierto desde la URL (ej: /concierto/3 -> id = '3')
const conciertoId = computed(() => parseInt(route.params.id)) // Convertimos a número

// Buscamos el concierto en el store usando el ID de la ruta
// Usamos computed para que se recalcule si el store cambia (aunque aquí no debería)
const concierto = computed(() => {
    return storeConciertos.conciertos.find(c => c.id === conciertoId.value)
})

// Estado para el botón "Asistiré"
const asistiendo = computed(() => {
    // Verificamos si 'concierto' existe antes de acceder a su id
    return concierto.value ? storeConciertos.vaAAsistir(concierto.value.id) : false
})

function manejarAsistencia() {
    if (concierto.value) {
        storeConciertos.alternarAsistencia(concierto.value.id)
    }
}

// --- Lógica del Mapa Leaflet ---
const mapContainer = ref(null) // Referencia al div del mapa en el template
let mapInstance = null // Variable para guardar la instancia del mapa

// Función para inicializar el mapa
function inicializarMapa() {
    if (mapContainer.value && concierto.value && !mapInstance) {
        // Creo el mapa y lo centro en las coordenadas del concierto
        mapInstance = L.map(mapContainer.value).setView([concierto.value.lat, concierto.value.lng], 15); // Zoom 15

        // Añado una capa de tiles (mapa base) de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);

        // Añado un marcador en la ubicación del concierto
        L.marker([concierto.value.lat, concierto.value.lng]).addTo(mapInstance)
            .bindPopup(`<b>${concierto.value.lugar}</b><br>${concierto.value.artista}`) // Popup al hacer clic
            .openPopup(); // Abrir popup por defecto
    }
}

// Función para destruir el mapa (evita errores al cambiar de página)
function destruirMapa() {
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }
}

// Inicializo el mapa cuando el componente se monta y tengo el concierto
onMounted(() => {
    // Espero a que 'concierto' tenga valor (si carga asíncrono en el futuro)
    watch(concierto, (nuevoConcierto) => {
        if (nuevoConcierto) {
            // Pequeña demora para asegurar que el DOM esté listo
            setTimeout(inicializarMapa, 100);
        }
    }, { immediate: true }); // immediate: true para ejecutarlo la primera vez también
});

// Destruyo el mapa cuando el componente se desmonta (cambio de página)
onUnmounted(() => {
    destruirMapa();
});

// Función para volver a la página anterior
function volverAtras() {
    router.back() // O router.push({ name: 'inicio' })
}
</script>

<template>
    <!-- Usamos <article> para el contenido principal del detalle -->
    <article v-if="concierto" class="detalle-concierto">
        <div class="row g-4 g-lg-5">
            <!-- Columna Izquierda: Imagen e Info -->
            <div class="col-lg-6">
                <header class="mb-4">
                    <h1 class="titulo-artista display-5">{{ concierto.artista }}</h1>
                    <p class="lead text-body-secondary">{{ concierto.lugar }}, {{ concierto.ciudad }}</p>
                </header>
                <figure class="mb-4 shadow rounded overflow-hidden">
                    <img :src="concierto.imagen" class="img-fluid" :alt="`Foto o afiche de ${concierto.artista}`" />
                </figure>

                <section class="info-adicional">
                    <h2 class="h4 mb-3">Detalles del Evento</h2>
                    <p><i class="bi bi-calendar-event me-2 icono-detalle"></i> Fecha: <strong>{{ concierto.fecha
                    }}</strong></p>
                    <p><i class="bi bi-cash-coin me-2 icono-detalle"></i> Precio: <strong>${{ concierto.precio
                    }}</strong></p>
                    <!-- Podrías añadir más detalles aquí si la API los proveyera -->
                </section>
            </div>

            <!-- Columna Derecha: Mapa y Acciones -->
            <div class="col-lg-6 d-flex flex-column">
                <section class="mapa-seccion mb-4 flex-grow-1" aria-label="Mapa de ubicación del evento">
                    <h2 class="h4 mb-3">Ubicación</h2>
                    <!-- Contenedor del mapa con altura definida -->
                    <div ref="mapContainer" class="mapa-leaflet shadow rounded"></div>
                </section>

                <!-- Botones de Acción -->
                <div class="d-grid gap-2 mt-auto">
                    <button @click="manejarAsistencia"
                        :class="['btn', asistiendo ? 'btn-success' : 'btn-outline-success']">
                        <i :class="['bi me-2', asistiendo ? 'bi-check-circle-fill' : 'bi-plus-circle']"
                            aria-hidden="true"></i>
                        {{ asistiendo ? 'Asistiré' : 'Me interesa' }}
                    </button>
                    <button @click="volverAtras" class="btn btn-secondary">
                        <i class="bi bi-arrow-left me-2" aria-hidden="true"></i> Volver al listado
                    </button>
                </div>
            </div>
        </div>
    </article>

    <!-- Mensaje si el concierto no se encuentra -->
    <div v-else class="alert alert-danger text-center" role="alert">
        <h2 class="h4">Concierto no encontrado</h2>
        <p>No pudimos encontrar los detalles para este concierto.</p>
        <button @click="volverAtras" class="btn btn-secondary mt-3">
            <i class="bi bi-arrow-left me-2" aria-hidden="true"></i> Volver al listado
        </button>
    </div>
</template>

<style scoped>
.detalle-concierto {
    /* Espaciado general si es necesario */
    padding-top: 1rem;
}

.titulo-artista {
    font-family: var(--fuente-titulos);
    color: var(--bs-emphasis-color);
    font-weight: 700;
    /* Asegurar bold */
}

.lead {
    font-family: var(--fuente-parrafos);
}

figure img {
    width: 100%;
    /* Asegurar que la imagen ocupe el contenedor */
}

.info-adicional p {
    font-family: var(--fuente-parrafos);
    font-size: 1.1rem;
    /* Ligeramente más grande */
    margin-bottom: 0.75rem;
}

.icono-detalle {
    color: var(--color-secundario);
    /* Color de acento para iconos */
    min-width: 1.5em;
    /* Espacio reservado para el icono */
    display: inline-block;
    /* Para alinear correctamente */
}

.mapa-seccion {
    /* Asegurar que la sección del mapa pueda crecer */
    display: flex;
    flex-direction: column;
    min-height: 25rem;
    /* Altura mínima para el mapa */
}

.mapa-leaflet {
    width: 100%;
    /* height: 25rem; */
    /* 400px aprox */
    flex-grow: 1;
    /* Ocupa el espacio disponible en la columna flex */
    z-index: 1;
    /* A veces necesario para que los controles del mapa funcionen */
}

/* Ajuste para asegurar que los popups de Leaflet tengan el estilo oscuro */
:deep(.leaflet-popup-content-wrapper),
:deep(.leaflet-popup-tip) {
    background: var(--color-superficie);
    color: var(--color-texto-principal);
    box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4);
}

:deep(.leaflet-popup-content a) {
    color: var(--color-secundario);
}

:deep(.leaflet-control-attribution a) {
    color: var(--color-texto-secundario);
    /* Hacer link de atribución menos prominente */
}

:deep(.leaflet-control-attribution) {
    background: rgba(var(--color-fondo-rgb), 0.8) !important;
    color: var(--color-texto-secundario);
}


.d-grid .btn {
    padding-top: 0.75rem;
    /* Botones un poco más altos */
    padding-bottom: 0.75rem;
    font-size: 1.1rem;
}
</style>