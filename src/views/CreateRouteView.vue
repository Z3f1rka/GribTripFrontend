<script setup>
import { ref, onMounted, watch } from 'vue'
import 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
import "/leaflet-routing-machine-3.2.12/dist/leaflet-routing-machine.js"
import "/lrm-graphhopper-1.2.0.js"

const mapContainer = ref()
const map = ref()
const userLat = ref(0)
const userLon = ref(0)
const api_key = import.meta.env.VITE_GRAPHHOPPER_API_KEY

const control = ref()
var points = ref([])
var count = 0
const mainImage = ref(null)
const imageUrl = ref(null);
const loading = ref(false)


onMounted(() => {
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
    map.value.on('click', function (e) {
      if (is_add.value == true) {
        points.value.push({
          lat: e.latlng.lat,
          lon: e.latlng.lng,
          id: count,
          text: '',
          position: points.value.length + 1,
          oldPosition: points.value.length + 1,
          title: '',
        })
        is_add.value = false
        control.value.setWaypoints(points.value.map((p) => L.latLng(p.lat, p.lon)))
        count++
        console.log(points.value)
      }
    })
  })
})

var is_add = ref(false)

function AddPoint() {
  is_add.value = true
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
  }
)

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
  }
  else {
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
  <div class="grid grid-cols-5">
    <div class="col-span-2 h-screen overflow-auto">
      <div class="border-2 bg-slate-100">
        <input>
        <input type="file" @change="AddImage">
        <textarea></textarea>
        <img :src="imageUrl" v-if="loading">
      </div>
      <div v-for="point in points" :key="point.id" class="border-2">
        <div>
          <div>
          <input type="number" v-model="point.position" v-on:change="RePosition(point.id)" />
          <input v-model="point.title">
          </div>
          <div>
          <input v-model="point.lat" v-on:change="ReRoute" />
          <input v-model="point.lon" v-on:change="ReRoute" />
          <button class="bg-red-500" @click="DeletePoint(point.id)">Удалить</button>
          </div>
        </div>
        <div>
          <textarea v-model="point.text"></textarea>
        </div>
      </div>
      <button @click="AddPoint">+ Точка</button>
    </div>
    <div class="w-full h-screen col-span-3">
      <div ref="mapContainer" style="width: 100%; height: 100%"></div>
    </div>
  </div>
</template>
