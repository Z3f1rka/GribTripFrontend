<script setup>
import { ref, onMounted } from 'vue'
import Dropdown from './Dropdown.vue'

let data1 = defineProps({
  user: Object,
  cleanmode: Boolean,
})

const clean = ref(data1.cleanmode ? false : true)
const Active = ref(false)
const isOpen = ref(false)
const handleClickOutside = (event) => {
  if (!event.target.closest('.modal')) {
    isOpen.value = false
  }
}
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
</script>

<template>
  <div>
    <div class="flex">
      <header class="bg-DarkBlue inline-flex justify-between pl-8 select-none">
        <div class="py-2 inline-flex items-center">
          <img src="/icon.svg" class="w-38 h-20 cursor-pointer" />
        </div>
        <div class="inline-flex">
          <div
            class="inline-flex DropDown items-center pl-1 pr-5 cursor-pointer modal"
            @click="((isOpen = !isOpen), (Active = true))"
            v-if="clean"
          >
            <img src="/arrow.svg" class="w-4 mx-3" />
            <img src="/avatar.jfif" class="w-12 rounded-full" />
          </div>
        </div>
      </header>
    </div>
    <div class="m-2 mx-3 absolute">
      <h1 class="ml-2" style="color: #fcf3e7">Ваш путь начинается здесь</h1>
      <h2 class="ml-5 w-1/2 mt-5" style="color: #fcf3e7">
        создавай и иследуй новые маршруты вместе с GripTrip!
      </h2>
    </div>
    <Dropdown
      class="modal"
      v-if="Active"
      :class="{ EnterDropRight: isOpen, LeaveDropRight: !isOpen }"
      :username="data1.user.username"
      :email="data1.user.email"
      :img="data1.user.img"
    />
  </div>
</template>
<style scoped>
.search-box {
  width: fit-content;
  height: fit-content;
  position: relative;
}
.input-search {
  height: 50px;
  width: 50px;
  border-style: none;
  padding: 10px;
  font-size: 18px;
  letter-spacing: 2px;
  outline: none;
  border-radius: 25px;
  transition: all 0.5s ease-in-out;
  background-color: #00a176;
  padding-right: 40px;
  color: #fff;
}
.input-search::placeholder {
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
  letter-spacing: 2px;
  font-weight: 100;
}
.btn-search {
  width: 50px;
  height: 50px;
  border-style: none;
  font-size: 20px;
  font-weight: bold;
  outline: none;
  cursor: pointer;
  border-radius: 50%;
  position: absolute;
  right: 0px;
  color: #ffffff;
  background-color: transparent;
  pointer-events: painted;
}
.btn-search:focus ~ .input-search {
  width: 300px;
  border-radius: 0px;
  background-color: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 500ms cubic-bezier(0, 0.11, 0.35, 2);
}
.input-search:focus {
  width: 300px;
  border-radius: 0px;
  background-color: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  transition: all 500ms cubic-bezier(0, 0.11, 0.35, 2);
}
h1 {
  font-size: calc(68px + (16 + 16 * 0.7) * ((110vw - 320px) / 1280));
}
h2 {
  font-size: calc(24px + (16 + 16 * 0.7) * ((110vw - 320px) / 1280));
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
