<template>
  <div class="playlist-container">
    <div class="playlist-header d-none d-sm-flex">
      <h2 class="playlist-title">Your Library</h2>
      <v-btn color="grey-darken-4" rounded="pill" @click="showCreateDialog = true" class="create-playlist-btn">
        <v-icon size="small" class="mr-2">mdi-plus</v-icon>
        Create
      </v-btn>
    </div>
    <div class="d-sm-none d-block text-center">
      <v-icon style="font-size: 40px;">mdi-playlist-music-outline</v-icon>
      <v-btn color="grey-darken-4" rounded="pill" block @click="showCreateDialog = true" class="mb-4 py-8">
        <v-icon size="small" class="" style="font-size: 35px;">mdi-plus-circle-outline</v-icon>

      </v-btn>
    </div>




    <v-dialog v-model="showCreateDialog" max-width="420" persistent>
      <v-card class="playlist-dialog pa-2" elevation="10" rounded="xl" color="#181818">

        <v-card-title class="text-white text-h6 font-weight-bold pb-2">
          Create New Playlist
        </v-card-title>


        <v-card-text class="pt-0">
          <v-text-field v-model="newPlaylistName" label="Playlist Name" variant="outlined" density="comfortable"
            color="#1DB954" bg-color="#121212" class="mt-2" hide-details />

          <v-text-field v-model="newPlaylistDesc" label="Description (Optional)" variant="outlined"
            density="comfortable" color="#1DB954" bg-color="#121212" class="mt-4" hide-details />
        </v-card-text>


        <v-card-actions class="px-4 pb-4">
          <v-spacer />

          <v-btn color="#ffffff"  rounded="xl"   variant="outlined" class="px-6 spotify-btn-cancel" @click="showCreateDialog = false">
            Cancel
          </v-btn>

          <v-btn color="#1DB954" rounded="xl" elevation="4" class="px-6 text-white font-weight-bold spotify-btn"
            @click="createPlaylist">
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


    <!-- Playlists Grid -->
    <div class="playlists-list" v-if="musicStore.playlists.length > 0">
      <div v-for="playlist in musicStore.playlists" :key="playlist.id" class="playlist-item"
        @click="selectPlaylist(playlist.id)" :class="{ 'active': musicStore.currentPlaylistId === playlist.id }">
        <div class="playlist-image">
          <v-img v-if="playlist.thumbnail" :src="playlist.thumbnail" width="100%" height="100%" cover></v-img>
          <div v-else class="playlist-placeholder">
            <v-icon size="large">mdi-music-box-multiple</v-icon>
          </div>
        </div>
        <div class="playlist-info d-none d-sm-block">
          <h3 class="playlist-name">{{ playlist.name }}</h3>
          <p class="playlist-meta">{{ playlist.tracks.length }} songs</p>
          <p v-if="playlist.description" class="playlist-desc">{{ playlist.description }}</p>
        </div>
        <div class="playlist-actions">
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" size="small" v-bind="props" @click.stop></v-btn>
            </template>
            <v-list class="bg-darken-3">
              <v-list-item @click="editPlaylist(playlist)" class="text-white">
                <template v-slot:prepend>
                  <v-icon>mdi-pencil</v-icon>
                </template>
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>
              <v-list-item @click="deletePlaylist(playlist.id)" class="text-red">
                <template v-slot:prepend>
                  <v-icon>mdi-delete</v-icon>
                </template>
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <v-icon size="80" color="#b3b3b3">mdi-playlist-music</v-icon>
      <p class="mt-4" style="color: #b3b3b3;">No playlists yet. Create one to get started!</p>
    </div>

    <!-- Edit Dialog -->
    <v-dialog v-model="showEditDialog" max-width="400">
      <v-card class="playlist-dialog" color="#282828">
        <v-card-title class="text-white">Edit Playlist</v-card-title>
        <v-card-text>
          <v-text-field v-model="editingPlaylist.name" label="Playlist Name" class="mt-4" variant="outlined"
            density="compact" color="#1DB954"></v-text-field>
          <v-text-field v-model="editingPlaylist.description" label="Description" variant="outlined" density="compact"
            color="#1DB954" class="mt-3"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showEditDialog = false" color="#b3b3b3">Cancel</v-btn>
          <v-btn @click="saveEdit" color="#1DB954">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMusicStore } from '../stores/musicStore'

const musicStore = useMusicStore()
const emit = defineEmits(['select-playlist'])

const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const newPlaylistName = ref('')
const newPlaylistDesc = ref('')
const editingPlaylist = ref<any>(null)

const createPlaylist = () => {
  if (newPlaylistName.value.trim()) {
    musicStore.createPlaylist(newPlaylistName.value, newPlaylistDesc.value)
    newPlaylistName.value = ''
    newPlaylistDesc.value = ''
    showCreateDialog.value = false
  }
}

const selectPlaylist = (playlistId: string) => {
  musicStore.setCurrentPlaylist(playlistId)
  emit('select-playlist', playlistId)
}

const editPlaylist = (playlist: any) => {
  editingPlaylist.value = { ...playlist }
  showEditDialog.value = true
}

const saveEdit = () => {
  if (editingPlaylist.value) {
    musicStore.renamePlaylist(editingPlaylist.value.id, editingPlaylist.value.name)
    const pl = musicStore.playlists.find(p => p.id === editingPlaylist.value.id)
    if (pl) {
      pl.description = editingPlaylist.value.description
    }
    showEditDialog.value = false
  }
}

const deletePlaylist = (playlistId: string) => {
  if (confirm('Delete this playlist?')) {
    musicStore.deletePlaylist(playlistId)
  }
}
</script>

<style scoped lang="scss">
.playlist-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
   height: calc(100vh - 72px);
  padding-bottom: 150px;
   
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .playlist-title {
    color: #fff;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .create-playlist-btn {
    min-width: 140px;
  }
}

.playlists-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
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

.playlist-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background-color: rgba(29, 185, 84, 0.2);
    border-color: rgba(29, 185, 84, 0.5);
  }

  .playlist-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    overflow: hidden;
    flex-shrink: 0;
    background-color: rgba(255, 255, 255, 0.1);

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

  .playlist-info {
    flex: 1;
    min-width: 0;

    .playlist-name {
      color: #fff;
      font-size: 0.95rem;
      font-weight: 600;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .playlist-meta {
      color: #b3b3b3;
      font-size: 0.85rem;
      margin: 0.25rem 0 0 0;
    }

    .playlist-desc {
      color: #b3b3b3;
      font-size: 0.8rem;
      margin: 0.25rem 0 0 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .playlist-actions {
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover .playlist-actions {
    opacity: 1;
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

.playlist-dialog {
  color: #fff;
}

.bg-darken-3 {
  background-color: #181818 !important;
}


.spotify-btn {
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.25s ease;
  background-color: #1ed760 !important;
}

.spotify-btn:hover {
  background-color: #159b44 !important;
  transform: scale(1.05);
}

.spotify-btn-cancel {
  text-transform: none;
  letter-spacing: 0.5px;
  transition: all 0.25s ease;
  // background-color: #dd1414 !important;
}

.spotify-btn-cancel:hover {
  background-color: #a11010 !important;
  transform: scale(1.05);
}


@media screen and (max-width: 768px) {
  .playlist-item {
    padding: 0;
  }

  .playlist-container{
     padding-bottom: 72px;
  }
}
</style>
