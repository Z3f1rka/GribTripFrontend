<script setup>
import { computed, ref, reactive, watch } from 'vue'
import Header from '@/components/Header/Header.vue'

const gradientStartColor = computed(() => '#080E1A')
const gradientEndColor = computed(() => '#527480')

const state = reactive({
  search: '',
  array: [
    {
      id: 1,
      name: 'Alice Wonderland',
      email: 'alice@example.com',
      phone: '555-123-4567',
      city: 'Wonderland',
      hobbies: ['reading', 'painting', 'gardening'],
    },
    {
      id: 2,
      name: 'Bob The Builder',
      email: 'bob@example.com',
      phone: '555-987-6543',
      city: 'Constructionville',
      hobbies: ['building', 'engineering', 'carpentry'],
    },
    {
      id: 3,
      name: 'Charlie Chaplin',
      email: 'charlie@example.com',
      phone: '555-111-2222',
      city: 'Hollywood',
      hobbies: ['acting', 'filmmaking', 'comedy'],
    },
    {
      id: 4,
      name: 'Diana Prince',
      email: 'diana@example.com',
      phone: '555-333-4444',
      city: 'Themyscira',
      hobbies: ['fighting', 'archery', 'leadership'],
    },
    {
      id: 5,
      name: 'Eve Gardener',
      email: 'eve@example.com',
      phone: '555-555-6666',
      city: 'Eden',
      hobbies: ['gardening', 'cooking', 'botany'],
    },
    {
      id: 6,
      name: 'Frankenstein Monster',
      email: 'frank@example.com',
      phone: '555-777-8888',
      city: 'Geneva',
      hobbies: ['walking', 'electricity', 'poetry'],
    },
    {
      id: 7,
      name: 'Grace Hopper',
      email: 'grace@example.com',
      phone: '555-999-0000',
      city: 'Arlington',
      hobbies: ['programming', 'mathematics', 'sailing'],
    },
    {
      id: 8,
      name: 'Harry Potter',
      email: 'harry@example.com',
      phone: '555-101-2020',
      city: 'London',
      hobbies: ['magic', 'quidditch', 'adventure'],
    },
  ],
})
function mySort(searchKey) {
  let matchedKeys = [],
    notMatchedKeys = []
  for (let i = 0; i < state.array.length; i++) {
    if (state.array[i]['name'].toLowerCase().includes(searchKey.toLowerCase())) {
      matchedKeys.push(state.array[i])
    } else {
      notMatchedKeys.push(state.array[i])
    }
  }
  return matchedKeys.concat(notMatchedKeys)
}
watch(
  () => state.search,
  () => {
    state.array = mySort(state.search)
  },
)

let user = {
  username: 'User',
  email: '111@11.ru',
  img: '/avatar.jfif',
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="relative h-screen">
      <img src="/public/background3.png" class="w-full h-full object-cover blur-bgimage" />
      <div class="absolute top-0 left-0 w-full">
        <Header :user="user" />
        <div class="m-2 mt-25 mx-3">
          <h1 class="ml-2" style="color: #fcf3e7; font-size: 2.5cm">Ваш путь начинается здесь</h1>
          <h2 class="ml-5 mt-5" style="color: #fcf3e7; font-size: 1cm">
            создавай и иследуй новые маршруты вместе с GripTrip!
          </h2>
          <div class="flex justify-center mt-40">
            <div class="relative w-1/2">
              <input
                placeholder="Поиск"
                v-model="state.search"
                style="font-size: 250%"
                class="w-full rounded-lg bg-zinc-100 py-2 pl-10 pr-4 focus:outline-none"
              />
              <div
                class="absolute inset-y-0 right-8 flex items-center pl-3 pointer-events-none justify-center"
              >
                <img src="/public/search.png" alt="Поиск" class="h-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div
      class="flex-grow bg-gradient-to-b"
      :style="{
        '--gradient-color-start': gradientStartColor,
        '--gradient-color-end': '#202C3D',
        background:
          'linear-gradient(to bottom, var(--gradient-color-start), var(--gradient-color-end))',
      }"
    >
      <div class="text-white p-4">
        <h1 v-for="item in state.array" :key="item.id">
          {{ item.name }}
        </h1>
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
  font-size: calc(36px + (16 + 16 * 0.7) * ((110vw - 320px) / 1280));
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
