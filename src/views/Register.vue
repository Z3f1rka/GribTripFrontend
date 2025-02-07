<script setup>
import { FormKit } from '@formkit/vue'
import axios from 'axios'
import { ref } from 'vue'
import router from '../router'
const submitted = ref(false)
const submitHandler = async (data) => {
  const res = await new Promise((resolve) => setTimeout(() => resolve(data), 1000))
  const API = import.meta.env.VITE_API_URL
  axios.post(API + 'auth/register', res).then((response) => {
    if (response.data.error) {
      console.log(response.data.error)
    } else {
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('refresh_token', response.data.refresh_token)
      submitted.value = true
      router.push('/')
    }
  })
  /* console.log(res) */
}
</script>
<template>
  <div class="grid grid-cols-2">
    <div class="grid"><img src="/public/image.png" /></div>
    <div class="grid m-20">
      <FormKit
        type="form"
        id="registration-example"
        :form-class="submitted ? 'hide' : 'show'"
        submit-label="Register"
        @submit="submitHandler"
        :actions="false"
      >
        <h1 class="text-2xl font-bold mb-12 mt-2">Регистрация!</h1>
        <div class="mb-5">
          <FormKit type="text" name="name" label="Имя" placeholder="Миша" validation="required" />
        </div>
        <FormKit
          type="text"
          name="email"
          label="Email"
          placeholder="Misha@example.com"
          help="Введите почту"
          validation="required|email"
        />
        <div class="double">
          <FormKit
            type="password"
            name="password"
            label="Пароль"
            validation="required|length:6|matches:/[^a-zA-Z]/"
            :validation-messages="{
              matches: 'Please include at least one symbol',
            }"
            placeholder="Пароль"
            help="Введите пароль"
          />
          <FormKit
            type="password"
            name="password_confirm"
            label="Подтвердите пароль"
            placeholder="Подтвердите пароль"
            validation="required|confirm"
            help="Введите пароль"
          />
        </div>
        <div class="mt-5 text-left">
          <FormKit type="submit">Продолжить ></FormKit>
        </div>
      </FormKit>
      <div v-if="submitted">
        <h2 class="text-xl text-green-500">Submission successful!</h2>
      </div>
    </div>
  </div>
</template>
<style scoped>
h1 {
  font-size: calc(24px + (16 + 16 * 0.7) * ((110vw - 320px) / 1280));
}
h2 {
  font-size: calc(12px + (16 + 16 * 0.7) * ((110vw - 320px) / 1280));
}
h3 {
  font-size: calc(8px + (16 + 16 * 0.7) * ((110vw - 320px) / 1280));
}
h4 {
  font-size: calc((5 + 4 * 0.7) * ((110vw - 320px) / 1280) + 2px);
  align-content: center;
}
h5 {
  font-size: calc((6 + 4 * 0.7) * ((110vw - 320px) / 1280) + 3px);
  align-content: center;
}
p {
  font-size: calc((10 + 4 * 0.7) * ((110vw - 320px) / 1280) + 5px);
  align-content: center;
}
h6 {
  font-size: calc((14 + 4 * 0.7) * ((110vw - 320px) / 1280) + 6px);
  align-content: center;
}
</style>
