<script setup>
import { ref } from 'vue'

// Defino los 'modelos' que este componente manejará.
// 'defineModel' crea una prop reactiva y emite 'update:nombreModelo' automáticamente cuando el valor cambia internamente (gracias a v-model en los inputs).
const ciudad = defineModel('ciudad') // Vinculado a v-model:ciudad en el padre
const fecha = defineModel('fecha')   // Vinculado a v-model:fecha en el padre

// Defino una prop normal para saber si se está buscando la ubicación
const props = defineProps({
    buscandoUbicacion: {
        type: Boolean,
        default: false
    }
})

// Defino los eventos que este componente puede emitir hacia el padre.
const emit = defineEmits(['buscarUbicacion'])

// Función simple que solo emite el evento cuando se hace clic en el botón.
// La lógica de geolocalización sigue estando en el componente padre (Inicio.vue).
function solicitarUbicacion() {
    emit('buscarUbicacion')
}
</script>

<template>
    <form @submit.prevent class="row g-3 mb-4 align-items-end" role="search">
        <div class="col-md-4">
            <label for="filtroCiudad" class="form-label">Ciudad:</label>
            <!-- Uso v-model directamente con la variable definida por defineModel -->
            <input type="search" id="filtroCiudad" class="form-control border-light " v-model="ciudad"
                placeholder="Buscar por ciudad..." aria-label="Filtrar conciertos por ciudad" />
        </div>
        <div class="col-md-4 text-white">
            <label for="filtroFecha" class="form-label">Fecha:</label>
            <!-- Uso v-model directamente con la variable definida por defineModel -->
            <input type="date" id="filtroFecha" class="form-control border-light" v-model="fecha"
                aria-label="Filtrar conciertos por fecha" />
        </div>
        <div class="col-md-4">
            <!-- Llamo a solicitarUbicacion al hacer clic -->
            <!-- Uso la prop 'buscandoUbicacion' para deshabilitar -->
            <button @click="solicitarUbicacion" class="btn btn-outline-light w-100" :disabled="props.buscandoUbicacion">
                <span v-if="props.buscandoUbicacion" class="spinner-border spinner-border-sm me-1" role="status"
                    aria-hidden="true"></span>
                <i v-else class="bi bi-geo-alt me-1"></i>
                {{ props.buscandoUbicacion ? 'Buscando...' : 'Usar mi ubicación' }}
            </button>
        </div>
    </form>
</template>

<style scoped>
.btn:disabled {
    cursor: wait;
}
</style>