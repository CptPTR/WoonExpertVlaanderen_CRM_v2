<script lang="ts" setup>
  import { TypeKeuring } from '@/enums/modules/TypeKeuring'
  import { useCertificaatStore } from '@/stores/certificatenStore'
  import { formatFileSize } from '@/utils/formatting'
  import { Icon } from '@iconify/vue'
  import { computed } from 'vue'

  const props = defineProps(['form'])
  const emits = defineEmits(['uploadCertificaten', 'removeCertificaat', 'toggleSubForm'])

  const certificatenStore = useCertificaatStore()

  const epc_certificaten = computed(() => {
    return certificatenStore.certificaten.filter((cert) => cert.type.includes(TypeKeuring.EPC))
  })

  const asbest_certificaten = computed(() => {
    return certificatenStore.certificaten.filter((cert) => cert.type.includes(TypeKeuring.ASBEST))
  })
</script>

<template>
  <section class="certificaten">
    <div class="top-bar">
      <h2 class="text-lg">Certificaten</h2>
      <Icon icon="mdi:close" width="22" class="icon" @click="emits('toggleSubForm')" />
    </div>
    <div class="content">
      <div class="epc" v-if="props.form.type.includes(TypeKeuring.EPC)">
        <input class="hidden" type="file" name="epc_cert" id="epc_cert" multiple accept="application/pdf" @change="(event: Event) => emits('uploadCertificaten', event, TypeKeuring.EPC)" />
        <label for="epc_cert">
          <Icon icon="mdi:upload-multiple" width="22" />
          upload EPC certificaat
        </label>
        <ul v-if="epc_certificaten.length > 0">
          <li v-for="cert in epc_certificaten" :key="cert.id">
            <p>
              <span class="naam text-sm" :title="cert.naam">
                {{ cert.naam }}
              </span>
              <span class="size text-sm">
                {{ formatFileSize(cert.size) }}
              </span>
            </p>
            <button @click="(event: Event) => emits('removeCertificaat', event, cert.id, cert.type)">
              <Icon icon="mdi:delete" width="14" />
            </button>
          </li>
        </ul>
      </div>

      <div class="asbest" v-if="props.form.type.includes(TypeKeuring.ASBEST)">
        <input class="hidden" type="file" name="asbest_cert" id="asbest_cert" multiple accept="application/pdf" @change="(event: Event) => $emit('uploadCertificaten', event, TypeKeuring.ASBEST)" />
        <label for="asbest_cert">
          <Icon icon="mdi:upload-multiple" width="22" />
          upload Asbest certificaat
        </label>
        <ul v-if="asbest_certificaten.length > 0">
          <li v-for="cert in asbest_certificaten" :key="cert.id">
            <p>
              <span class="naam text-sm" :title="cert.naam">
                {{ cert.naam }}
              </span>
              <span class="size text-sm">
                {{ formatFileSize(cert.size) }}
              </span>
            </p>
            <button @click="(event: Event) => $emit('removeCertificaat', event, cert.id, cert.type)">
              <Icon icon="mdi:delete" width="14" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .certificaten {
    position: absolute;
    background-color: #fff;
    display: flex;
    flex-direction: column;
    padding: 3rem 4rem;
    max-height: 600px;

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
      gap: 2rem;
      margin-top: 2rem;

      .epc,
      .asbest {
        width: 500px;
      }

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
            width: 300px;
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
