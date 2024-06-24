<script lang="ts" setup>
  import { useExtraDocumentStore } from '@/stores/extraDocumentenStore'
  import { formatFileSize } from '@/utils/formatting'
  import { Icon } from '@iconify/vue'

  defineEmits(['uploadExtraDocumenten', 'removeDocument', 'hideSubForm'])

  const extraDocumentenStore = useExtraDocumentStore()
</script>

<template>
  <section class="extra-documenten">
    <div class="top-bar">
      <h2 class="text-lg">Extra Documenten</h2>
      <Icon icon="mdi:close" width="22" class="icon" @click="$emit('hideSubForm')" />
    </div>

    <div class="content">
      <input class="hidden" type="file" name="extraDocumenten" id="extraDocumenten" multiple @change="(event: Event) => $emit('uploadExtraDocumenten', event)" />
      <label class="text-sm" for="extraDocumenten">
        <Icon icon="mdi:upload-multiple" width="22" />
        upload document
      </label>
      <ul v-if="extraDocumentenStore.extra_documenten.length > 0">
        <li v-for="document in extraDocumentenStore.extra_documenten" :key="document.naam">
          <p>
            <span class="naam text-sm" :title="document.naam">
              {{ document.naam }}
            </span>
            <span class="size text-sm">
              {{ formatFileSize(document.size) }}
            </span>
          </p>
          <button @click="(event: Event) => $emit('removeDocument', event, document.naam)">
            <Icon icon="mdi:delete" width="14" />
          </button>
        </li>
      </ul>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .extra-documenten {
    position: absolute;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    padding: 3rem 4rem;
    max-height: 600px;
    width: 750px;

    .top-bar {
      display: flex;
      justify-content: space-between;

      .icon {
        border-radius: 15%;
        cursor: pointer;

        &:hover {
          background-color: lightgray;
          color: #fff;
        }
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      margin-top: 2rem;

      label {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        padding-block: 2rem;
        border: 1px dashed #000;
        background-color: rgb(245, 245, 245);
        cursor: pointer;
        font-family: 'Rubik', sans-serif;
        font-size: 1rem;
        font-weight: normal;
      }

      ul {
        list-style: none;
        max-height: 300px;
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
            font-weight: bold;
            flex: 1;
            width: 0px;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .size {
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
</style>
