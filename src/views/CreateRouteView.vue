<script setup>
import { ref, onMounted, watch } from 'vue'
import Header from '@/components/Header/Header.vue'
import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
import '/leaflet-routing-machine-3.2.12/dist/leaflet-routing-machine.js'
import '/lrm-graphhopper-1.2.0.js'
import { auth_get, auth_post } from '@/request'
import router from '../router'
import { useRouter, useRoute } from 'vue-router'

// В комментах указания для создания из этого страницы отображения и (!) то что тут + добавь хедер и получение айди из адреса
const routeId = useRoute()['query']['id']
const mapContainer = ref()
const api_key = import.meta.env.VITE_GRAPHHOPPER_API_KEY
const map = ref()
const control = ref()
const mainData = ref()
const title = ref('')
const text = ref('')
var points = ref([])
var count = 0
const imageUrl = ref('')
const NoImage = ref('/upload-photo.png')
const success = ref(false)
// Выше переменные нужные для загрузки
const userLat = ref(0)
const userLon = ref(0)
const mainImage = ref(null)
const buttonText = ref('Добавить точку')
const loading = ref(false)

onMounted(() => {
  fetchData()
  watch(
    () => mainData.value,
    () => {
      success.value = true
      title.value = mainData.value[0].title
      text.value = mainData.value[0].description
      if (mainData.value[0].photo != undefined && mainData.value[0].photo != null) {
        imageUrl.value =
          import.meta.env.VITE_FILES_API_URL + 'files/download/' + mainData.value[0].photo
      }
      if (mainData.value[0].content_blocks != null) {
        mainData.value[0].content_blocks.forEach((item) => {
          let images = []
          item.images.forEach((image) => {
            images.push({
              file: null,
              fileUrl: import.meta.env.VITE_FILES_API_URL + 'files/download/' + image,
            })
          })
          points.value.push({
            lat: item.geoposition[0],
            lon: item.geoposition[1],
            id: count,
            text: item.text,
            position: item.position,
            oldPosition: item.position,
            title: item.title,
            images: images,
          })
          count++
        })
      }
      // этот промис и его обработку вырезать от сюда
      const promise = new Promise((resolve, reject) => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            resolve({ lat: position.coords.latitude, lon: position.coords.longitude })
          })
        } else {
          resolve({ lat: 0, lon: 0 })
        }
      })
      promise.then((result) => {
        userLat.value = result.lat
        userLon.value = result.lon
        // До сюда и далее будет
        map.value = L.map(mapContainer.value).setView([userLat.value, userLon.value], 13) // setView можешь хоть 0 0 поставить
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map.value)
        control.value = L.Routing.control({
          waypoints: [],
          router: L.Routing.graphHopper(api_key, {
            urlParameters: { vehicle: 'foot', locale: 'ru' },
          }),
          language: 'ru',
          draggableWaypoints: false,
          addWaypoints: false,
        }).addTo(map.value)
        control.value.setWaypoints(points.value.map((p) => L.latLng(p.lat, p.lon)))
        //То что ниже убираешь
        map.value.on('click', function (e) {
          if (is_add.value == true) {
            buttonText.value = 'Добавить точку'
            points.value.push({
              lat: e.latlng.lat,
              lon: e.latlng.lng,
              id: count,
              text: '',
              position: points.value.length + 1,
              oldPosition: points.value.length + 1,
              title: '',
              images: [],
            })
            is_add.value = false
            control.value.setWaypoints(points.value.map((p) => L.latLng(p.lat, p.lon)))
            count++
          }
        })
      })
      // до этой строчки
    },
  )
})

var is_add = ref(false) // не нужно

async function fetchData() {
  try {
    let data = await auth_get(`routes/get_by_main_route_id_private?route_id=${routeId}`)
    if (data == undefined || data[0].status == 'check') {
      throw undefined
    }
    mainData.value = data
  } catch {
    alert('У вас нет доступа к этому маршруту')
    router.push({ path: '/' })
  }
}

