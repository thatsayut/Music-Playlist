<template>
  <div>
    <v-app-bar color="#000000" dark elevation="2" class="spotify-header">
      <v-app-bar-nav-icon variant="text" class="spotify-logo">
        <v-img :src="`images/spotify.png`" width="32" />
      </v-app-bar-nav-icon>

     
        
      <v-spacer></v-spacer>
       <v-btn class="spotify-nav-btn rounded-pill pa-3 mx-2" size="" @click="goHome">
        <v-icon size="small">mdi-home</v-icon>
      </v-btn>

      <v-text-field 
        :model-value="musicStore.searchQuery" 
        placeholder="What do you want to play?" 
        prepend-inner-icon="mdi-magnify" 
        variant="outlined"
        density="compact" 
        class="spotify-search-field" 
        @update:model-value="handleSearch"
        hide-details="auto"
      ></v-text-field>

      <v-spacer></v-spacer>

      <v-btn
        icon="mdi-bell-outline"
        variant="text"
        class="spotify-icon-btn"
      ></v-btn>

      <v-btn
        icon="mdi-account-circle-outline"
        variant="text"
        class="spotify-icon-btn"
      ></v-btn>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" :location="$vuetify.display.mobile ? 'bottom' : undefined" temporary>
      <v-list :items="items"></v-list>
    </v-navigation-drawer>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useMusicStore } from '../stores/musicStore'

const musicStore = useMusicStore()
const drawer = ref(false)
const items = [
  { title: 'Home', value: 'home' },
  { title: 'Settings', value: 'settings' }
]

const emit = defineEmits(['search'])

const handleSearch = (query: string) => {
  musicStore.searchQuery = query
  window.dispatchEvent(new CustomEvent('header-search', { detail: query }))
  musicStore.setCurrentPlaylist(null)
}

const goHome = () => {
  musicStore.setCurrentPlaylist(null)
}
</script>

<style scoped lang="scss">
.spotify-header {
  background-color: #000000 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.spotify-logo {
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
}

.spotify-nav-btn {
  background-color: rgba(255, 255, 255, 0.1) !important;
  color: #fff !important;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2) !important;
  }
}

.spotify-search-field {
  max-width: 400px;
  margin: 0 1rem;

  :deep(.v-field__outline) {
    --v-field-border-width: 0;
  }

  :deep(.v-field) {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 0 1rem;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.15);
    }

    &.v-field--focused {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }

  :deep(.v-field__input) {
    color: #fff;
    font-size: 0.95rem;

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }

  :deep(.v-field__prepend-inner .v-icon) {
    color: rgba(255, 255, 255, 0.7) !important;
  }
}

.spotify-icon-btn {
  color: #b3b3b3 !important;
  transition: all 0.3s ease;

  &:hover {
    color: #fff !important;
  }

  &:hover {
    transform: scale(1.1);
  }
}
</style>
