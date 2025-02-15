<script setup>
import { ref, onMounted } from 'vue'

const mapContainer = ref()
const map = ref()
const userLat = ref(0)
const userLon = ref(0)

onMounted(() => {
  const promise = new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        resolve({ lat: position.coords.latitude, lon: position.coords.longitude })
      })
    } else {
      reject({ lat: 0, lon: 0 })
    }
  })
  promise.then((result) => {
    userLat.value = result.lat
    userLon.value = result.lon
    console.log(userLat.value, userLon.value)
    map.value = L.map(mapContainer.value).setView([userLat.value, userLon.value], 13)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map.value)
    L.Routing.control({
      waypoints: [L.latLng(57.74, 11.94), L.latLng(57.6792, 11.949)],
    }).addTo(map.value)
  })
})
</script>
<template>
  <div class="grid grid-cols-5">
    <div class="col-span-2"></div>
    <div class="w-full h-screen col-span-3">
      <div ref="mapContainer" style="width: 100%; height: 100%"></div>
    </div>
  </div>
</template>
