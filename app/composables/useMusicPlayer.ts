import { ref } from 'vue'

const currentTrack = ref<any>(null)
const playlist = ref<any[]>([])
const currentTrackIndex = ref(0)
const isPlaying = ref(false)

export const useMusicPlayer = () => {
  const playTrack = (track: any) => {
    currentTrack.value = track
    const index = playlist.value.findIndex(t => t.trackId === track.trackId)
    if (index >= 0) {
      currentTrackIndex.value = index
    }
    
    // Trigger play event
    window.dispatchEvent(new CustomEvent('music-play-track', { detail: track }))
  }

  const loadPlaylist = (tracks: any[]) => {
    playlist.value = tracks
  }

  return {
    currentTrack,
    playlist,
    currentTrackIndex,
    isPlaying,
    playTrack,
    loadPlaylist
  }
}
