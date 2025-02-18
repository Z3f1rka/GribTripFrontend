<script setup>
import { ref } from 'vue'

let data = defineProps({
  card: Object,
})
const isHovered = ref(false)

const handleMouseOver = () => {
  isHovered.value = true
}

const handleMouseLeave = () => {
  isHovered.value = false
}
</script>
<template>
  <div
    style="width: 45vw; height: 25vw; margin-left: 2vw; margin-right: 2vw; margin-top: 5vw"
    class="relative justify-center border-1 cursor-pointer overflow-hidden"
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
  >
    <img :src="data.card.img" class="w-full h-full object-cover absolute" />
    <div
      class="absolute bottom-0 w-full content-center inline-flex desc"
      :class="{ 'desc-hovered': isHovered }"
    >
      <h1
        v-if="!isHovered"
        style="font-size: 2vw; margin-left: 1vw; margin-right: 2vw; transition: opacity 2s ease"
        class="content-center truncate"
      >
        {{ data.card.title }}
      </h1>
      <h1
        v-if="isHovered"
        style="font-size: 2vw; margin-left: 1vw; margin-right: 2vw; transition: opacity 2s ease"
        class="content-center text-ellipsis"
      >
        {{ data.card.description }}
      </h1>
      <img src="/arrow1.svg" style="width: 1.6vw; margin-right: 2vw" />
    </div>
  </div>
</template>
<style scoped>
.desc {
  transition: all 0.9s ease;
  height: 6vw;
  background-color: rgba(15, 15, 15, 0.6);
  padding: 1vw;
  color: #fffaf4;
}

.desc-hovered {
  height: 100%;
  z-index: 1;
  background-color: #fffaf4;
  align-items: baseline;
  color: black;
}
.to-bottom {
  background-position: 50% 0%;
}
.center-right-left,
.to-left,
.to-right {
  background-size: 0% 100%;
}
.center-top-bottom,
.to-top,
.to-bottom {
  background-size: 100% 0%;
}
.to-top {
  background-position: 50% 100%;
}

@keyframes pulseForward {
  0% {
    height: 10vw;
  }
  100% {
    height: 30vw;
    background-color: white;
  }
}

@keyframes pulseBackward {
  0% {
    height: 30vw;
    background-color: white;
  }
  100% {
    height: 6vw;
    background-color: rgba(15, 15, 15, 0.6);
  }
}
</style>
