<template>
    <header class="navbar navbar-expand-lg navbar-dark shadow-sm py-lg-0 sticky-top">
        <div class="container">
            <RouterLink class="navbar-brand d-flex align-items-center py-3" :to="{ name: 'inicio' }">
                <i class="bi bi-music-note-beamed fs-2 me-2 brand-gradient" aria-hidden="true"></i>
                <span class="fs-4 fw-bold brand-gradient">SoundSpot</span>
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
    background-color: var(--color-superficie);
}

/* Estilo para el gradiente del nombre */
.brand-gradient {
    background: linear-gradient(45deg, var(--color-primario), var(--color-secundario), color-mix(in srgb, var(--color-primario) 50%, var(--color-secundario) 50%));
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradient-animation 4s ease infinite;
}

@keyframes gradient-animation {
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

.nav-link {
    font-family: var(--fuente-parrafos);
    font-weight: 500;
    transition: color 0.15s ease-in-out;
    color: var(--bs-navbar-color);
}

.nav-link:hover {
    color: var(--bs-navbar-hover-color);
}

.nav-link.active {
    color: var(--bs-navbar-active-color);
    font-weight: 700;
    border-bottom: 3px solid var(--color-secundario);
}

@media (min-width: 992px) {
    .nav-link {
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
    }

    .nav-link.active {
        border-bottom: none;
        border-bottom: 3px solid var(--color-secundario);
    }
}
</style>