<script setup>
import Header from '@/components/Header/Header.vue'
import { ref, watch, onMounted, reactive } from 'vue'
import Card from '@/components/Main/Card.vue'
import { auth_get } from '@/request'
import { useRouter } from 'vue-router'

const router = useRouter()
let user = ref(null)
let auth = ref(false)
let selfcards = reactive({
  search: '',
  array: [],
})
function mySort(searchKey) {
  let matchedKeys = [],
    notMatchedKeys = []
  for (let i = 0; i < selfcards.array.length; i++) {
    if (selfcards.array[i]['title'].toLowerCase().includes(searchKey.toLowerCase())) {
      matchedKeys.push(selfcards.array[i])
    } else {
      notMatchedKeys.push(selfcards.array[i])
    }
  }
  return matchedKeys.concat(notMatchedKeys)
}
watch(
  () => selfcards.search,
  () => {
    selfcards.array = mySort(selfcards.search)
  },
)

async function f() {
  try {
    const data = await auth_get('auth/me')
    user.value = data
  } catch (error) {
    router.push({ path: '/login' })
  }
}
f()
watch(
  () => user.value,
  (newValue) => {
    console.log(newValue)
    auth.value = true
  },
)
/*
async function f1() {
  try {
    const data = await auth_get('')
    selfcards.value = data
  } catch (error) {
    console.error('Ошибка при загрузке данных пользователя:', error)
  }
}

onMounted(async () => {
  await f1()
})
  */
</script>
<template>
  <div class="min-h-screen flex flex-col">
    <Header class="nav" :scroll="false" />
    <div style="margin-top: 6vw" class="grid grid-rows-1 grid-cols-8">
      <div
        class="grid col-span-3 text-center content-center justify-center bg-gray-200"
        style="padding-top: 6vw; padding-bottom: 3vw"
      >
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
          <div v-if="selfcards.value" class="text-center" style="font-size: 1.4vw; margin-top: 1vw">
            <div class="relative" style="width: 50vw">
              <input
                placeholder="Поиск"
                v-model="selfcards.search"
                style="font-size: 2.5vw; padding-left: 2vw; padding-top: 1vw; padding-bottom: 1vw"
                class="w-full rounded-lg bg-zinc-100 focus:outline-none"
              />
              <div
                class="absolute inset-y-0 flex items-center pointer-events-none justify-center"
                style="right: 1.3vw"
              >
                <img
                  src="/search.png"
                  alt="Поиск"
                  class="text-gray-400"
                  style="width: 3vw; height: 3vw"
                />
              </div>
            </div>
            <div v-for="item in selfcards.array" :key="item.id">
              <Card :card="item"></Card>
            </div>
          </div>
          <div
            v-if="!selfcards.value"
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
