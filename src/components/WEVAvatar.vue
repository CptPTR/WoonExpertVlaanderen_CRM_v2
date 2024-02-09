<script setup lang="ts">
import { supabase } from '@/config/supabase';
import { useAuthStore } from '@/stores/authStore';
import { vOnClickOutside } from '@vueuse/components';
import Dialog from 'primevue/dialog';
import { onMounted, ref, toRefs, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
    path: { type: String, required: true }
})
const { path } = toRefs(props);

const router = useRouter();
const authStore = useAuthStore();

const showProfileDropDown = ref<boolean>(false);
const changeAvatarDialogVisible = ref<boolean>(false);
const profilePictureURL = ref("");

const closeProfileDropdown = () => {
    showProfileDropDown.value = false
}

const toggleProfileDropdown = () => {
    showProfileDropDown.value = !showProfileDropDown.value
}

const handleChangeAvatar = () => {
    changeAvatarDialogVisible.value = true;
}

const handleFileUpload = async (event: Event) => {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
        const file = files[0];

        if (authStore.currentlyLoggedIn) {
            const { data: uploadedAvatar, error: uploadError } = await supabase.storage.from("avatars").upload(`${authStore.currentlyLoggedIn.organisatie.naam}/${file.name}`, file);

            if (uploadError) throw uploadError;

            const { error: updateGebruikerError } = await supabase.from("gebruikers").update({
                avatar: uploadedAvatar.path
            }).eq("id", authStore.currentlyLoggedIn.id);

            if (updateGebruikerError) throw updateGebruikerError;

            authStore.setCurrentlyLoggedIn({
                ...authStore.currentlyLoggedIn,
                avatar: uploadedAvatar.path
            })

            downloadAvatar();
        }
    }
}

const downloadAvatar = async () => {
    try {
        const { data, error } = await supabase.storage.from('avatars').download(path.value)
        if (error) throw error
        profilePictureURL.value = URL.createObjectURL(data)
    } catch (error) {
        console.error('Error downloading image: ', (error as Error).message)
    }
}

const removeAvatar = async (path: string) => {
    const { error } = await supabase.storage.from('avatars').remove([path]);

    if (error) throw error
}

const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Unable to sign out: ", error)
    } else {
        authStore.setCurrentlyLoggedIn(null)
        router.replace("/login")
    }
}

onMounted(() => {
    if (path.value) downloadAvatar()
})

watch(path, (newPath, oldPath) => {
    removeAvatar(oldPath);

    if (path.value) downloadAvatar();
})

</script>

<template>
    <div class="avatar">
        <div v-on-click-outside="closeProfileDropdown">
            <!-- <img src="./../assets/user.png" alt="avatar" height="45" @click="toggleProfileDropdown"> -->
            <img v-if="authStore.currentlyLoggedIn" :src="profilePictureURL" alt="avatar" height="45"
                @click="toggleProfileDropdown">
            <img v-else src="./../assets/user.png" alt="profile placeholder" height="45" @click="toggleProfileDropdown">
            <div class="profile-dropdown" v-if="showProfileDropDown">
                <div class="profile-content" v-if="authStore.currentlyLoggedIn">
                    <button @click="handleChangeAvatar">Change avatar</button>
                    <button @click="handleLogout">uitloggen</button>
                </div>
            </div>
        </div>
        <Dialog v-model:visible="changeAvatarDialogVisible" modal :style="{ width: '30rem' }">
            <template #header>
                <h2>Profielfoto uploaden</h2>
            </template>
            <template #default>
                <div class="profile-photo">
                    <!-- {{ profilePicture ? "profile" : "no profile" }}
                        <img :src="profilePicture ? profilePicture.name : './../assets/user.png'"
                            alt="profile placeholder dialog" width="100"> -->

                    <img v-if="authStore.currentlyLoggedIn" :src="profilePictureURL" alt="avatar" height="120">
                    <img v-else src="./../assets/user.png" alt="avatar" height="120">

                    <!-- <FileUpload mode="basic" accept="image/*" choose-label="Upload" @upload="handleUpload" /> -->
                    <label for="profile">
                        Change Profile picture
                    </label>
                    <input type="file" id="profile" name="profile" accept="image/*" alt="profile picture file uploader"
                        @change="handleFileUpload" />
                </div>
            </template>
        </Dialog>
    </div>
</template>



<style scoped lang="scss">
.avatar {
    img {
        border-radius: 50%;
    }
}

.profile-photo {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 2rem;

    label {
        background-color: seagreen;
        padding: 1rem;
        color: #fff;
        border-radius: 0.5rem;
        cursor: pointer;
    }

    img {
        border-radius: 50%;
    }

    input[id="profile"] {
        display: none;
    }
}

.profile-dropdown {
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 0;
    top: 65px;
    padding: 1rem;
    background-color: #fff;
    border: none;
    box-shadow: 0 26px 58px 0 rgba(0, 0, 0, .22), 0 5px 14px 0 rgba(0, 0, 0, .18);

    .profile-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        flex: 1;
    }

    button {
        border: none;
        font-family: "Rubik", sans-serif;
        text-transform: uppercase;
        padding: 1rem 2rem;
        cursor: pointer;

        &:hover {
            background-color: seagreen;
            color: #fff;
        }
    }
}
</style>