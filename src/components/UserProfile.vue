<script setup lang="ts">
import { supabase } from '@/config/supabase';
import { useAuthStore } from "@/stores/authStore";
import { vOnClickOutside } from '@vueuse/components';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();

const showProfileDropDown = ref<boolean>(false);

const closeProfileDropdown = () => {
    showProfileDropDown.value = false
}

const toggleProfileDropdown = () => {
    showProfileDropDown.value = !showProfileDropDown.value
}

const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error("Unable to sign out: ", error)
    } else {
        authStore.setCurrentlyLoggedIn(null)
        authStore.setLoggedIn(false)
        router.replace("/login")
    }
}

</script>

<template>
    <div class="profile">
        <div class="avatar">
            <div v-on-click-outside="closeProfileDropdown">
                <img src="./../assets/user.png" alt="profile placeholder" height="45" @click="toggleProfileDropdown">
                <div class="profile-dropdown" v-if="showProfileDropDown">
                    <div class="profile-content" v-if="authStore.currentlLoggedIn">
                        <button @click="handleLogout">uitloggen</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="user" v-if="authStore.currentlLoggedIn">
            <span class="naam">{{ authStore.currentlLoggedIn.voornaam + " " + authStore.currentlLoggedIn.achternaam
            }}</span>
            <span class="type">{{ authStore.currentlLoggedIn.specialisatie + " - " + authStore.currentlLoggedIn.rol
            }}</span>
        </div>
    </div>
</template>


<style lang="scss" scoped>
.profile {
    display: flex;
    flex-direction: row-reverse;
    gap: 10px;
    position: relative;
    cursor: pointer;
}

.user {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
    gap: 3px;

    .naam {
        font-size: 1.3rem;
    }

    .type {
        font-size: 1.1rem;
    }
}

.profile-dropdown {
    display: flex;
    flex-direction: column;
    position: absolute;
    right: 0;
    top: 65px;
    width: 200px;
    background-color: #fff;
    border: none;
    box-shadow: 0 26px 58px 0 rgba(0, 0, 0, .22), 0 5px 14px 0 rgba(0, 0, 0, .18);

    .profile-content {
        display: flex;
        flex-direction: column;
        gap: 15px;

        flex: 1;

        p {
            // color: #fff;
            font-size: 1.4rem;
        }
    }

    button {
        border: none;
        font-family: "Rubik", sans-serif;
        text-transform: uppercase;
        height: 40px;
        font-size: 1.4rem;
        cursor: pointer;

        &:hover {
            background-color: green;
            color: #fff;
        }
    }
}
</style>