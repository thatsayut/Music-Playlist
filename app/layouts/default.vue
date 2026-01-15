<template>
  <v-layout class="layout-wrapper">
    <AppHeader @search="handleSearch" />
    
    <v-main>
      <slot />
    </v-main>
    
    <AppFooter />
  </v-layout>
</template>

<script setup lang="ts">
const handleSearch = (query: string) => {
  // ส่ง search event ไปยัง child component ผ่าน window event
  window.dispatchEvent(new CustomEvent('header-search', { detail: query }))
}
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #121212;
  color: #fff;
}

:deep(.v-main) {
  background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
  overflow: hidden;
}
</style>