let savedone = ref(false)
// Убираешь от этой строчки
async function Save() {
  savedone.value = false
  let content_blocks = []
  for (let i = 0; i <= points.value.length - 1; i++) {
    let p = points.value[i]
    let formData = new FormData()
    let data = []
    if (p.images.length > 0) {
      p.images.forEach((image) => {
        if (image.file != null) {
          formData.append('files', image.file)
        } else {
          data.push(
            image.fileUrl.slice((import.meta.env.VITE_FILES_API_URL + 'files/download/').length),
          )
        }
      })
      if (formData.has('files')) {
        data.push(
          ...(await auth_post(
            'files/upload_list_files',
            formData,
            import.meta.env.VITE_FILES_API_URL,
            'multipart/form-data',
          )),
        )
      }
    }
    content_blocks.push({
      text: p.text,
      title: p.title,
      position: p.position,
      geoposition: [p.lat, p.lon],
      images: data,
    })
  }
  let image
  if (
    (mainImage.value != null) &&
    (imageUrl.value !=
      import.meta.env.VITE_FILES_API_URL + 'files/download/' + mainData.value[0].photo)
  ) {
    console.log(mainImage.value)
    console.log(imageUrl.value)
    let formData = new FormData()
    formData.append('file', mainImage.value)
    image = await auth_post(
      'files/upload',
      formData,
      import.meta.env.VITE_FILES_API_URL,
      'multipart/form-data',
    )
  } else {
    image = imageUrl.value.slice((import.meta.env.VITE_FILES_API_URL + 'files/download/').length)
  }
  let data = {
    title: title.value,
    description: text.value,
    content_blocks: content_blocks,
    photo: image,
    main_route_id: routeId,
  }
  auth_post('routes/update', data)
  savedone.value = true
}

async function Public() {
  Save()
  watch(
    () => savedone.value,
    async () => {
      try {
        await auth_post(`routes/publication_request?route_id=${routeId}`)
        let profile = await auth_get(`auth/me`)
        router.push(`/profile?id=${profile.id}`)
      } catch (err) {
        console.log(err)
      }
    },
  )
}

function AddPoint() {
  is_add.value = true
  buttonText.value = 'Нажмите на желаемое место на карте'
}

async function AddImage(event) {
  loading.value = false
  mainImage.value = event.target.files[0]
  imageUrl.value = await URL.createObjectURL(mainImage.value)
}
watch(
  () => imageUrl.value,
  () => {
    loading.value = true
  },
)

async function AddPointImage(event, id) {
  var index = 0
  var url = await URL.createObjectURL(event.target.files[0])
  for (let i = 0; i < points.value.length; i++) {
    if (points.value[i].id == id) {
      index = i
    }
  }
  points.value[index].images.push({ file: event.target.files[0], fileUrl: url })
}

function DeletePointImage(id, fileUrl) {
  var index = 0
  for (let i = 0; i < points.value.length; i++) {
    if (points.value[i].id == id) {
      index = i
    }
  }
  for (let i = 0; i < points.value[index].images.length; i++) {
    if (points.value[index].images[i].fileUrl == fileUrl) {
      points.value[index].images.splice(i, 1)
      i--
    }
  }
}

function ReRoute() {
  points.value.sort((a, b) => parseFloat(a.position) - parseFloat(b.position))
  control.value.setWaypoints(points.value.map((p) => L.latLng(p.lat, p.lon)))
}

function RePosition(id) {
  var index = 0
  for (let i = 0; i < points.value.length; i++) {
    if (points.value[i].id == id) {
      index = i
    }
  }
  if (points.value[index].position > points.value[index].oldPosition) {
    if (points.value[index].position > points.value.length) {
      points.value[index].position = points.value.length
    }
    for (let i = 0; i < points.value.length; i++) {
      if (
        (points.value[index].oldPosition <= points.value[i].position) &
        (points.value[i].position <= points.value[index].position) &
        (i != index)
      ) {
        points.value[i].position -= 1
      }
    }
  } else {
    for (let i = 0; i < points.value.length; i++) {
      if (
        (points.value[index].oldPosition >= points.value[i].position) &
        (points.value[i].position >= points.value[index].position) &
        (i != index)
      ) {
        points.value[i].position += 1
      }
    }
  }
  for (let i = 0; i < points.value.length; i++) {
    points.value[i].oldPosition = points.value[i].position
  }
  ReRoute()
}

