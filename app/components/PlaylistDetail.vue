<template>
  <div class="playlist-detail-container">
    <div v-if="musicStore.currentPlaylist" class="playlist-detail">
      <!-- Back to Home Button -->
      <div class="mb-4">
        <v-btn variant="text" prepend-icon="mdi-home" color="#b3b3b3" @click="goHome" style="font-size: 0.95rem;"
          class="fm14">
          Back to Home
        </v-btn>
      </div>

      <!-- Playlist Header -->
      <div class="playlist-header-section d-flex align-sm-left align-center  flex-wrap">
        <div class="playlist-cover">
          <v-img v-if="musicStore.currentPlaylist.thumbnail" :src="musicStore.currentPlaylist.thumbnail" width="100%"
            height="100%" cover></v-img>
          <div v-else class="playlist-placeholder">
            <v-icon size="80">mdi-music-box-multiple</v-icon>
          </div>
        </div>
        <div class="playlist-header-info">
          <p style="color: #b3b3b3; font-size: 0.9rem; margin: 0;">PLAYLIST</p>
          <h1 class="playlist-name">{{ musicStore.currentPlaylist.name }}</h1>
          <p v-if="musicStore.currentPlaylist.description" class="playlist-description">
            {{ musicStore.currentPlaylist.description }}
          </p>
          <p class="playlist-stats">
            <v-icon size="small">mdi-music</v-icon>
            {{ musicStore.currentPlaylist.tracks.length }} songs
          </p>
        </div>
        <div class="d-sm-none d-flex">
          <v-btn color="#1DB954" rounded="pill" size="" icon="mdi-play" @click="playFirstTrack"
            v-if="musicStore.currentPlaylist.tracks.length > 0"></v-btn>
        </div>

      </div>

      <!-- Playlist Controls -->
      <div class="playlist-controls d-none d-sm-flex mb-sm-2">
        <v-btn color="#1DB954" rounded="pill" size="large" icon="mdi-play" @click="playFirstTrack"
          v-if="musicStore.currentPlaylist.tracks.length > 0"></v-btn>
      </div>


      <!-- Tracks List -->
      <div v-if="musicStore.currentPlaylist.tracks.length > 0" class="tracks-list">
        <div v-for="(track, index) in musicStore.currentPlaylist.tracks" :key="track.trackId" class="track-item"
          :class="{ 'playing': musicStore.currentTrackId === track.trackId }" @click="playTrack(track)"
          @mouseenter="hoveredTrackId = track.trackId" @mouseleave="hoveredTrackId = null">
          <div class="track-number">{{ index + 1 }}</div>
          <div class="track-artwork">
            <v-img :src="track.artworkUrl100" width="50" height="50" class="rounded"></v-img>
          </div>
          <div class="track-info">
            <p class="track-name" :style="{ color: musicStore.currentTrackId === track.trackId ? '#1DB954' : '#fff' }">
              {{ track.trackName }}
            </p>
            <p class="track-artist">{{ track.artistName }}</p>
          </div>
          <div class="track-actions" v-if="hoveredTrackId === track.trackId">
            <v-btn icon="mdi-play-circle" variant="text" size="small" color="#1DB954"
              @click.stop="playTrack(track)"></v-btn>
            <v-btn icon="mdi-trash-can" variant="text" size="small" color="#b3b3b3"
              @click.stop="removeTrack(track.trackId)"></v-btn>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <v-icon size="80" color="#b3b3b3">mdi-music-box</v-icon>
        <p class="mt-4" style="color: #b3b3b3;">No tracks in this playlist yet</p>
        <p style="color: #b3b3b3; font-size: 0.9rem;">Add tracks from the search results</p>
      </div>
    </div>

    <!-- No Playlist Selected -->
    <div v-else class="no-playlist">
      <v-icon size="120" color="#b3b3b3">mdi-playlist-music</v-icon>
      <p class="mt-6" style="color: #b3b3b3; font-size: 1.1rem;">Select a playlist to view tracks</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMusicStore } from '../stores/musicStore'

const musicStore = useMusicStore()
const hoveredTrackId = ref<number | null>(null)

const playTrack = (track: any) => {
  musicStore.playTrack(track, musicStore.currentPlaylistId)
  window.dispatchEvent(new CustomEvent('music-play-track', { detail: track }))
}

const playFirstTrack = () => {
  if (musicStore.currentPlaylist && musicStore.currentPlaylist.tracks.length > 0) {
    playTrack(musicStore.currentPlaylist.tracks[0])
  }
}

const removeTrack = (trackId: number) => {
  if (musicStore.currentPlaylistId) {
    musicStore.removeTrackFromPlaylist(musicStore.currentPlaylistId, trackId)
  }
}

const goHome = () => {
  musicStore.setCurrentPlaylist(null)
}
</script>

<style scoped lang="scss">
.playlist-detail-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  color: #fff;
  overflow-y: scroll;
  height: calc(100vh - 72px);

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

.playlist-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.playlist-header-section {
  display: flex;
  gap: 2rem;
  margin-bottom: 1rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .playlist-cover {
    width: 200px;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;
    background-color: rgba(255, 255, 255, 0.1);
    flex-shrink: 0;

    .playlist-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1DB954 0%, #1aa34a 100%);
      color: #fff;
    }
  }

  .playlist-header-info {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;

    .playlist-name {
      font-size: 3rem;
      font-weight: 900;
      margin: 0.5rem 0;
      line-height: 1;
    }

    .playlist-description {
      color: #b3b3b3;
      font-size: 0.95rem;
      margin: 0.5rem 0;
    }

    .playlist-stats {
      color: #b3b3b3;
      font-size: 0.9rem;
      margin: 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  }
}

// .playlist-controls {
//   margin-bottom: 2rem;
// }

.tracks-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

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

.track-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.playing {
    background-color: rgba(29, 185, 84, 0.2);
    border-color: rgba(29, 185, 84, 0.5);
  }

  .track-number {
    color: #b3b3b3;
    font-size: 0.9rem;
    width: 30px;
    text-align: center;
  }

  .track-artwork {
    flex-shrink: 0;
  }

  .track-info {
    flex: 1;
    min-width: 0;

    .track-name {
      font-size: 0.95rem;
      font-weight: 500;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .track-artist {
      color: #b3b3b3;
      font-size: 0.85rem;
      margin: 0.25rem 0 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .track-actions {
    display: flex;
    gap: 0.5rem;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 2rem;
  text-align: center;
}

.no-playlist {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 2rem;
  text-align: center;
}


@media screen and (max-width: 600px) {
  .playlist-header-section .playlist-cover {
    width: 70px;
    height: 70px;
  }

  .playlist-header-section {
    padding-bottom: 0;
  }
}
</style>
