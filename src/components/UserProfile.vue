<script setup lang="ts">
import { useAuthStore } from "@/stores/authStore";
import WEVAvatar from "./WEVAvatar.vue";

const authStore = useAuthStore();

</script>

<template>
    <div class="profile" v-if="authStore.currentlyLoggedIn">
        <WEVAvatar :path="authStore.currentlyLoggedIn.avatar" />
        <div class="user">
            <span class="naam">{{ authStore.currentlyLoggedIn.voornaam + " " +
                authStore.currentlyLoggedIn.achternaam }}</span>
            <span class="type">{{ authStore.currentlyLoggedIn.specialisatie + " - " + authStore.currentlyLoggedIn.rol
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

    img {
        border-radius: 50%;
    }
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
</style>