function DeletePoint(id) {
  var index = 0
  for (let i = 0; i < points.value.length; i++) {
    if (points.value[i].id == id) {
      index = i
    }
  }
  var position = points.value[index].position
  for (let i = 0; i < points.value.length; i += 1) {
    if (points.value[i].position > position) {
      points.value[i].position -= 1
    } else if (points.value[i].id == id) {
      points.value.splice(i, 1)
      i--
    }
  }
  ReRoute()
}
// До этой наверное
// По странице сам поймешь
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="flex-grow bg-gradient-to-b z-10">
      <Header class="nav" :scroll="false" />
      <div class="grid grid-cols-5" v-if="success" style="margin-top: max(6vw, 50px)">
        <div class="col-span-2 h-screen overflow-auto">
          <div class="overflow-hidden bg-slate-200" style="padding: 1.5vw">
            <input
              placeholder="Введите название"
              class="w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              style="
                font-size: 1.8vw;
                padding-bottom: 0.3vw;
                padding-top: 0.3vw;
                padding-left: 0.5vw;
                padding-right: 0.5vw;
              "
              v-model="title"
            />
            <div class="grid grid-cols-5">
              <textarea
                class="col-span-3 resize-none rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Описание маршрута"
                v-model="text"
                style="
                  margin-top: 1vw;
                  margin-right: 1vw;
                  height: 11vw;
                  font-size: 1.3vw;
                  padding-bottom: 0.3vw;
                  padding-top: 0.3vw;
                  padding-left: 0.5vw;
                  padding-right: 0.5vw;
                "
              ></textarea>
              <label
                class="col-span-2 overflow-hidden rounded-sm active:scale-95"
                style="margin-top: 1vw; height: 11vw; transition: transform 0.1s ease"
              >
                <input
                  type="file"
                  accept="image/*"
                  @change="AddImage"
                  style="display: none"
                  class="h-full w-full"
                />
                <img
                  :src="imageUrl"
                  v-if="loading && imageUrl != ''"
                  class="object-cover h-full w-full"
                  style=""
                />
                <img
                  :src="NoImage"
                  v-else
                  class="object-cover h-full w-full"
                  style="object-fit: contain"
                />
              </label>
            </div>
            <div style="margin-top: 1vw" class="inline-flex">
              <div
                class="rounded-lg cursor-pointer text-white bg-indigo-500 active:scale-95"
                @click="Save"
                style="
                  padding-bottom: 0.5vw;
                  padding-top: 0.5vw;
                  padding-left: 0.8vw;
                  padding-right: 0.8vw;
                  margin-right: 1vw;
                  font-size: 1.1vw;
                  transition: transform 0.1s ease;
                "
              >
                Сохранить
              </div>
              <div
                class="rounded-lg cursor-pointer text-white active:scale-95"
                @click="Public"
                style="
                  padding-bottom: 0.5vw;
                  padding-top: 0.5vw;
                  padding-left: 0.8vw;
                  padding-right: 0.8vw;
                  font-size: 1.1vw;
                  background-color: #a3cfdf;
                  transition: transform 0.1s ease;
                "
              >
                Отправить
              </div>
              <router-link :to="{ path: '/versions', query: { id: routeId } }"
                      >
              <div
                class="rounded-lg cursor-pointer text-slate-900 active:scale-95 self-end "
                style="
                  padding-bottom: 0.5vw;
                  padding-top: 0.5vw;
                  padding-left: 0.8vw;
                  padding-right: 0.8vw;
                  margin-left: 1vw;
                  font-size: 1.1vw;
                  background-color: #ffff;
                  transition: transform 0.1s ease;
                "
              >
                Версии
              </div>
            </router-link>
            </div>
          </div>
          <div
            v-for="point in points"
            :key="point.id"
            class="bg-slate-300"
            style="padding: 1vw; padding-bottom: 0"
          >
            <div class="border-b border-slate-500">
              <div class="bg-slate-300 border-slate-400" style="padding-bottom: 3vw">
                <div>
                  <div class="inline-flex active:scale-95" style="transition: transform 0.1s ease">
                    <input
                      v-model="point.title"
                      placeholder="Введите название точки"
                      class="rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      style="
                        font-size: 1.2vw;
                        padding-bottom: 0.3vw;
                        padding-top: 0.3vw;
                        padding-left: 0.5vw;
                        padding-right: 0.5vw;
                        width: 33vw;
                        margin-right: 1vw;
                      "
                    /><button
                      class="bg-red-500 text-white rounded-md"
                      style="
                        padding-right: 0.8vw;
                        padding-left: 0.8vw;
                        padding-top: 0.4vw;
                        padding-bottom: 0.4vw;
                      "
                      @click="DeletePoint(point.id)"
                    >
                      <img src="/trash.png" class="cursor-pointer" style="height: 1vw" />
                    </button>
                  </div>
                  <div
                    class="inline-flex"
                    style="padding-left: 0.3vw; padding-top: 0.5vw; padding-right: 0.3vw"
                  >
                    <div style="font-size: 1vw; margin-right: 1vw">Номер</div>
                    <input
                      type="number"
                      v-model="point.position"
                      v-on:change="RePosition(point.id)"
                      style="width: 3vw; margin-right: 1vw"
                      class="rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                  <div class="inline-flex items-center" style="padding-left: 0.3vw">
                    <div style="margin-right: 1vw; font-size: 1vw">Координаты точки</div>
                    <input
                      v-model="point.lat"
                      v-on:change="ReRoute"
                      class="rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      style="
                        margin-right: 0.5vw;
                        width: 10vw;
                        font-size: 1vw;
                        padding: 0.1vw;
                        padding-left: 0.2vw;
                        padding-right: 0.2vw;
                      "
                    />
                    <input
                      v-model="point.lon"
                      v-on:change="ReRoute"
                      class="rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      style="
                        margin-right: 0.5vw;
                        width: 10vw;
                        font-size: 1vw;
                        padding: 0.1vw;
                        padding-left: 0.2vw;
                        padding-right: 0.2vw;
                      "
                    />
                  </div>
                </div>
                <div>
                  <textarea
                    class="resize-none rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent w-full"
                    v-model="point.text"
                    placeholder="Введите описание точки"
                    style="
                      margin-top: 1vw;
                      margin-right: 1vw;
                      height: 9vw;
                      font-size: 1vw;
                      padding-bottom: 0.3vw;
                      padding-top: 0.3vw;
                      padding-left: 0.5vw;
                      padding-right: 0.5vw;
                      margin-bottom: 0.5vw;
                    "
                  ></textarea>
                </div>
                <div>
                  <div style="width: 12vw; margin-bottom: 1vw">
                    <label class="overflow-hidden rounded-sm" style="margin-top: 1vw; height: 11vw">
                      <input
                        type="file"
                        accept="image/*"
                        style="display: none; width: 10vw"
                        @change="AddPointImage($event, point.id)"
                      />
                      <div
                        class="bg-indigo-500 text-white rounded-md active:scale-95"
                        style="
                          width: 12vw;
                          padding-top: 0.3vw;
                          padding-bottom: 0.3vw;
                          text-align: center;
                          font-size: 1.1vw;
                          transition: transform 0.1s ease;
                        "
                      >
                        Добавить фото
                      </div>
                    </label>
                  </div>
                  <div class="text-center">
                    <div
                      class="inline-grid grid-cols-2 gap-4 active:scale-95"
                      style="transition: transform 0.1s ease"
                    >
                      <div
                        v-for="image in point.images"
                        :key="image.fileUrl"
                        class="image-container"
                      >
                        <img :src="image.fileUrl" class="image-item" />

                        <button
                          class="delete-button"
                          @click="DeletePointImage(point.id, image.fileUrl)"
                        >
                          <img src="/trash.png" class="delete-icon" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-center">
            <button
              @click="AddPoint"
              class="bg-indigo-500 rounded-md text-white active:scale-95"
              style="
                font-size: 2vw;
                padding: 1vw 2vw;
                margin: 2vw 2vw;
                transition: transform 0.1s ease;
              "
            >
              {{ buttonText }}
            </button>
          </div>
        </div>
        <div class="w-full h-screen col-span-3 z-0">
          <div ref="mapContainer" style="width: 100%; height: 100%"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.image-container {
  position: relative; /* Контейнер для позиционирования */
}
.image-item {
  width: 18vw;
  height: 14vw;
}
.delete-button {
  position: absolute; /* Остаётся как есть */
  bottom: 0; /* Меняем значение на 0, чтобы прижать к низу */
  right: 0; /* Добавляем свойство, чтобы прижать к правому краю */
  transform: translateX(0); /* Убираем или изменяем, чтобы не смещать по горизонтали */
  background-color: rgba(255, 0, 0, 0.7);
  color: white;
  border-radius: 0.2em;
  padding: 0.3em 0.3em;
  margin: 0.5vw;
  border: none;
  cursor: pointer;
}
.delete-icon {
  height: 1vw;
  vertical-align: middle; /* выровнять иконку с текстом, если есть */
}
</style>
