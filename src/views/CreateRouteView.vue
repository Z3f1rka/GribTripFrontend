<script setup>
import { ref, onMounted, watch } from 'vue'
import Header from '@/components/Header/Header.vue'
import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
import '/leaflet-routing-machine-3.2.12/dist/leaflet-routing-machine.js'
import '/lrm-graphhopper-1.2.0.js'
import { auth_get, auth_post } from '@/request'

const routeId = 1
const mapContainer = ref()
const map = ref()
const userLat = ref(0)
const userLon = ref(0)
const api_key = import.meta.env.VITE_GRAPHHOPPER_API_KEY
const full_loading = ref(false)
const title = ref('')
const text = ref('')
const control = ref()
var points = ref([])
var count = 0
const mainImage = ref(null)
const imageUrl = ref('/upload-photo.png')
const loading = ref(false)
const buttonText = ref('Добавить точку')
const success = ref(false)
const mainData = ref()


onMounted(() => {
  fetchData()
  watch(
  () => mainData.value,
  () => {
    success.value = true
    title.value = mainData.value[0].title
    text.value = mainData.value[0].description
    mainData.value[0].content_blocks.forEach((item) =>{
      let images = []
      item.images.forEach((image) =>{
        images.push({file: null, fileUrl: import.meta.env.VITE_FILES_API_URL + 'files/download/' + image})
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
      console.log(userLat.value, userLon.value)
      // Копируй
      map.value = L.map(mapContainer.value).setView([userLat.value, userLon.value], 13)
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
      // До сюда
      control.value.setWaypoints(points.value.map((p) => L.latLng(p.lat, p.lon)))
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
  },
)
})

var is_add = ref(false)

async function fetchData() {
  try {
    let data = await auth_get(`routes/get_by_main_route_id_private?route_id=${routeId}`)
    mainData.value = data
    if (data == undefined) {
      throw undefined
    }
    console.log(data)
  } catch (err) {
    console.error(err)
  }
}


async function Save() {
  let content_blocks = []
  for (let i = 0; i <= points.value.length - 1; i++) {
    let p = points.value[i]
    let formData = new FormData()
    let data = []
    if (p.images.length > 0) {
      p.images.forEach((image) => {
        if (image.file != null){
        formData.append('files', image.file)
        }
        else{
          data.push(image.fileUrl.slice((import.meta.env.VITE_FILES_API_URL + 'files/download/').length))
        }
      })
      if (formData.has('files')) {
      data.push(...await auth_post(
        'files/upload_list_files',
        formData,
        import.meta.env.VITE_FILES_API_URL,
        'multipart/form-data',
      ))
      }
      console.log(data)
    }
    content_blocks.push({
      text: p.text,
      title: p.title,
      position: p.position,
      geoposition: [p.lat, p.lon],
      images: data,
    })
  }
  let data = {
    title: title.value,
    description: text.value,
    content_blocks: content_blocks,
    main_route_id: routeId,
  }
  console.log(data)
  auth_post('routes/update', data)
}

function Public() {
  return '123'
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
</script>

<template>
  <div class="grid grid-cols-5" v-if="success">
    <div class="col-span-2 h-screen overflow-auto">
      <div class="border-2 bg-slate-100 p-5 overflow-hidden">
        <input placeholder="Введите название" class="h-10 w-full text-2xl" v-model="title" />
        <div class="grid grid-cols-5 mt-5 h-200">
          <textarea
            class="col-span-3 mr-5 h-full resize-none"
            placeholder="Описание маршрута"
            v-model="text"
          ></textarea>
          <label class="col-span-2 h-full w-full overflow-hidden">
            <input
              type="file"
              accept="image/*"
              @change="AddImage"
              style="display: none"
              class="h-full w-full"
            />
            <img :src="imageUrl" v-if="loading" class="object-cover h-full w-full" style="" />
          </label>
        </div>
        <div class="mt-5">
          <button class="text-lg bg-red-400 p-2 w-1/5 rounded-lg" @click="Save">Сохранить</button>
          <button class="text-lg bg-green-400 p-2 w-1/5 rounded-lg ml-5">Отправить</button>
        </div>
      </div>
      <div v-for="point in points" :key="point.id" class="border-2">
        <div>
          <div>
            <input type="number" v-model="point.position" v-on:change="RePosition(point.id)" />
            <input v-model="point.title" />
          </div>
          <div>
            <input v-model="point.lat" v-on:change="ReRoute" />
            <input v-model="point.lon" v-on:change="ReRoute" />
            <button class="bg-red-500" @click="DeletePoint(point.id)">Удалить</button>
          </div>
        </div>
        <div>
          <textarea v-model="point.text"></textarea>
          <input type="file" accept="image/*" @change="AddPointImage($event, point.id)" />
          <div class="h-1/5 overflow-auto">
            <div v-for="image in point.images" :key="image.fileUrl">
              <img :src="image.fileUrl" />
              <button class="bg-green-500" @click="DeletePointImage(point.id, image.fileUrl)">
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-center mt-10">
        <button @click="AddPoint" class="bg-blue-500 p-5 w-1/2 text-2xl rounded-md">
          {{ buttonText }}
        </button>
      </div>
    </div>
    <div class="w-full h-screen col-span-3">
      <div ref="mapContainer" style="width: 100%; height: 100%"></div>
    </div>
  </div>
</template>
