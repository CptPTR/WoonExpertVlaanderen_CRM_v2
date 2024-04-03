<script setup lang="ts">
  import { supabase } from '@/config/supabase'
  import { Icon } from '@iconify/vue'
  import { useToast } from 'primevue/usetoast'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const toast = useToast()

  const showPassword = ref<boolean>(false)
  const email = ref<string>('')
  const password = ref<string>('')
  const passwordErrorMessage = ref<string>('')

  const handleSignIn = async (event: Event) => {
    event.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (error) {
      toast.add({ severity: 'error', detail: 'Aanmelden mislukt', life: 5000 })
      passwordErrorMessage.value = error.message
    } else {
      toast.add({ severity: 'success', detail: 'Succesvol ingelogd!', life: 5000 })

      router.push('/keuringen')
    }
  }
</script>

<template>
  <div class="container login">
    <img src="./../assets/images/wev_logo.svg" alt="WoonExpertVlaanderen logo" height="100" />
    <form @submit="handleSignIn">
      <div class="input-email">
        <label for="e-mail">E-mail</label>
        <input type="email" name="e-mail" id="e-mail" v-model="email" />
      </div>
      <div class="input-password">
        <label for="password">Wachtwoord</label>
        <input :type="showPassword ? 'text' : 'password'" name="password" id="password" v-model="password" />
        <span class="show-password" @click="showPassword = !showPassword">
          <Icon :icon="showPassword ? 'mdi:eye' : 'mdi:eye-off'" width="21" />
        </span>
      </div>
      <small class="error">{{ passwordErrorMessage }}</small>

      <button type="submit">Aanmelden</button>
    </form>
    <div class="reset-password">
      <p>Wachtwoord vergeten?</p>
      <a href="/reset-password-request">Klik hier om het te resetten</a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .login {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
    font-family: 'Rubik', sans-serif;

    form {
      display: flex;
      flex-direction: column;
      margin-top: 50px;

      .input-email,
      .input-password {
        position: relative;

        label {
          font-size: 1.4rem;
        }

        input {
          width: 100%;
          height: 40px;
          margin-top: 5px;
          margin-bottom: 20px;
          padding-inline: 1.4rem;
          font-size: 1.4rem;
          font-family: 'Rubik', sans-serif;
          border: 2px solid rgb(226, 232, 240);
          border-radius: 0.375rem;
          outline: none;

          &:focus {
            border: 2px solid green;
          }
        }

        .show-password {
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          margin-top: 5px;
          padding-inline: 10px;
          height: 40px;
          position: absolute;
          right: 0;

          img {
            display: block;
          }
        }
      }

      .error {
        color: red;
        font-size: 1.1rem;
        // bottom: 0;
        // position: absolute;
      }

      button {
        height: 40px;
        margin-top: 20px;
        font-size: 1.6rem;
        background-color: green;
        color: #fff;
        border: none;
        border-radius: 6px;
        cursor: pointer;
      }
    }

    .reset-password {
      display: flex;
      flex-direction: column;
      align-items: center;
      // gap: 0.1rem;
      margin-top: 30px;

      p,
      a {
        font-size: 1.4rem;
      }

      a {
        text-decoration: none;
        color: #000;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
</style>
