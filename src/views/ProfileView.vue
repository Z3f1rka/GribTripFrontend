<script setup>
import Header from '@/components/Header/Header.vue'
import { ref, watch, onMounted, reactive, computed } from 'vue'
import Card from '@/components/Main/Card.vue'
import { auth_get, auth_post } from '@/request'
import { useRouter, useRoute } from 'vue-router'

const id = useRoute()['query']['id']

const gradientStartColor = computed(() => '#080E1A')

let Active = ref(0)
const router = useRouter()
let user = ref(null)
let auth = ref(false)
let selfcards = reactive({
  search: '',
  array: [],
})
let historycards = reactive({
  search: '',
  array: [],
})
const mainImage = ref(null)
const loading = ref(false)
const imageUrl = ref('')

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
    if (user.value.photo != undefined && user.value.photo != null && user.value.photo != '') {
      imageUrl.value = import.meta.env.VITE_FILES_API_URL + 'files/download/' + user.value.photo
    }
  } catch (err) {
    console.log(err)
    router.push({ path: '/' })
    alert('Такого пользователя нет')
  }
}
f()
watch(
  () => user.value,
  () => {
    auth.value = true
  },
)

async function AddImage(event) {
  loading.value = false
  mainImage.value = event.target.files[0]
  console.log(mainImage)
  if (
    mainImage.value != null &&
    imageUrl.value != import.meta.env.VITE_FILES_API_URL + 'files/download/' + user.value.photo
  ) {
    let formData = new FormData()
    formData.append('file', mainImage.value)
    imageUrl.value = await auth_post(
      'files/upload',
      formData,
      import.meta.env.VITE_FILES_API_URL,
      'multipart/form-data',
    )
    await auth_post('auth/update', { avatar: imageUrl.value })
    imageUrl.value = import.meta.env.VITE_FILES_API_URL + 'files/download/' + imageUrl.value
  }
}
watch(
  () => imageUrl.value,
  () => {
    loading.value = true
  },
)

const loadingM = ref(false)
const loadingH = ref(false)
const rulefive = ref(false)
const rulefiveH = ref(false)

const fetchData = async () => {
  loadingM.value = false

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
    loadingM.value = true
    if (selfcards.array.length >= 6) {
      rulefive.value = true
      selfcards.array = selfcards.array.slice(0, 6)
    }
  }
}
const fetchDataH = async () => {
  loadingH.value = false
  try {
    historycards.array = await auth_get(`history/routes/other_user?user_id=${id}`)
    if (historycards.array == undefined) {
      throw undefined
    }
  } catch (err) {
    console.log(err)
  } finally {
    loadingH.value = true
    if (historycards.array.length >= 6) {
      rulefiveH.value = true
      historycards.array = historycards.array.slice(0, 6)
    }
  }
}

const rulefiveF = ref(false)
const loadingF = ref(false)
const favoritescards = reactive({
  search: '',
  array: [],
})

const fetchDataI = async () => {
  loadingF.value = false
  try {
    favoritescards.array = await auth_get(`auth/favorites/fetch/other?user_id=${id}`)
    if (favoritescards.array == undefined) {
      throw undefined
    }
  } catch (err) {
    console.log(err)
  } finally {
    loadingF.value = true
    if (favoritescards.array.length >= 6) {
      rulefiveF.value = true
      favoritescards.array = favoritescards.array.slice(0, 6)
    }
  }
}
async function NewRoute() {
  try {
    const newid = await auth_post(`routes/create`, { title: 'Новый маршрут' })
    console.log(newid)
    router.push(`/create_route?id=${newid}`)
  } catch (err) {
    console.log(err)
  }
}

