<script setup lang="ts">
  import { supabase } from '@/config/supabase'
  import Button from 'primevue/button'
  import InputGroup from 'primevue/inputgroup'
  import InputText from 'primevue/inputtext'
  import { useToast } from 'primevue/usetoast'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const toast = useToast()

  const password = ref<string>('')
  const repeatPassword = ref<string>()
  const passwordResetted = ref<boolean>(false)

  const goBackToLogin = () => {
    router.push('/login')
  }

  const submit = async (event: Event) => {
    event.preventDefault()

    if (password.value === repeatPassword.value) {
      const { error } = await supabase.auth.updateUser({
        password: password.value
      })

      if (error) {
        toast.add({ severity: 'error', summary: 'Wachtwoord kon niet gereset worden', group: 'br', life: 5000 })
        return
      }

      passwordResetted.value = true
    }
  }
</script>

<template>
  <form class="container reset-password" v-if="!passwordResetted">
    <h1>Wachtwoord resetten</h1>
    <div class="input-group-wrapper">
      <InputGroup class="input-wrapper">
        <label for="password">
          Nieuw wachtwoord
          <span class="required">*</span>
        </label>
        <InputText id="password" variant="filled" v-model="password" aria-describedby="email-help" type="password" />
      </InputGroup>
      <InputGroup class="input-wrapper">
        <label for="repeat-password">
          Nieuw wachtwoord herhalen
          <span class="required">*</span>
        </label>
        <InputText id="repeat-password" variant="filled" v-model="repeatPassword" aria-describedby="email-help" type="password" />
      </InputGroup>
    </div>
    <button type="submit" @click="submit">Reset wachtwoord</button>
  </form>
  <div v-else class="success-message">
    <h1>Wachtwoord succesvol gereset</h1>
    <Button @click="goBackToLogin">Log in met je nieuw wachtwoord</Button>
  </div>
</template>

<style scoped lang="scss">
  .required {
    color: red;
  }

  .success-message {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    max-width: 400px;
    margin-inline: auto;
    margin-top: 3rem;

    button {
      align-self: flex-start;
    }
  }

  .reset-password {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    max-width: 400px;
    padding-block: 5rem;

    .input-wrapper {
      display: flex;
      flex-direction: column;
    }

    h1 {
      margin-bottom: 1rem;
    }

    label {
      font-size: 1.4rem;
      font-weight: bold;
    }

    input {
      margin-block: 0.5rem;
      font-size: 1.4rem;
      width: 100%;
    }

    small {
      font-size: 1rem;
    }
  }

  button {
    padding: 1rem;
    height: 40px;
    margin-top: 1rem;
    font-size: 1.6rem;
    background-color: green;
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }

  .input-group-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    margin-block: 2rem;
  }
</style>
