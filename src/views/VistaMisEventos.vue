<script setup>
import { computed } from 'vue'
import { useConciertosStore } from '@/stores/conciertos.js'
import CardConcierto from '@/components/CardConcierto.vue'

const storeConciertos = useConciertosStore()

// Filtro los conciertos generales para mostrar solo los que están en eventosUsuario
const misEventos = computed(() => {
    return storeConciertos.conciertos.filter(concierto =>
        storeConciertos.eventosUsuario.includes(concierto.id)
    )
})
</script>

<template>
    <section class="vista-mis-eventos">
        <h1 class="mb-4">Mis Eventos Guardados</h1>

        <div v-if="misEventos.length > 0" class="row g-4">
            <div v-for="concierto in misEventos" :key="concierto.id"
                class="col-md-6 col-lg-4 d-flex align-items-stretch">
                <CardConcierto :concierto="concierto" />
            </div>
        </div>
        <div v-else class="alert alert-secondary text-center">
            <p class="mb-0">Aún no has marcado ningún concierto como "Me interesa" o "Asistiré".</p>
        </div>
    </section>
</template>

<style scoped>
/* Estilos específicos si son necesarios */
</style>