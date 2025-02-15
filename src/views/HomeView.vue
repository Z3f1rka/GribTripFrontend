<script setup>
import { computed } from 'vue'
import Header from '@/components/Header/Header.vue'

const gradientStartColor = computed(() => '#080E1A')
const gradientEndColor = computed(() => '#527480')
let user = {
  username: 'User',
  email: '111@11.ru',
  img: '/avatar.jfif',
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="relative h-screen">
      <img src="/public/backgound.png" class="w-full h-full object-cover blur-bgimage" />
      <div class="absolute top-0 left-0 w-full">
        <Header :user="user" />
      </div>
    </div>
    <div
      class="flex-grow bg-gradient-to-b"
      :style="{
        '--gradient-color-start': gradientStartColor,
        '--gradient-color-end': gradientEndColor,
        background:
          'linear-gradient(to bottom, var(--gradient-color-start), var(--gradient-color-end))',
      }"
    >
      <div class="text-white p-4">
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
        <h1>fnjdmkdsn</h1>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blur-bgimage {
  overflow: hidden;
  margin: 0;
  text-align: left;
}
.blur-bgimage:before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background: inherit;
  z-index: -1;

  filter: blur(100px);
  -moz-filter: blur(100px);
  -webkit-filter: blur(100px);
  -o-filter: blur(100px);

  transition: all 2s linear;
  -moz-transition: all 2s linear;
  -webkit-transition: all 2s linear;
  -o-transition: all 2s linear;
}
h1 {
  font-size: calc(24px + (16 + 16 * 0.7) * ((110vw - 320px) / 1280));
}
h2 {
  font-size: calc(12px + (16 + 16 * 0.7) * ((110vw - 320px) / 1280));
}
h3 {
  font-size: calc(8px + (16 + 16 * 0.7) * ((110vw - 320px) / 1280));
}
h4 {
  font-size: calc((5 + 4 * 0.7) * ((110vw - 320px) / 1280) + 2px);
  align-content: center;
}
h5 {
  font-size: calc((6 + 4 * 0.7) * ((110vw - 320px) / 1280) + 3px);
  align-content: center;
}
p {
  font-size: calc((10 + 4 * 0.7) * ((110vw - 320px) / 1280) + 5px);
  align-content: center;
}
h6 {
  font-size: calc((14 + 4 * 0.7) * ((110vw - 320px) / 1280) + 6px);
  align-content: center;
}
</style>
