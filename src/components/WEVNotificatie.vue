<script setup lang="ts">
import { Icon } from "@iconify/vue";
import { defineProps } from "vue"

const props = defineProps(['title', 'message', 'bgColor'])

</script>

<template>
    <div class="notification" :style="{ backgroundColor: props.bgColor }">
        <Icon icon="mdi:check-circle" width="20" />
        <p>{{ props.message }}</p>
    </div>
</template>

<style scoped lang="scss">
.notification {
    position: absolute;
    bottom: 2rem;
    right: 2rem;
    padding: 0.5rem 1rem;
    // width: 300px;
    // height: 100px;
    background-color: seagreen;
    color: #fff;
    border-radius: 5px;
    display: flex;
    align-items: center;
    gap: 1rem;

    p {
        font-size: 1.6rem;
    }
}
</style>