<template>
    <header class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-lg-0 sticky-top">
        <div class="container">
            <RouterLink class="navbar-brand d-flex align-items-center py-3" :to="{ name: 'inicio' }">
                <i class="bi bi-music-note-beamed fs-2 me-2" aria-hidden="true"></i> <span
                    class="fs-4 fw-bold">SoundSpot</span>
            </RouterLink>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navegacionPrincipal"
                aria-controls="navegacionPrincipal" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <nav class="collapse navbar-collapse" id="navegacionPrincipal">
                <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <RouterLink class="nav-link px-lg-3 py-lg-4" active-class="active" :to="{ name: 'inicio' }">
                            <i class="bi bi-house-door-fill me-1 d-lg-none" aria-hidden="true"></i> Inicio
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
.navbar {
    min-height: 4rem;
}

/* .navbar-brand {
} */

.nav-link {
    font-family: var(--fuente-parrafos);
    font-weight: 500;
    transition: color 0.15s ease-in-out;
}

.nav-link.active {
    color: var(--bs-white);
    font-weight: 700;
    border-bottom: 3px solid var(--color-secundario);
}

/* Ajustar padding vertical en pantallas grandes para que ocupe más altura */
@media (min-width: 992px) {

    /* breakpoint lg de Bootstrap */
    .nav-link {
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
    }
}
</style>