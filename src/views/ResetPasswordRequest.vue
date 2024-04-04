<script setup lang="ts">
  import WEVBackButton from '@/components/WEVBackButton.vue'
  import { supabase } from '@/config/supabase'
  import Button from 'primevue/button'
  import InputGroup from 'primevue/inputgroup'
  import InputText from 'primevue/inputtext'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  const emailToResetPassword = ref<string>('')
  const errorMessage = ref<string>('')
  const emailSent = ref<boolean>(false)
  const router = useRouter()

  const submit = async (event: Event) => {
    event.preventDefault()

    const { data, error } = await supabase.auth.resetPasswordForEmail(emailToResetPassword.value, {
      redirectTo: `${location.origin}/reset-password`
    })

    if (error) {
      errorMessage.value = `${error.status}: ${error.message}`
      return
    }

    if (data) {
      emailSent.value = true
    }
  }

  const goToLoginView = () => {
    router.replace('/login')
  }
</script>

<template>
  <div class="container reset-password-request">
    <WEVBackButton v-show="!emailSent" @click="goToLoginView" />
    <form v-if="!emailSent">
      <h1>Wachtwoord resetten</h1>
      <InputGroup class="input-wrapper">
        <label for="email">
          Email
          <span class="required">*</span>
        </label>
        <InputText id="email" variant="filled" v-model="emailToResetPassword" aria-describedby="email-help" />
        <small id="email-help">Geef je e-mailadres in om je wachtwoord te resetten.</small>
      </InputGroup>
      <Button type="submit" @click="submit" :disabled="emailToResetPassword.length == 0">Reset wachtwoord</Button>
    </form>
    <div v-else class="email-sent">
      <h2>Aanvraag wachtwoord resetten succesvol</h2>
      <p>
        We hebben een e-mail verzonden naar het opgegeven adres: {{ emailToResetPassword }}. <br /><br />
        Controleer uw inbox voor verdere instructies. Als u de e-mail niet ziet, controleer dan uw spam- of junkmap.
      </p>

      <Button type="submit" @click="goToLoginView">Terug naar login pagina</Button>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .required {
    color: red;
  }

  .email-sent {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-top: 2rem;
    border-radius: 0.5rem;
    color: #fff;
    background-color: seagreen;
    padding: 2rem;
    font-size: 1.2rem;

    button {
      margin-top: 2rem;
      font-size: 1.6rem;
      background-color: #fff;
      color: seagreen;
      align-self: flex-start;
    }
  }

  .reset-password-request {
    display: flex;
    flex-direction: column;
    gap: 5rem;
    align-items: flex-start;
    max-width: 512px;
    padding-block: 5rem;

    .input-wrapper {
      display: flex;
      flex-direction: column;
      margin-block: 2rem;
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

    form {
      button {
        padding: 1rem 1.5rem;
        height: 40px;
        margin-top: 1rem;
        font-size: 1.6rem;
        background-color: green;
        color: #fff;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }
    }
  }
</style>