<script setup>
let data = defineProps({
  username: String,
  email: String,
  img: String,
})
</script>
<template>
  <div
    class="absolute right-0 z-10 w-80 shadow-2xl origin-top-right select-none focus:outline-none"
    role="menu"
    aria-orientation="vertical"
    aria-labelledby="menu-button"
    tabindex="-1"
    style="background-color: #fffaf4"
  >
    <div class="py-1" role="none">
      <a
        href="#"
        class="px-3 pt-8 pb-2 select-none flex justify-center cursor-default"
        role="menuitem"
        tabindex="-1"
        id="menu-item-0"
        ><img :src="data.img" class="w-20 rounded-full" />
      </a>
      <a
        href="#"
        class="block px-3 pt-2 text-xl select-none cursor-default name text-center"
        role="menuitem"
        tabindex="-1"
        id="menu-item-0"
        >{{ data.username }}</a
      >
      <a
        href="#"
        class="block px-3 pb-6 text-sl text-gray-400 select-none cursor-default text-center"
        role="menuitem"
        tabindex="-1"
        id="menu-item-0"
        >{{ data.email }}</a
      >
      <hr class="DropDownHr bg-indigo-500" />
      <a
        href="#"
        class="block px-4 py-3 text-sl DropDownElement select-none"
        role="menuitem"
        tabindex="-1"
        id="menu-item-0"
        ><div class="inline-flex items-center">
          <img src="/profile-icon.png" class="w-3 h-4 mr-3" />Профиль
        </div>
      </a>
      <a
        href="#"
        class="block px-4 py-3 text-sl DropDownElement"
        role="menuitem"
        tabindex="-1"
        id="menu-item-1"
        ><div class="inline-flex items-center">
          <img src="/location.png" class="w-4 h-4 mr-3" />Маршруты
        </div></a
      >

      <form method="POST" action="#" role="none">
        <button
          type="submit"
          class="block w-full px-4 py-3 text-left text-sl exit DropDownElement"
          role="menuitem"
          tabindex="-1"
          id="menu-item-3"
        >
          <div class="inline-flex items-center">
            <img src="/exit.png" class="w-4 h-4 mr-3" />Выход
          </div>
        </button>
      </form>
    </div>
  </div>
</template>
