<script setup>
import Header from '@/components/Header/Header.vue'
import { ref, watch, onMounted, reactive } from 'vue'
import Card from '@/components/Main/Card.vue'
import { auth_get } from '@/request'
import { useRouter, useRoute } from 'vue-router'

const id = useRoute()['query']['id']

const router = useRouter()
let user = ref(null)
let auth = ref(false)
let selfcards = reactive({
  search: '',
  array: [],
})

if (localStorage.getItem('refresh_token') == null) {
  router.push({ path: '/login' })
  alert('Войдите для просмотра профилей')
}

async function f() {
  try {
    const data = await auth_get(`auth/user?user_id=${id}`)
    user.value = data
    if (data == undefined) {
      throw undefined
    }
  } catch (err) {
    console.log(err)
    router.push({ path: '/' })  
    alert('Такого пользователя')
  }
}
f()
watch(
  () => user.value,
  () => {
    auth.value = true
  },
)

const loading = ref(false)
const rulefive = ref(false)

const fetchData = async () => {
  loading.value = false

  try {
    selfcards.array = await auth_get(`routes/all_user_routes?user_id=${id}`)
    if (selfcards.array == undefined) {
      throw undefined
    }
  } catch (err) {
    console.error('Ошибка при запросе к первичному эндпоинту:', err)
    try {
      selfcards.array = await auth_get(`routes/all_user_public_routes?user_id=${id}`)
      if (selfcards.array == undefined) {
        throw undefined
      }
    } catch (err1) {
      console.error('Ошибка при запросе к вторичному эндпоинту:', err1)
    }
  } finally {
    loading.value = true
    if (selfcards.array.length >= 5) {
      rulefive.value = true
      selfcards.array = selfcards.array.slice(0, 5)
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>
<template>
  <div class="min-h-screen flex flex-col">
    <Header class="nav" :scroll="false" />
    <div style="margin-top: 6vw" class="grid grid-cols-8">
      <div class="col-span-3 text-center bg-gray-200" style="padding-top: 6vw; padding-bottom: 3vw">
        <img
          v-if="user && user.avatar"
          :src="user.avatar"
          class="rounded-full place-self-center"
          style="width: 8vw; margin-bottom: 2vw"
        />
        <img
          v-if="!(user && user.avatar)"
          src="/avatar.jpg"
          class="rounded-full place-self-center"
          style="width: 8vw; margin-bottom: 2vw"
        />
        <div style="font-size: 2vw">
          {{ user ? user.username : 'Имя пользователя отсутствует' }}
        </div>
        <div style="font-size: 1.5vw">
          {{ user ? user.email : 'email пользователя отсутствует' }}
        </div>
      </div>
      <div class="grid col-span-5">
        <div>
          <div
            class="content-center grid grid-rows-1 grid-cols-4 gap-2 items-center place-self-center"
            style="width: 50vw; margin-right: 1vw; margin-top: 1vw"
          >
            <router-link class="col-span-2" :to="{ path: '/register' }"
              ><div
                class="items-center rounded-lg text-center"
                style="
                  padding-left: 1vw;
                  padding-right: 1vw;
                  padding-top: 0.7vw;
                  padding-bottom: 0.7vw;
                  font-size: 1.1vw;
                  background-color: #c4d9d2;
                "
              >
                Создать Маршрут
              </div>
            </router-link>
            <router-link class="col-span-2" :to="{ path: '/login' }">
              <div
                class="items-center rounded-lg text-center"
                style="
                  padding-left: 1vw;
                  padding-right: 1vw;
                  padding-top: 0.7vw;
                  padding-bottom: 0.7vw;
                  font-size: 1.1vw;
                  background-color: #c4d9d2;
                "
              >
                Недавно оцененные
              </div></router-link
            >
          </div>
          <div v-if="selfcards.array" class="text-center" style="font-size: 1.4vw; margin-top: 1vw">
            <div v-for="item in selfcards.array" :key="item.id">
              <Card :card="item"></Card>
            </div>
            <div v-if="rulefive">
              <router-link :to="{ path: '/my_routes', query: { id: id } }"
                ><div
                  class="items-center rounded-lg text-center"
                  style="
                    margin-left: 1vw;
                    margin-right: 1vw;
                    margin-top: 0.7vw;
                    margin-bottom: 0.7vw;
                    font-size: 1vw;
                    background-color: #c4d9d2;
                  "
                >
                  Все маршруты
                </div>
              </router-link>
            </div>
          </div>
          <div
            v-if="!selfcards.array"
            class="text-center"
            style="font-size: 1.4vw; margin-top: 1vw"
          >
            маршрутов нет
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
