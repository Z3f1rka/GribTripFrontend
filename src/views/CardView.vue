<script setup>
import Header from '@/components/Header/Header.vue'
import { ref, watch, onMounted, computed } from 'vue'
import { auth_get } from '@/request'
import vue3starRatings from 'vue3-star-ratings'
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
import '/leaflet-routing-machine-3.2.12/dist/leaflet-routing-machine.js'
import '/lrm-graphhopper-1.2.0.js'
import router from '../router'
import { useRoute } from 'vue-router'

const routeId = useRoute()['query']['id']
const mapContainer = ref()
let api = import.meta.env.VITE_FILES_API_URL
const api_key = import.meta.env.VITE_GRAPHHOPPER_API_KEY
const map = ref()
const control = ref()
const mainData = ref()
const title = ref('')
const text = ref('')
var points = ref([])
var count = 0
const imageUrl = ref('')
const success = ref(false)
const userLat = ref(0)
const userLon = ref(0)
const load = ref(false)

onMounted(() => {
  fetchData()
  watch(
    () => load.value,
    () => {
      success.value = true
      title.value = mainData.value[0].title
      text.value = mainData.value[0].description
      if (mainData.value[0].photo != 'string' && mainData.value[0].photo != null) {
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
        points.value.sort((a, b) => parseFloat(a.position) - parseFloat(b.position))
        control.value.setWaypoints(points.value.map((p) => L.latLng(p.lat, p.lon)))
      })
      loading.value = true
    },
  )
})

let user = ref(null)
let loading = ref(false)
let ActiveVersion = ref(0)
const rating_1 = ref(0)
const roundedRating = computed({
  get: () => Math.ceil(rating_1.value),
  set: (newValue) => {
    rating_1.value = newValue
  },
})