onMounted(() => {
  fetchData()
})
onMounted(() => {
  fetchDataH()
})
onMounted(() => {
  fetchDataI()
})
</script>
<template>
  <div class="min-h-screen flex flex-col overflow-hidden">
    <div
      style="
        position: fixed;
        background-image: url('/wood.jpg');
        background-size: cover;
        background-position: center center;
        filter: blur(20px);
        width: 150%;
        height: 150%;
        left: -50px;
      "
    ></div>
    <Header class="nav" :scroll="false" />
    <div class="flex-grow bg-gradient-to-b">
      <div class="grid sticky">
        <div
          class="text-slate-900 grid grid-cols-5 bg-slate-50"
          style="
            border-width: 1px;
            border-color: white;
            padding-top: max(12vw, 40px);
            padding-bottom: 6vw;
            margin-left: 4vw;
            margin-right: 4vw;
          "
        >
          <div class="grid col-span-1 justify-center text-center">
            <img
              v-if="user && user.avatar"
              :src="imageUrl"
              class="rounded-lg"
              style="width: 12vw"
            />
            <img
              v-if="!(user && user.avatar)"
              src="/avatar.jpg"
              class="rounded-lg"
              style="width: 12vw"
            />
          </div>
          <div class="col-span-4 flex justify-between">
            <div class="text-left grid">
              <div style="font-size: 4vw">
                {{ user ? user.username : 'Имя пользователя отсутствует' }}
              </div>
              <div style="font-size: 1.5vw" class="text-slate-700">
                {{ user ? user.email : 'email пользователя отсутствует' }}
              </div>
            </div>
            <div style="margin-top: 1vw; margin-right: 3vw" class="text-right flex">
              <div style="text-align: center; font-size: 1.5vw; margin: 1vw">
                <div style="margin-bottom: 1vw; font-size: 2.5vw">
                  {{ selfcards.array.length }}
                </div>
                <div>Мои маршруты</div>
              </div>
              <div style="text-align: center; font-size: 1.5vw; margin: 1vw">
                <div style="margin-bottom: 1vw; font-size: 2.5vw">
                  {{ favoritescards.array.length }}
                </div>
                <div>Избранные</div>
              </div>
              <div style="text-align: center; font-size: 1.5vw; margin: 1vw">
                <div style="margin-bottom: 1vw; font-size: 2.5vw">
                  {{ historycards.array.length }}
                </div>
                <div>Отмеченные</div>
              </div>
            </div>
          </div>
        </div>
        <div class="grid" style="margin-top: max(6vw, 40px)">
          <div>
            <div
              class="content-center grid grid-rows-1 grid-cols-10 items-center place-self-center text-white select-none"
              style="width: 50vw; margin-top: 1vw"
            >
              <div></div>
              <div class="col-span-7 justify-center flex">
                <div
                  @click="Active = 0"
                  class="rounded-l-lg inline-block cursor-pointer"
                  style="
                    padding-left: 1.5vw;
                    padding-right: 1.5vw;
                    padding-top: 0.7vw;
                    padding-bottom: 0.7vw;
                    font-size: 1.1vw;
                    border-width: 1px;
                    transition:
                      background-color 0.3s ease,
                      color 0.3s ease;
                  "
                  :style="{
                    backgroundColor: Active === 0 ? 'white' : '',
                    color: Active === 0 ? 'black' : 'white',
                  }"
                >
                  Мои маршруты
                </div>
                <div
                  class="inline-block cursor-pointer"
                  @click="Active = 1"
                  style="
                    padding-left: 1.5vw;
                    padding-right: 1.5vw;
                    padding-top: 0.7vw;
                    padding-bottom: 0.7vw;
                    font-size: 1.1vw;
                    border-width: 1px;
                    transition:
                      background-color 0.3s ease,
                      color 0.3s ease;
                  "
                  :style="{
                    backgroundColor: Active === 1 ? 'white' : '',
                    color: Active === 1 ? 'black' : 'white',
                  }"
                >
                  Избранные
                </div>
                <div
                  class="rounded-r-lg cursor-pointer"
                  @click="Active = 2"
                  style="
                    padding-left: 1.5vw;
                    padding-right: 1.5vw;
                    padding-top: 0.7vw;
                    padding-bottom: 0.7vw;
                    font-size: 1.1vw;
                    border-width: 1px;
                    transition: 0.3s ease;
                  "
                  :style="{
                    backgroundColor: Active === 2 ? 'white' : '',
                    color: Active === 2 ? 'black' : 'white',
                  }"
                >
                  Оцененные
                </div>
              </div>
              <div class="col-span-1 flex justify-center" @click="NewRoute()">
                <div
                  class="rounded-lg text-center cursor-pointer plus-button-style"
                  style="
                    padding-left: 1vw;
                    padding-right: 1vw;
                    padding-top: 0.7vw;
                    padding-bottom: 0.7vw;
                    font-size: 1.1vw;
                    border-width: 1px;
                  "
                >
                  +
                </div>
              </div>
            </div>
            <div
              v-if="loadingM && Active === 0"
              style="
                margin-right: 1vw;
                margin-left: 0.3vw;
                margin-bottom: 3vw;
                transition: 0.3s ease;
              "
            >
              <div class="text-white inline-grid grid-cols-2">
                <div v-for="item in selfcards.array" :key="item.id">
                  <div>
                    <router-link :to="{ path: '/create_route', query: { id: item.main_route_id } }">
                      <Card :card="item" style="border-width: 1px; border-color: white"></Card>
                    </router-link>
                  </div>
                </div>
              </div>
              <div v-if="rulefive" class="flex justify-center" style="margin-top: 2vw">
                <router-link :to="{ path: '/my_routes', query: { id: id } }"
                  ><div
                    class="items-center rounded-lg text-center hover:bg-white hover:text-black text-white active:scale-95"
                    style="
                      margin-top: 1vw;
                      padding-left: 1vw;
                      padding-right: 1vw;
                      padding-top: 0.7vw;
                      padding-bottom: 0.7vw;
                      font-size: 1vw;
                      border-width: 1px;
                      transition: 0.3s ease;
                    "
                  >
                    Все маршруты
                  </div>
                </router-link>
              </div>
            </div>
            <transition name="fade" mode="out-in">
              <div key="transition-wrapper" style="transition: 0.3s ease; margin-bottom: auto">
                <div
                  v-if="loadingH && Active === 2"
                  class="text-white flex justify-center items-center flex-wrap content-box"
                  style="
                    margin-right: 1vw;
                    margin-left: 0.3vw;
                    margin-bottom: 3vw;
                    transition: 0.3s ease;
                  "
                >
                  <div v-for="item in historycards.array" :key="item.id">
                    <router-link :to="{ path: '/card', query: { id: item.main_route_id } }">
                      <Card :card="item" style="border-width: 1px; border-color: white"></Card>
                    </router-link>
                  </div>
                  <div v-if="rulefiveH" class="flex container justify-center">
                    <router-link :to="{ path: '/history', query: { id: item.user_id } }"
                      ><div
                        class="items-center rounded-lg text-center hover:bg-white hover:text-black"
                        style="
                          margin-top: 1vw;
                          padding-left: 1vw;
                          padding-right: 1vw;
                          padding-top: 0.7vw;
                          padding-bottom: 0.7vw;
                          font-size: 1vw;
                          border-width: 1px;
                          transition: 0.1s ease;
                        "
                      >
                        Все маршруты
                      </div>
                    </router-link>
                  </div>
                </div>
                <div
                  v-if="loadingF && Active === 1"
                  class="text-white flex justify-center items-center flex-wrap content-box"
                  style="
                    margin-right: 1vw;
                    margin-left: 0.3vw;
                    margin-bottom: 3vw;
                    transition: 0.3s ease;
                  "
                >
                  <div v-for="item in favoritescards.array" :key="item.id">
                    <router-link :to="{ path: '/card', query: { id: item.route_id } }">
                      <Card
                        :card="item.route"
                        style="border-width: 1px; border-color: white"
                      ></Card>
                    </router-link>
                  </div>
                  <div v-if="rulefiveF" class="flex container justify-center">
                    <router-link :to="{ path: '/history', query: { id: id } }"
                      ><div
                        class="items-center rounded-lg text-center hover:bg-white hover:text-black"
                        style="
                          margin-top: 1vw;
                          padding-left: 1vw;
                          padding-right: 1vw;
                          padding-top: 0.7vw;
                          padding-bottom: 0.7vw;
                          font-size: 1vw;
                          border-width: 1px;
                          transition: 0.1s ease;
                        "
                      >
                        Все маршруты
                      </div>
                    </router-link>
                  </div>
                </div>
                <div
                  v-if="favoritescards.array.length === 0 && Active === 1"
                  class="text-center text-white content-box"
                  style="font-size: 1.4vw; margin-top: 2vw; margin-bottom: 20vw"
                >
                  Нет избранных маршрутов
                </div>
                <div
                  v-if="selfcards.array.length === 0 && Active === 0"
                  class="text-center text-white content-box"
                  style="font-size: 1.4vw; margin-top: 2vw; margin-bottom: 20vw"
                >
                  Нет моих маршрутов
                </div>
                <div
                  v-if="historycards.array.length === 0 && Active === 2"
                  class="text-center text-white content-box"
                  style="font-size: 1.4vw; margin-top: 2vw; margin-bottom: 20vw"
                >
                  Нет оцененнных маршрутов
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.fade-enter-from {
  opacity: 0;
}

.fade-enter-active {
  transition: opacity 0.3s ease-out;
}

.fade-enter-to {
  opacity: 1;
}

.fade-leave-from {
  opacity: 1;
}

.fade-leave-active {
  transition: opacity 0.3s ease-in;
  position: absolute; /* Важно для корректного удаления */
}

.fade-leave-to {
  opacity: 0;
}
.plus-button-style {
  padding-left: 1vw;
  padding-right: 1vw;
  padding-top: 0.7vw;
  padding-bottom: 0.7vw;
  font-size: 1.1vw;
  border-width: 1px;
  border-style: solid; /* Обязательно укажите style, чтобы border отображался */
  border-color: white; /* Исходный цвет рамки */
  color: white;
  transition:
    border-color 0.3s ease,
    transform 0.2s ease; /* Добавлена transition */
  /* transform: scale(1); /*  Добавьте это, если хотите гарантировать начальный масштаб */
}

.plus-button-style:hover {
  border-color: #007bff; /* Цвет рамки при наведении (пример: синий) */
  color: #007bff;
}
</style>
