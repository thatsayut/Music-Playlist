import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Playlist {
  id: string
  name: string
  description?: string
  tracks: any[]
  createdAt: Date
  thumbnail?: string
}

export interface MusicState {
  tracks: any[]
  searchQuery: string
  isLoading: boolean
  playlists: Playlist[]
  currentPlaylistId: string | null
  currentTrackId: number | null
  currentPlaylistIndex: number
}

export const useMusicStore = defineStore('music', () => {
  // Search & Browse
  const tracks = ref<any[]>([])
  const searchQuery = ref('')
  const isLoading = ref(false)

  // Playlists Management
  const playlists = ref<Playlist[]>([])
  const currentPlaylistId = ref<string | null>(null)
  
  // Now Playing
  const currentTrackId = ref<number | null>(null)
  const currentPlaylistIndex = ref(0)

  // LocalStorage Functions
  const savePlaylistsToLocalStorage = () => {
    const playlistsToSave = playlists.value.map(p => ({
      ...p,
      createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt
    }))
    localStorage.setItem('spotify_playlists', JSON.stringify(playlistsToSave))
  }

  const loadPlaylistsFromLocalStorage = () => {
    const stored = localStorage.getItem('spotify_playlists')
    if (stored) {
      try {
        const loaded = JSON.parse(stored)
        playlists.value = loaded.map((p: any) => ({
          ...p,
          createdAt: new Date(p.createdAt)
        }))
      } catch (error) {
        console.error('Error loading playlists from localStorage:', error)
      }
    }
  }

  // Computed Properties
  const currentPlaylist = computed(() => {
    return playlists.value.find(p => p.id === currentPlaylistId.value) || null
  })

  const currentTrack = computed(() => {
    if (currentPlaylistId.value && currentPlaylist.value) {
      return currentPlaylist.value.tracks[currentPlaylistIndex.value] || null
    }
    return tracks.value.find(t => t.trackId === currentTrackId.value) || null
  })

  const nextTrack = computed(() => {
    if (currentPlaylistId.value && currentPlaylist.value) {
      // ถ้าอยู่ใน playlist ให้เอาเพลงถัดไปจาก playlist
      const nextIndex = currentPlaylistIndex.value + 1
      if (nextIndex < currentPlaylist.value.tracks.length) {
        return currentPlaylist.value.tracks[nextIndex]
      }
      return null
    } else {
      // ถ้าไม่อยู่ใน playlist ให้เอาเพลงถัดไปจาก tracks (ค้นหา/หน้าแรก)
      const currentIndex = tracks.value.findIndex(t => t.trackId === currentTrackId.value)
      if (currentIndex !== -1 && currentIndex + 1 < tracks.value.length) {
        return tracks.value[currentIndex + 1]
      }
      return null
    }
  })

  // Search Functions
  const search = async (query: string) => {
    searchQuery.value = query
    isLoading.value = true

    try {
      const res = await fetch('/api/search?q=' + encodeURIComponent(query))
      const text = await res.text()
      const data = JSON.parse(text)
      tracks.value = data.results || []
      console.log('Search results:', tracks.value)
    } catch (error) {
      console.error('Search error:', error)
      tracks.value = []
    } finally {
      isLoading.value = false
    }
  }

  const loadPopularTracks = async () => {
    isLoading.value = true
    try {
      const res = await fetch('/api/search')
      const text = await res.text()
      const data = JSON.parse(text)
      tracks.value = data.results || []
      searchQuery.value = ''
      console.log('Popular tracks:', tracks.value)
    } catch (error) {
      console.error('Load error:', error)
      tracks.value = []
    } finally {
      isLoading.value = false
    }
  }

  // Playlist Management
  const createPlaylist = (name: string, description: string = '') => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      description,
      tracks: [],
      createdAt: new Date(),
      thumbnail: undefined
    }
    playlists.value.push(newPlaylist)
    savePlaylistsToLocalStorage()
    return newPlaylist
  }

  const deletePlaylist = (playlistId: string) => {
    playlists.value = playlists.value.filter(p => p.id !== playlistId)
    if (currentPlaylistId.value === playlistId) {
      currentPlaylistId.value = null
    }
    savePlaylistsToLocalStorage()
  }

  const renamePlaylist = (playlistId: string, newName: string) => {
    const playlist = playlists.value.find(p => p.id === playlistId)
    if (playlist) {
      playlist.name = newName
      savePlaylistsToLocalStorage()
    }
  }

  const setCurrentPlaylist = (playlistId: string | null) => {
    currentPlaylistId.value = playlistId
    currentPlaylistIndex.value = 0
  }

  // Track Management
  const addTrackToPlaylist = (playlistId: string, track: any) => {
    const playlist = playlists.value.find(p => p.id === playlistId)
    if (playlist && !playlist.tracks.find(t => t.trackId === track.trackId)) {
      playlist.tracks.push(track)
      // ถ้ายังไม่มี thumbnail ให้เอาจากเพลงแรก
      if (!playlist.thumbnail && track.artworkUrl100) {
        playlist.thumbnail = track.artworkUrl100
      }
      savePlaylistsToLocalStorage()
    }
  }

  const removeTrackFromPlaylist = (playlistId: string, trackId: number) => {
    const playlist = playlists.value.find(p => p.id === playlistId)
    if (playlist) {
      playlist.tracks = playlist.tracks.filter(t => t.trackId !== trackId)
      savePlaylistsToLocalStorage()
    }
  }

  const addTrackToCurrentPlaylist = (track: any) => {
    if (currentPlaylistId.value) {
      addTrackToPlaylist(currentPlaylistId.value, track)
    }
  }

  // Now Playing Management
  const playTrack = (track: any, playlistId: string | null = null) => {
    currentTrackId.value = track.trackId
    if (playlistId) {
      currentPlaylistId.value = playlistId
      const playlist = playlists.value.find(p => p.id === playlistId)
      if (playlist) {
        currentPlaylistIndex.value = playlist.tracks.findIndex(t => t.trackId === track.trackId)
      }
    }
  }

  const playNext = () => {
    if (nextTrack.value) {
      playTrack(nextTrack.value, currentPlaylistId.value)
    }
  }

  const playPrevious = () => {
    if (currentPlaylistId.value && currentPlaylist.value) {
      const prevIndex = currentPlaylistIndex.value - 1
      if (prevIndex >= 0) {
        currentPlaylistIndex.value = prevIndex
        currentTrackId.value = currentPlaylist.value.tracks[prevIndex].trackId
      }
    } else {
      const currentIndex = tracks.value.findIndex(t => t.trackId === currentTrackId.value)
      if (currentIndex > 0) {
        const prevTrack = tracks.value[currentIndex - 1]
        currentTrackId.value = prevTrack.trackId
      }
    }
  }

  const clearCurrentTrack = () => {
    currentTrackId.value = null
  }

  return {
    // State
    tracks,
    searchQuery,
    isLoading,
    playlists,
    currentPlaylistId,
    currentTrackId,
    currentPlaylistIndex,
    // Computed
    currentPlaylist,
    currentTrack,
    nextTrack,
    // Search
    search,
    loadPopularTracks,
    // Playlist Management
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    setCurrentPlaylist,
    // Track Management
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    addTrackToCurrentPlaylist,
    // Now Playing
    playTrack,
    playNext,
    playPrevious,
    clearCurrentTrack,
    // LocalStorage
    savePlaylistsToLocalStorage,
    loadPlaylistsFromLocalStorage
  }
})
