<script setup>
import { computed } from 'vue'

// Defino los 'modelos' que este componente manejará.
// 'defineModel' crea una prop reactiva y emite 'update:nombreModelo' automáticamente cuando el valor cambia internamente (gracias a v-model en los inputs).
const ciudad = defineModel('ciudad') // Vinculado a v-model:ciudad en el padre
const mes = defineModel('mes')   // Vinculado a v-model:mes
const anio = defineModel('anio')  // Vinculado a v-model:fecha en el padre

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

// Listas para los Dropdowns 
const meses = computed(() => [
    { valor: 0, nombre: 'Todos los Meses' },
    { valor: 1, nombre: 'Enero' },
    { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' },
    { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' },
    { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' },
    { valor: 12, nombre: 'Diciembre' }
])

// Creamos una lista de años (puedes hacerla más dinámica si quieres)
const anios = computed(() => [
    { valor: 0, nombre: 'Todos los Años' },
    { valor: 2025, nombre: '2025' },
    { valor: 2026, nombre: '2026' }
])
</script>

<template>
    <form @submit.prevent class="row g-3 mb-4 align-items-end" role="search">
        <div class="col-md-4 col-sm-12">
            <label for="filtroCiudad" class="form-label">Ciudad:</label>
            <!-- Uso v-model directamente con la variable definida por defineModel -->
            <input type="search" id="filtroCiudad" class="form-control border-light " v-model="ciudad"
                placeholder="Buscar por ciudad..." aria-label="Filtrar conciertos por ciudad" />
        </div>

        <div class="col-md-3 col-sm-6 text-white">
            <label for="filtroMes" class="form-label">Mes:</label>
            <select id="filtroMes" class="form-select" v-model.number="mes" aria-label="Filtrar por mes">
                <option v-for="m in meses" :key="m.valor" :value="m.valor">{{ m.nombre }}</option>
            </select>
        </div>

        <div class="col-md-2 col-sm-6">
            <label for="filtroAnio" class="form-label">Año:</label>
            <select id="filtroAnio" class="form-select" v-model.number="anio" aria-label="Filtrar por año">
                <option v-for="a in anios" :key="a.valor" :value="a.valor">{{ a.nombre }}</option>
            </select>
        </div>

        <div class="col-md-3 col-sm-12">
            <label class="form-label d-none d-md-block">&nbsp;</label> <button @click="solicitarUbicacion"
                class="btn btn-outline-light w-100" :disabled="props.buscandoUbicacion">
                <span v-if="props.buscandoUbicacion" class="spinner-border spinner-border-sm me-1" role="status"
                    aria-hidden="true"></span>
                <i v-else class="bi bi-geo-alt me-1"></i>
                {{ props.buscandoUbicacion ? 'Buscando...' : 'Usar mi ubicación' }}
            </button>
        </div>
    </form>
</template>

<style scoped>
.form-select {
    /* Tus estilos de estilos.css ya deberían cubrir esto, pero por si acaso */
    background-color: var(--bs-form-control-bg);
    color: var(--bs-form-control-color);
    border-color: var(--bs-form-control-border-color);
}

.btn:disabled {
    cursor: wait;
}
</style>