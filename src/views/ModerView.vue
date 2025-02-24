<script setup>
import Header from '@/components/Header/Header.vue'
import { ref, watch, onMounted, reactive } from 'vue'
import { auth_get } from '@/request'
import Card from '@/components/Main/Card.vue'
import { useRouter } from 'vue-router'

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

/*
async function f() {
  try {
    const data = await auth_get('')
    selfcards.value = data
  } catch (error) {
    console.error('Ошибка при загрузке данных пользователя:', error)
  }
}

onMounted(async () => {
  await f()
})
  */
</script>
<template>
  <div class="min-h-screen flex flex-col">
    <Header class="nav" :scroll="false" />
  </div>
</template>
