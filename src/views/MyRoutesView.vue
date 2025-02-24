<script setup>
import Header from '@/components/Header/Header.vue'
import { ref, watch, onMounted, reactive } from 'vue'
import { auth_get } from '@/request'
import Card from '@/components/Main/Card.vue'
import { useRouter, useRoute } from 'vue-router'

const id = useRoute()['query']['id']

let selfcards = reactive({
  search: '',
  array: [],
})
function mySort(searchKey) {
  let matchedKeys = [],
    notMatchedKeys = []
  for (let i = 0; i < selfcards.array.length; i++) {
    if (selfcards.array[i]['title'].toLowerCase().includes(searchKey.toLowerCase())) {
      matchedKeys.push(selfcards.array[i])
    } else {
      notMatchedKeys.push(selfcards.array[i])
    }
  }
  return matchedKeys.concat(notMatchedKeys)
}
watch(
  () => selfcards.search,
  () => {
    selfcards.array = mySort(selfcards.search)
  },
)

const loading = ref(false)

const fetchData = async () => {
  loading.value = false

  try {
    selfcards.array = await auth_get(`routes/all_user_routes?user_id=${id}`)
    if (selfcards.array == undefined) {
      throw undefined
    }
  } catch (err) {
    console.error('Ошибка при запросе к первичному эндпоинту:', err)
    try {
      selfcards.array = await auth_get(`routes/all_user_public_routes?user_id=${id}`)
      if (selfcards.array == undefined) {
        throw undefined
      }
    } catch (err1) {
      console.error('Ошибка при запросе к вторичному эндпоинту:', err1)
    }
  } finally {
    loading.value = true
  }
}

onMounted(() => {
  fetchData()
})
</script>
<template>
  <div class="min-h-screen flex flex-col">
    <Header class="nav" :scroll="false" />
    <div v-if="selfcards.array" class="text-center" style="font-size: 1.4vw; margin-top: 8vw">
      <div class="relative" style="width: 50vw">
        <input
          placeholder="Поиск"
          v-model="selfcards.search"
          style="font-size: 2.5vw; padding-left: 2vw; padding-top: 1vw; padding-bottom: 1vw"
          class="w-full rounded-lg bg-zinc-100 focus:outline-none"
        />
        <div
          class="absolute inset-y-0 flex items-center pointer-events-none justify-center"
          style="right: 1.3vw"
        >
          <img
            src="/search.png"
            alt="Поиск"
            class="text-gray-400"
            style="width: 3vw; height: 3vw"
          />
        </div>
      </div>
      <div v-for="item in selfcards.array" :key="item.id">
        <Card :card="item"></Card>
      </div>
    </div>
  </div>
</template>
