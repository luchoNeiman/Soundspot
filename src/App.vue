<script setup>
// Importo los componentes necesarios de vue-router y mi cabecera
import { RouterView } from 'vue-router'
import Header from '@/components/Header.vue';
</script>

<template>
  <Header />

  <main class="container mt-4 mb-5">
    <RouterView />
  </main>

  <footer class="pie-pagina text-center py-4 mt-auto">
    <div class="container">
      <p class="mb-0 small text-body-secondary"> &copy; {{ new Date().getFullYear() }} SoundSpot - Creado por Luciano
        Neiman
      </p>
    </div>
  </footer>
</template>

<style scoped>
main {
  min-height: calc(100vh - 200px);
  /* Hace que main ocupe el espacio disponible */
  flex-grow: 1;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.pie-pagina {
  background-color: var(--color-superficie);
  /* Fondo oscuro como las cards */
  border-top: 1px solid var(--color-borde);
  /* Línea divisoria sutil */
  font-family: var(--fuente-parrafos);
}
</style>