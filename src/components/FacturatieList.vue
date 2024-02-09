<script lang="ts" setup>
defineEmits(['selectFacturatie'])

const props = defineProps(["selectedFacturatie", "facturaties"])
</script>

<template>
    <div class="fac-list-wrapper">
        <h3>Facturatielijst</h3>
        <ul class="fac-list flex-col">
            <li v-for="fac in facturaties" :key="fac.id" :class='props.selectedFacturatie === fac.id ? "highlight" : ""'>
                <div v-if="!fac.organisatie" @click="$emit('selectFacturatie', fac.id)">
                    {{ `${fac.voornaam} ${fac.achternaam} - ${fac.emailadres}` }}
                </div>
            </li>
        </ul>
    </div>
</template>

<style lang="scss" scoped>
.fac-list {
    display: flex;
    flex-direction: column;
    gap: 7px;
    list-style: none;
    position: relative;
    margin-top: 2rem;
}

li {
    border: 1px solid #000;
    border-radius: 5px;

    >div {
        padding: 1rem;
        font-size: 1.1rem;

        &:hover {
            background-color: seagreen;
            color: #fff;
        }
    }

    &:hover {
        border-color: seagreen;
    }

    &:hover:not(.highlight) {
        cursor: pointer;
    }
}

.highlight {
    border-color: seagreen;
    background-color: seagreen;
    color: #fff;
}
</style>