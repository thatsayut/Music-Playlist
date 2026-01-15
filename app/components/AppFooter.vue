<template>
  <v-footer app class="bg-black text-white ">
    <audio ref="audioPlayer" @timeupdate="onTimeUpdate" @ended="onSongEnd"></audio>

    <v-container fluid class="py-0">
      <v-row align="center" justify="space-between" class="player-container">
        <v-col cols="12" sm="4" class="track-info">
          <v-row  align="center" class="gap-2">
            <v-col cols="auto">
                <v-img :src="currentTrack?.artworkUrl100 || currentTrack?.image || 'https://via.placeholder.com/56'"
              width="56" height="56" class="rounded"></v-img>
            </v-col>
            <v-col cols="8">
              <p class="text-subtitle2 mb-0">{{ currentTrack?.trackName || currentTrack?.name || 'ไม่มีเพลง' }}</p>
              <p class="text-caption text-grey mb-0">{{ currentTrack?.artistName || currentTrack?.artist || 'ศิลปิน' }}
              </p>
            </v-col>
            <!-- <v-col cols="1">
              <v-btn icon="mdi-plus-circle-outline" variant="text" size="" color="grey"></v-btn>
            </v-col> -->
          </v-row>
       
        </v-col>

        <v-col cols="12" sm="3">
          <div class="d-flex align-center justify-center gap-3 mb-2">
            <v-btn icon="mdi-skip-previous" variant="text" size="small" @click="skipPrevious"></v-btn>
            <v-btn :icon="isPlaying ? 'mdi-pause-circle' : 'mdi-play-circle'" variant="text" size="large"
              @click="togglePlay"></v-btn>
            <v-btn icon="mdi-skip-next" variant="text" size="small" @click="skipNext"></v-btn>
          </div>
          <div class="d-flex align-center gap-2">
            <span class="text-caption">{{ formatTime(currentTime) }}</span>
            <v-slider v-model="currentTime" :max="duration" class="flex-grow-1" hide-details color="green"
              track-color="grey-darken-2" @update:model-value="seek"></v-slider>
            <span class="text-caption">{{ formatTime(duration) }}</span>
          </div>
        </v-col>

        <v-col cols="12" sm="3" class="d-flex justify-end gap-2">
          <!-- <v-btn icon="mdi-heart-outline" variant="text" size="small"></v-btn> -->
          <v-btn icon="mdi-volume-high" variant="text" size="small"></v-btn>
          <v-slider v-model="volume" :max="100" class="volume-slider" hide-details color="green"
            @update:model-value="updateVolume"></v-slider>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useMusicStore } from '../stores/musicStore'

const musicStore = useMusicStore()
const audioPlayer = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(70)
const playlist = ref<any[]>([])

const emit = defineEmits(['track-changed'])

const currentTrack = computed(() => {
  return musicStore.currentTrack
})

onMounted(() => {
  window.addEventListener('music-play-track', (e: any) => {
    playTrackInternal(e.detail)
  })

  window.addEventListener('music-toggle-play', () => {
    togglePlay()
  })

  window.addEventListener('music-load-playlist', (e: any) => {
    loadPlaylist(e.detail)
  })

  if (audioPlayer.value) {
    audioPlayer.value.volume = volume.value / 100
  }
})

const togglePlay = () => {

  console.log("togglePlay ")
  if (!currentTrack.value) return

  if (isPlaying.value) {

    console.log("isPlaying")
    audioPlayer.value?.pause()
    // window.dispatchEvent(new CustomEvent('music-paused', { detail: currentTrack.value }))
  } else {
    audioPlayer.value?.play().catch(err => console.error('Play error:', err))
  }
  isPlaying.value = !isPlaying.value
}

const onTimeUpdate = () => {
  if (audioPlayer.value) {
    currentTime.value = audioPlayer.value.currentTime
    duration.value = audioPlayer.value.duration || 0
  }
}

const onSongEnd = () => {
  // ไปเพลงถัดไป using store logic
  if (musicStore.nextTrack) {
    musicStore.playNext()
    const nextTrack = musicStore.currentTrack
    if (nextTrack) {
      playTrackInternal(nextTrack)
    }
  } else {
    isPlaying.value = false
  }
}

const seek = (time: number) => {
  if (audioPlayer.value) {
    audioPlayer.value.currentTime = time
  }
}

const updateVolume = (vol: number) => {
  if (audioPlayer.value) {
    audioPlayer.value.volume = vol / 100
  }
}

const skipPrevious = () => {
  musicStore.playPrevious()
  const prevTrack = musicStore.currentTrack
  if (prevTrack) {
    playTrackInternal(prevTrack)
  }
}

const skipNext = () => {
  if (musicStore.nextTrack) {
    musicStore.playNext()
    const nextTrack = musicStore.currentTrack
    if (nextTrack) {
      playTrackInternal(nextTrack)
    }
  }
}

const playTrackInternal = (track: any) => {
  if (!track) return

  if (track.previewUrl) {
    try {
      if (audioPlayer.value) {
        audioPlayer.value.src = track.previewUrl
        audioPlayer.value.crossOrigin = 'anonymous'

        const onCanPlay = () => {
          audioPlayer.value?.play().catch(err => {
            console.error('Play error:', err)
          })
          isPlaying.value = true
          audioPlayer.value?.removeEventListener('canplay', onCanPlay)
        }

        audioPlayer.value.addEventListener('canplay', onCanPlay)
        audioPlayer.value.load()

        audioPlayer.value.onerror = (e) => {
          console.error('Audio error:', e)
        }
      }
      emit('track-changed', track)
    } catch (error) {
      console.error('Error setting audio source:', error)
    }
  }

  window.dispatchEvent(new CustomEvent('music-track-changed', { detail: track }))
}

const loadPlaylist = (tracks: any[]) => {
  playlist.value = tracks
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Expose methods สำหรับใช้จาก parent component
defineExpose({
  playTrackInternal,
  loadPlaylist
})
</script>

<style scoped lang="scss">
.player-container {
  gap: 1rem;
}

.track-info {
  min-width: 200px;
}

.volume-slider {
  max-width: 100px;
}

:deep(.v-slider__track) {
  height: 4px;
}

footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>