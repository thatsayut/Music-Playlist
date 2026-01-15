<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMusicStore } from '../stores/musicStore'
import { v } from 'vue-router/dist/router-CWoNjPRp.mjs'

const musicStore = useMusicStore()
const hoveredTrackId = ref<number | null>(null)
const showAddToPlaylistDialog = ref(false)
const selectedTrackForPlaylist = ref<any>(null)

const loadPopularTracks = async () => {
  await musicStore.loadPopularTracks()
  window.dispatchEvent(new CustomEvent('music-load-playlist', { detail: musicStore.tracks }))
}

const search = async (query?: string) => {
  const searchTerm = query !== undefined ? query : musicStore.searchQuery

  if (!searchTerm.trim()) {
    await loadPopularTracks()
    return
  }

  await musicStore.search(searchTerm)
  window.dispatchEvent(new CustomEvent('music-load-playlist', { detail: musicStore.tracks }))
}

const playTrack = (track: any) => {
  musicStore.playTrack(track, null)
  window.dispatchEvent(new CustomEvent('music-play-track', { detail: track }))
}

const togglePlayPause = () => {
  window.dispatchEvent(new CustomEvent('music-toggle-play', {}))
}

const addToPlaylist = (track: any) => {
  selectedTrackForPlaylist.value = track
  showAddToPlaylistDialog.value = true
}

const confirmAddToPlaylist = (playlistId: string) => {
  if (selectedTrackForPlaylist.value) {
    musicStore.addTrackToPlaylist(playlistId, selectedTrackForPlaylist.value)
    console.log('Added to playlist:', selectedTrackForPlaylist.value.trackName)
    showAddToPlaylistDialog.value = false
    selectedTrackForPlaylist.value = null
  }
}

const updateSelectedPlaylist = (playlistId: string) => {
  musicStore.setCurrentPlaylist(playlistId)
}

