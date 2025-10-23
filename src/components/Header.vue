<template>
    <header class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3 sticky-top">
        <div class="container">
            <RouterLink class="navbar-brand d-flex align-items-center" :to="{ name: 'inicio' }">
                <i class="bi bi-music-note-beamed fs-2 me-2"></i>
                <span class="fs-4 fw-bold">SoundSpot</span>
            </RouterLink>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <nav class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <RouterLink class="nav-link" active-class="active" :to="{ name: 'inicio' }">
                            <i class="bi bi-house-door-fill me-1"></i> Inicio
                        </RouterLink>
                    </li>
                </ul>
            </nav>
        </div>
    </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'

</script>

<style scoped>
/* .navbar-brand span { */
/* Ajuste fino del nombre de la app por si es necesario */
/* } */

/* Bootstrap active class se aplica automáticamente por RouterLink */
.nav-link.active {
    font-weight: bold;
    border-bottom: 2px solid var(--bs-primary);
}
</style>