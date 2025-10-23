<script setup>
// Importo los componentes necesarios de vue-router y mi cabecera
import { RouterView } from 'vue-router'
import Header from '@/components/Header.vue';
</script>

<template>
  <Header />

  <main class="container mt-4">
    <RouterView />
  </main>

  <footer class="text-center text-muted py-3 mt-5">
    <p>&copy; {{ new Date().getFullYear() }} SoundSpot - Creado por Luciano Neiman</p>
  </footer>
</template>

<style scoped>
main {
  min-height: calc(100vh - 200px);
}
</style>