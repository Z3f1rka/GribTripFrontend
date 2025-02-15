<script setup>
import { ref, onMounted } from 'vue'
import L from 'leaflet'
import Routing from ''

const mapContainer = ref()
const map = ref()
const userLat = ref(0)
const userLon = ref(0)

onMounted(() => {
  map.value = L.map(mapContainer.value).setView([51.505, -0.09], 13)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map.value)

  L.Routing.control({
    waypoints: [L.latLng(54.319732, 48.4058184), L.latLng(54.3089, 48.3969)],
  }).addTo(map.value)

  if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
      userLat.value = position.coords.latitude
      userLon.value = position.coords.longitude
    })
  }
})
</script>
<template>
  <div class="w-full, h-screen">
    <div ref="mapContainer" style="width: 100%; height: 100%"></div>
  </div>
</template>