const formatDuration = (ms) => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes} min ${seconds.toString().padStart(2, '0')} sec`
}

onMounted(() => {
  musicStore.loadPlaylistsFromLocalStorage()
  loadPopularTracks()

  window.addEventListener('header-search', (e: any) => {
    search(e.detail)
  })

  window.addEventListener('music-track-changed', (e: any) => {
    if (e.detail?.trackId) {
      musicStore.currentTrackId = e.detail.trackId
    }
  })

  window.addEventListener('music-paused', () => {
    musicStore.clearCurrentTrack()
  })
})
</script>

<template>
  <v-container fluid class="pa-0 spotify-container">
    <v-row class="no-gutters playlist_main" style="min-height: calc(100vh - 200px);">

      <v-col md="3" class="spotify-sidebar pa-6"
        style="background-color: #121212; overflow-y: auto; max-height: calc(100vh - 200px);">
        <PlaylistList @select-playlist="updateSelectedPlaylist" />
      </v-col>


      <v-col md="9" class="spotify-main pa-8"
        style="background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%); overflow-y: auto; max-height: calc(100vh - 200px);">


        <div v-if="musicStore.currentPlaylistId" class="playlist-view">
          <PlaylistDetail />
        </div>

        <div v-else class="browse-view">
          <div class="mb-10">
            <h1 class="spotify-title" style="color: #fff; font-weight: 700; margin-bottom: 0.5rem;">
              {{ musicStore.searchQuery || 'Popular Songs' }}</h1>
            <p style="color: #b3b3b3; font-size: 0.95rem;">{{ musicStore.tracks.length }} songs</p>
          </div>


          <div v-if="musicStore.isLoading" class="text-center py-12">
            <v-progress-circular indeterminate color="#1DB954" size="50"></v-progress-circular>
          </div>


          <v-row v-else class="ga-4" >
            <v-col cols="12">
              <v-row justify="center" align="center" class="mb-8">
                <v-col md="2"><v-img :src="musicStore.tracks[0]?.artworkUrl100" width="100%" height="200"
                    class="rounded-lg spotify-artwork"></v-img></v-col>
                <v-col>
                  <p>Album</p>
                  <h2> {{ musicStore.tracks[0]?.trackName }}</h2>
                  <p>{{ new Date(musicStore.tracks[0]?.releaseDate).getFullYear() }} , {{
                    formatDuration(musicStore.tracks[0].trackTimeMillis) }}</p>
                </v-col>
              </v-row>
            </v-col>
            <v-col cols="12">
              <v-row>
                <v-col cols="1">#</v-col>
                <v-col>
                  <p>Title</p>
                </v-col>
                <v-col class="text-right"><v-icon>mdi-clock-time-five-outline</v-icon></v-col>
              </v-row>
              <v-row v-for="track, key in musicStore.tracks" :key="track.trackId" class="spotify-card" justify="center" align="center"
                :class="{ 'playing': musicStore.currentTrackId === track.trackId }"
                 @click="playTrack(track)" :style="{
                  cursor: 'pointer',

                  transition: 'all 0.3s ease',

                }" @mouseenter="hoveredTrackId = track.trackId" @mouseleave="hoveredTrackId = null"
              >
                <v-col cols="auto">{{ key + 1 }}</v-col>

                <v-col cols="9">
                  <v-row justify="center" align="center">
                    <v-col cols="auto" class="pr-0">
                      <v-img :src="track.artworkUrl100" width="40" height="40" class="rounded"></v-img>
                    </v-col>
                    <v-col class="" >
                      <p class="mb-0">{{ track.trackName }}</p>
                      <span>{{ track.artistName }}</span>
                    </v-col>
                  </v-row>

                </v-col>
                <v-col class="text-right">
                  <v-btn icon="mdi-plus" variant="text" style="color: #b3b3b3;" @click.stop="addToPlaylist(track)"
                    class="flex-grow-1 spotify-action-btn"></v-btn>
                </v-col>

                <v-col class="text-right"><p >{{ formatDuration(track.trackTimeMillis) }}</p></v-col>
              </v-row>

            </v-col>

          </v-row>
        </div>
      </v-col>
    </v-row>


    <v-dialog v-model="showAddToPlaylistDialog" max-width="400">
      <v-card style="background-color: #282828; color: #fff;">
        <v-card-title class="pa-6" style="color: #fff;">
          Add to Playlist
        </v-card-title>

        <v-card-text class="pa-6">
          <p style="color: #b3b3b3; margin-bottom: 1rem;" v-if="selectedTrackForPlaylist">
            {{ selectedTrackForPlaylist.trackName }} - {{ selectedTrackForPlaylist.artistName }}
          </p>

          <div v-if="musicStore.playlists.length === 0" style="color: #b3b3b3; text-align: center; padding: 1rem;">
            No playlists yet. Create one first!
          </div>

          <v-list style="background-color: #282828;">
            <v-list-item v-for="playlist in musicStore.playlists" :key="playlist.id"
              @click="confirmAddToPlaylist(playlist.id)"
              style="background-color: #1DB954; margin-bottom: 0.5rem; border-radius: 4px; cursor: pointer;">
              <v-list-item-title style="color: #fff; font-weight: 500;">
                {{ playlist.name }}
              </v-list-item-title>
              <v-list-item-subtitle style="color: rgba(255,255,255,0.7);">
                {{ playlist.tracks.length }} songs
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>

        <v-card-actions class="pa-6">
          <v-spacer></v-spacer>
          <v-btn variant="text" color="#b3b3b3" @click="showAddToPlaylistDialog = false">
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped lang="scss">
.playlist_main {
  background-color: #121212;
}

.spotify-container {
  background: #121212;
  color: #fff;
  height: 100vh;
}

.spotify-sidebar {
  background-color: #121212;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.spotify-main {
  background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}

.spotify-title {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.spotify-card {
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &:hover {
    background-color: rgba(255, 255, 255, 0.12) !important;
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.5);
  }

  &.playing {
    background-color: rgba(29, 185, 84, 0.2) !important;
    border: 1px solid rgba(29, 185, 84, 0.5) !important;
  }
}

.spotify-artwork {
  transition: all 0.3s ease;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);

  .spotify-card:hover & {
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.6);
  }
}

.spotify-play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  animation: fadeIn 0.2s ease-in-out;
  z-index: 10;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.spotify-action-btn {
  transition: all 0.3s ease;

  &:hover {
    color: #1db954 !important;
    transform: scale(1.1);
  }
}

.position-relative {
  position: relative;
}

.text-green {
  color: #1db954 !important;
}
</style>
