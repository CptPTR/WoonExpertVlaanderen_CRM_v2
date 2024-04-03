<script lang="ts" setup>
  import { TypeKeuring } from '@/enums/modules/TypeKeuring'
  import { useCertificaatStore } from '@/stores/certificatenStore'
  import { formatFileSize } from '@/utils/formatting'
  import { Icon } from '@iconify/vue'
  import { computed } from 'vue'

  const props = defineProps(['form'])
  defineEmits(['uploadCertificaten', 'removeCertificaat'])

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
    <h2>Certificaten</h2>
    <div class="content">
      <div class="epc" v-if="props.form.type.includes(TypeKeuring.EPC)">
        <input class="hidden" type="file" name="epc_cert" id="epc_cert" multiple accept="application/pdf" @change="(event: Event) => $emit('uploadCertificaten', event, TypeKeuring.EPC)" />
        <label for="epc_cert">
          <Icon icon="mdi:upload-multiple" width="22" />
          EPC Certificaat uploaden
        </label>
        <ul v-if="epc_certificaten.length > 0">
          <li v-for="cert in epc_certificaten" :key="cert.id">
            <p>
              <span class="naam" :title="cert.naam">
                {{ cert.naam }}
              </span>
              <span class="size">
                {{ formatFileSize(cert.size) }}
              </span>
            </p>
            <button @click="(event: Event) => $emit('removeCertificaat', event, cert.naam, cert.type)">
              <Icon icon="mdi:delete" width="14" />
            </button>
          </li>
        </ul>
      </div>
      <div class="asbest" v-if="props.form.type.includes(TypeKeuring.ASBEST)">
        <input class="hidden" type="file" name="asbest_cert" id="asbest_cert" multiple accept="application/pdf" @change="(event: Event) => $emit('uploadCertificaten', event, TypeKeuring.ASBEST)" />
        <label for="asbest_cert">
          <Icon icon="mdi:upload-multiple" width="22" />
          Asbest Certificaat uploaden
        </label>
        <ul v-if="asbest_certificaten.length > 0">
          <li v-for="cert in asbest_certificaten" :key="cert.id">
            <p>
              <span class="naam" :title="cert.naam">
                {{ cert.naam }}
              </span>
              <span class="size">
                {{ formatFileSize(cert.size) }}
              </span>
            </p>
            <button @click="(event: Event) => $emit('removeCertificaat', event, cert.naam, cert.type)">
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
    flex: 1;
    padding: 4.5rem;
    background-color: #fff;
    box-shadow:
      0 0 58px 0 rgba(0, 0, 0, 0.18),
      0 0 14px 0 rgba(0, 0, 0, 0.18);

    .content {
      display: flex;
      gap: 2rem;
      margin-top: 2rem;

      .epc,
      .asbest {
        flex: 1;
      }

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
</style>
