<script setup lang="ts">
  import WEVAvatar from '@/components/WEVAvatar.vue'
  import { supabase } from '@/config/supabase'
  import { useKeuringenStore } from '@/stores/keuringenStore'
  import Dialog from 'primevue/dialog'
  import { useToast } from 'primevue/usetoast'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from './../stores/authStore'

  const authStore = useAuthStore()
  const keuringenStore = useKeuringenStore()
  const toast = useToast()
  const router = useRouter()

  const showProfileDropDown = ref<boolean>(false)
  const changeAvatarDialogVisible = ref<boolean>(false)
  const profilePictureURL = ref('')

  const handleChangeAvatar = () => {
    changeAvatarDialogVisible.value = true
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.add({ severity: 'error', detail: 'Uitloggen mislukt', life: 5000 })

      console.error('Unable to sign out: ', error)
    } else {
      toast.add({ severity: 'success', detail: 'Succesvol uitgelogd!', life: 5000 })

      authStore.setCurrentlyLoggedIn(null)
      keuringenStore.empty()
      router.replace('/login')
    }
  }

  const handleFileUpload = async (event: Event) => {
    const files = (event.target as HTMLInputElement).files
    if (files) {
      const file = files[0]

      if (authStore.currentlyLoggedIn) {
        const { data: uploadedAvatar, error: uploadError } = await supabase.storage.from('avatars').upload(`${authStore.currentlyLoggedIn.organisatie.naam}/${file.name}`, file)

        if (uploadError) throw uploadError

        const { error: updateGebruikerError } = await supabase
          .from('gebruikers')
          .update({
            avatar: uploadedAvatar.path
          })
          .eq('id', authStore.currentlyLoggedIn.id)

        if (updateGebruikerError) throw updateGebruikerError

        authStore.setCurrentlyLoggedIn({
          ...authStore.currentlyLoggedIn,
          avatar: uploadedAvatar.path
        })
      }
    }
  }

  const downloadAvatar = async () => {
    if (authStore.currentlyLoggedIn && authStore.currentlyLoggedIn.avatar) {
      const { data, error } = await supabase.storage.from('avatars').download(authStore.currentlyLoggedIn.avatar)
      if (error) {
        console.error('Error downloading image: ', (error as Error).message)
      }
      if (data) {
        profilePictureURL.value = URL.createObjectURL(data)
      }
    }
  }

  const removeAvatar = async (path: string) => {
    const { error } = await supabase.storage.from('avatars').remove([path])

    if (error) throw error
  }

  onMounted(() => {
    downloadAvatar()
  })

  const currentUserAvatar = computed(() => {
    if (authStore.currentlyLoggedIn) {
      return authStore.currentlyLoggedIn.avatar
    }
    return ''
  })

  watch(currentUserAvatar, (newPath, oldPath) => {
    if (newPath) {
      removeAvatar(oldPath)
    }
    downloadAvatar()
  })
</script>

<template>
  <div class="profile" v-if="authStore.currentlyLoggedIn">
    <div class="user">
      <span class="naam text-xs">
        {{ `${authStore.currentlyLoggedIn.voornaam} ${authStore.currentlyLoggedIn.achternaam}` }}
      </span>
      <span class="type text-xs" v-if="authStore.currentlyLoggedIn.specialisatie">
        {{ `${authStore.currentlyLoggedIn.specialisatie} ${authStore.currentlyLoggedIn.rol}` }}
      </span>
      <span class="type text-xs" v-else>
        {{ authStore.currentlyLoggedIn.organisatie.naam }}
      </span>
    </div>
    <WEVAvatar :profilePicture="profilePictureURL" @click="showProfileDropDown = !showProfileDropDown" />
    <div class="profile-dropdown" v-if="showProfileDropDown">
      <button @click="handleChangeAvatar" class="text-xs">Profielfoto wijzigen</button>
      <button @click="handleLogout" class="text-xs">uitloggen</button>
    </div>
    <Dialog v-model:visible="changeAvatarDialogVisible" modal :style="{ width: '30rem' }" header="Profielfoto wijzigen">
      <template #default>
        <div class="profile-picture">
          <div class="frame">
            <img v-if="profilePictureURL" :src="profilePictureURL" alt="avatar" height="120" />
            <img v-else src="/user.png" alt="avatar" height="120" />
          </div>
          <label for="profile">upload</label>
          <input type="file" id="profile" name="profile" accept="image/*" alt="profile picture file uploader" @change="handleFileUpload" />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style lang="scss" scoped>
  .profile {
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
    cursor: pointer;
  }

  .user {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;

    .naam {
      text-transform: uppercase;
      font-weight: 600;
    }
  }

  .profile-dropdown {
    position: absolute;
    top: 54px;
    right: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background-color: rgb(245, 245, 245);
    padding: 0.5rem;

    button {
      width: 200px;
      border: none;
      font-family: 'Rubik', sans-serif;
      text-transform: uppercase;
      padding: 0.5rem;
      cursor: pointer;
      background-color: white;

      &:hover {
        background-color: seagreen;
        color: #fff;
      }
    }
  }

  .profile-picture {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 2rem;

    .frame {
      width: 150px;
      height: 150px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      border-radius: 50%;
    }

    label {
      background-color: seagreen;
      padding: 1rem;
      color: #fff;
      border-radius: 0.5rem;
      cursor: pointer;
    }

    img {
      height: 100%;
    }

    input[id='profile'] {
      display: none;
    }
  }
</style>
