<script lang="ts" setup>
import type { Adres } from '@/types';

defineEmits(['selectAdres'])

const props = defineProps(["selectedAdres", "adressen"])
</script>

<template>
    <div class="address-list-wrapper">
        <h3>Adressenlijst</h3>
        <ul class="address-list">
            <li v-for="adres in props.adressen" :key="adres.id">
                <div v-if="adres.id" @click="$emit('selectAdres', adres.id)">
                    {{ `${adres.straatnaam} ${adres.nummer}` }}
                </div>
            </li>

        </ul>
    </div>
</template>

<style lang="scss" scoped>
.address-list-wrapper {
    margin-block: 3rem;
    flex: 1;
}

.address-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
    list-style: none;
    position: relative;
    margin-top: 2rem;
    max-height: 336px;
    overflow: auto;
    padding-right: 1rem;
}

li {
    border: 1px solid #000;
    border-radius: 5px;

    >div {
        padding: 1rem;
        font-size: 1.1rem;
    }

    &:hover {
        cursor: pointer;
        background-color: seagreen;
        border-color: seagreen;
        color: #fff;
    }
}

.highlight {
    border-color: seagreen;
    background-color: seagreen;
    color: #fff;
}
</style>