<script setup>
const props = defineProps({
    ubicacion: {
        type: Object, // Espera el objeto { lat, lng }
        required: true
    }
})
</script>
<template>
    <div class="tarjeta-ubicacion alert alert-success d-flex align-items-center" role="status">
        <i class="bi bi-compass-fill me-3 fs-3 flex-shrink-0 icono-brillante"></i>
        <div class="flex-grow-1">
            <h4 class="alert-heading h5 mb-1">¡Ubicación Detectada!</h4>
            <p class="mb-0 small">
                Ordenando conciertos por cercanía...
            </p>
        </div>
    </div>
</template>

<style scoped>
.tarjeta-ubicacion {
    background-color: var(--bs-success-bg-subtle);
    border-color: var(--bs-success-border-subtle);
    color: var(--bs-success-text-emphasis);
    /* AURA */
    box-shadow: 0 0 1.5rem 0.25rem rgba(var(--bs-success-rgb), 0.35);
    animation: pulso-aura 2s infinite ease-in-out;
}

.alert-heading {
    color: inherit;
    font-family: var(--fuente-titulos);
}

.icono-brillante {
    /* Hacemos que el icono también brille un poco */
    filter: drop-shadow(0 0 0.5rem rgba(var(--bs-success-rgb), 0.7));
}

@keyframes pulso-aura {
    0% {
        box-shadow: 0 0 1.5rem 0.25rem rgba(var(--bs-success-rgb), 0.35);
    }

    50% {
        box-shadow: 0 0 2.5rem 0.25rem rgba(var(--bs-success-rgb), 0.5);
    }

    100% {
        box-shadow: 0 0 1.5rem 0.25rem rgba(var(--bs-success-rgb), 0.35);
    }
}
</style>