const fetchData = async () => {
  loading.value = false
  try {
    mainData.value = await auth_get(`routes/get_by_main_route_id_private?route_id=${routeId}`)
    if (mainData.value == undefined) {
      throw undefined
    }
  } catch (err) {
    console.error('Ошибка при запросе к первичному эндпоинту:', err)
    try {
      mainData.value = await auth_get(`routes/get_by_main_route_id_public?route_id=${routeId}`)
      if (mainData.value == undefined) {
        throw undefined
      }
    } catch (err1) {
      console.error('Ошибка при запросе к вторичному эндпоинту:', err1)
    }
  } finally {
    async function f() {
      try {
        const data = await auth_get(
          `auth/user?user_id=${mainData.value[ActiveVersion.value].user_id}`,
        )
        user.value = data
        if (data == undefined) {
          throw undefined
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
        load.value = true
      },
    )
  }
}
const pointsExpanded = ref({})
const togglePoint = (pointId) => {
  pointsExpanded.value[pointId] = !pointsExpanded.value[pointId]
}
</script>
<template>
  <div class="min-h-screen flex flex-col">
    <div class="flex-grow bg-gradient-to-b z-10 text-slate-900">
      <Header class="nav" :scroll="false" />
      <div v-if="loading" style="margin-top: max(6vw, 50px)" class="grid grid-cols-5">
        <div class="col-span-2 h-screen overflow-auto">
          <div class="overflow-hidden bg-slate-200">
            <img
              v-if="mainData[ActiveVersion] || mainData[ActiveVersion].photo"
              :src="api + 'files/download/' + mainData[ActiveVersion].photo"
              class="place-self-center"
            />
            <img
              v-if="!(mainData[ActiveVersion] || mainData[ActiveVersion].photo)"
              src="/avatar.jpg"
              class="place-self-center"
            />
            <div
              style="font-size: 1vw; color: #64748b; padding-right: 0.4vw; padding-top: 0.2vw"
              class="text-end"
            >
              {{ mainData[ActiveVersion].created_at.slice(0, 10) }}
            </div>
            <div style="padding: 1vw; padding-top: 0%" class="drop-shadow-lg">
              <div
                style="font-size: 2.5vw; padding: 1vw 0.2vw; padding-top: 0%"
                class="drop-shadow-lg"
              >
                {{ mainData[ActiveVersion].title }}
              </div>
              <div
                style="
                  font-size: 1.7vw;
                  min-height: 8vw;
                  width: 100%;
                  overflow: auto;
                  border: none;
                  outline: none;
                  border-radius: 5px;
                  white-space: pre-wrap;
                  word-wrap: break-word;
                  background-color: white;
                  padding: 0vw 0.5vw;
                "
              >
                {{ mainData[ActiveVersion].description }}
              </div>

              <div class="grid-cols-2 grid-rows-1 grid" style="margin: 1.5vw 0; margin-left: 0.2vw">
                <div class="inline-flex">
                  <a
                    v-if="user.avatar != null"
                    href="#"
                    class="select-none flex cursor-default"
                    role="menuitem"
                    tabindex="-1"
                    id="menu-item-0"
                    ><img :src="user.avatar" class="rounded-full" style="width: 4vw" />
                  </a>
                  <a
                    v-if="user.avatar == null"
                    href="#"
                    class="select-none flex cursor-default"
                    role="menuitem"
                    tabindex="-1"
                    id="menu-item-0"
                    ><img src="/avatar.jpg" class="rounded-full" style="width: 4vw" />
                  </a>
                  <div class="grid-rows-2">
                    <div style="font-size: 1.5vw; padding: 0 0 0 0.7vw">
                      {{ user.username }}
                    </div>
                    <div style="font-size: 0.9vw; padding: 0 0 0 0.7vw" class="text-indigo-700">
                      Автор
                    </div>
                  </div>
                </div>
                <div class="grid items-center justify-end">
                  <vue3starRatings
                    v-model="mainData[ActiveVersion].rating"
                    :starSize="38"
                    starColor="#ff9800"
                    inactiveColor="#333333"
                    :numberOfStars="5"
                    :disableClick="true"
                  />
                </div>
              </div>
            </div>
            <div
              v-for="point in points"
              :key="point.id"
              class="bg-slate-100"
              style="padding-bottom: 0"
            >
              <div class="border-b border-slate-500">
                <div class="bg-slate-100 border-slate-400" style="padding-bottom: 3vw">
                  <div style="padding: 1vw">
                    <div
                      class="cursor-pointer"
                      style="display: flex; justify-content: space-between; align-items: center"
                      @click="togglePoint(point.id)"
                    >
                      <div class="drop-shadow-lg">
                        <div
                          v-if="point.title != ''"
                          style="font-size: 1.8vw; margin-top: 0.5vw; padding-left: 0.3vw"
                        >
                          {{ point.title }}
                        </div>
                        <div
                          v-else
                          style="font-size: 1.8vw; margin-top: 0.5vw; padding-left: 0.3vw"
                          class="drop-shadow-lg"
                        >
                          Точка
                        </div>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        style="width: 1.5vw; height: 1.5vw; transition: transform 0.3s ease"
                        :class="{ 'rotate-180': pointsExpanded[point.id] }"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                        />
                      </svg>
                    </div>

                    <div
                      class="collapsible-content"
                      :class="{ expanded: pointsExpanded[point.id] }"
                      style="
                        overflow: hidden;
                        transition: all 0.3s ease-out;
                        transform-origin: top center;
                      "
                      :style="{
                        height: pointsExpanded[point.id] ? 'auto' : '0',
                        opacity: pointsExpanded[point.id] ? 1 : 0,
                        transform: pointsExpanded[point.id] ? 'translateY(0)' : 'translateY(-10px)',
                      }"
                    >
                      <div class="text-center" v-if="point.image != ''" style="margin-top: 2vw">
                        <Carousel :items-to-show="1.9" :wrap-around="true">
                          <Slide v-for="image in point.images" :key="image.fileUrl">
                            <div class="carousel__item">
                              <img
                                class="bg-no-repeat bg-cover h-full rounded-lg"
                                style="height: 15vw"
                                :src="image.fileUrl"
                              />
                            </div>
                          </Slide>
                          <template #addons>
                            <Navigation />
                            <Pagination />
                          </template>
                        </Carousel>
                      </div>

                      <div
                        style="
                          font-size: 1.2vw;
                          min-height: 6vw;
                          width: 100%;
                          overflow: auto;
                          border: none;
                          outline: none;
                          border-radius: 5px;
                          white-space: pre-wrap;
                          word-wrap: break-word;
                          background-color: white;
                          padding: 0vw 0.5vw;
                          margin-top: 1vw;
                          padding-left: 0.3vw;
                        "
                      >
                        {{ point.text }}
                      </div>
                      <div
                        class="inline-flex text-slate-600"
                        style="font-size: 0.9vw; padding-left: 0.3vw"
                      >
                        <div style="margin-right: 1vw">Номер {{ point.position }}</div>
                        <div style="margin-right: 1vw">{{ point.lat }}</div>
                        <div>{{ point.lon }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
.collapsible-content {
  height: 0;
  overflow: hidden;
  transition: all 0.2s ease-out; /* Smooth transition for all properties */
  opacity: 0; /* Initially hidden */
  transform: translateY(-10px); /* Start slightly above */
  transform-origin: top center; /* Animate from the top */
}

.collapsible-content.expanded {
  height: auto; /* Adjust dynamically */
  opacity: 1; /* Fade in */
  transform: translateY(0); /* Slide to final position */
}
</style>
