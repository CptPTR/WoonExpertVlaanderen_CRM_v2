<script lang="ts" setup>
import { formatFileSize } from '@/utils/formatting';
import { Icon } from '@iconify/vue';

const props = defineProps(["form"])
defineEmits(["uploadExtraDocumenten", "removeDocument"])

</script>
        
<template>
    <section class="extra-documenten">
        <h2>Extra Documenten</h2>
        <div class="content">
            <input class="hidden" type="file" name="extraDocumenten" id="extraDocumenten" multiple
                @change="(event) => $emit('uploadExtraDocumenten', event)" />
            <label for="extraDocumenten">
                <Icon icon="mdi:upload-multiple" width="22" />
                Extra documenten uploaden
            </label>
            <ul v-if="props.form.extra_documenten.length > 0">
                <li v-for="( document, index ) in  props.form.extra_documenten " :key="document.naam">
                    <p>
                        <span class="naam" :title="document.naam">
                            {{ document.naam }}
                        </span>
                        <span class="size">
                            {{ formatFileSize(document.size) }}
                        </span>
                    </p>
                    <button @click="(event) => $emit('removeDocument', event, index)">
                        <Icon icon="mdi:delete" width="14" />
                    </button>
                </li>
            </ul>
        </div>

    </section>
</template>


<style lang="scss" scoped>
.extra-documenten {
    flex: 1;
    padding: 4.5rem;
    background-color: #fff;
    box-shadow:
        0 0 58px 0 rgba(0, 0, 0, 0.18),
        0 0 14px 0 rgba(0, 0, 0, 0.18);

    .content {
        display: flex;
        flex-direction: column;
        margin-top: 2rem;

        label {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            padding-block: 2rem;
            border: 1px dashed #000;
            background-color: rgb(242, 245, 247);
            font-size: 1.4rem;
            cursor: pointer;

            &:hover {}
        }

        ul {
            list-style: none;
            max-height: 150px;
            overflow-y: auto;
            margin-block: 1rem;

            li {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-block: 1rem;

                p {
                    flex: 1;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .naam {
                    font-size: 1.4rem;
                    font-weight: bold;
                }

                .size {
                    font-size: 1.2rem;
                    padding-inline: 1rem;
                }

                button {
                    display: flex;
                    border: none;
                    border-radius: 15%;
                    background-color: crimson;
                    color: #fff;
                    padding: 0.5rem;
                    cursor: pointer;
                }
            }
        }
    }
}

// .extradocs {
//     display: flex;
//     gap: 20px;

//     >div {
//         flex: 1;
//         border-left: solid 1px #0000006c;
//         padding-left: 20px;

//         ul {
//             list-style: none;
//             max-height: 150px;
//             overflow-y: auto;
//             margin-block: 1rem;

//             li {
//                 display: flex;
//                 justify-content: space-between;
//                 font-size: 1.4rem;
//                 margin-block: 1rem;
//             }
//         }
//     }
// }
</style>