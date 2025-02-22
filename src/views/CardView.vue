<script setup>
import Header from '@/components/Header/Header.vue'
import { ref, watch, onMounted, reactive, computed } from 'vue'
import { auth_get } from '@/request'
import Card from '@/components/Main/Card.vue'
import { useRouter, useRoute } from 'vue-router'
import vue3starRatings from 'vue3-star-ratings'
import 'vue3-carousel/dist/carousel.css'
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'

const id = useRoute()['query']['id']

let user = ref(null)
let auth = ref(false)
let CardInfo = ref()
let loading = ref(false)
let ActiveVersion = ref(0)
const rating_1 = ref(0)
const roundedRating = computed({
  get: () => Math.ceil(rating_1.value),
  set: (newValue) => {
    rating_1.value = newValue
  },
})

const fetchData = async () => {
  loading.value = false

  try {
    CardInfo.value = await auth_get(`routes/get_by_main_route_id_private?route_id=${id}`)
    console.log(CardInfo)
    if (CardInfo.value == undefined) {
      throw undefined
    }
  } catch (err) {
    console.error('Ошибка при запросе к первичному эндпоинту:', err)
    try {
      CardInfo.value = await auth_get(`routes/get_by_main_route_id_public?route_id=${id}`)
      if (CardInfo.value == undefined) {
        throw undefined
      }
    } catch (err1) {
      console.error('Ошибка при запросе к вторичному эндпоинту:', err1)
    }
  } finally {
    loading.value = true
    async function f() {
      try {
        const data = await auth_get(
          `auth/user?user_id=${CardInfo.value[ActiveVersion.value].user_id}`,
        )
        user.value = data
        if (data == undefined) {
          throw undefined
        }
      } catch (err) {
        console.log(err)
        router.push({ path: '/' })
        alert('Такого пользователя')
      }
    }
    f()
    watch(
      () => user.value,
      () => {
        auth.value = true
      },
    )
  }
}

onMounted(() => {
  fetchData()
})
</script>
<template>
  <div class="min-h-screen flex flex-col">
    <Header class="nav" :scroll="false" />    
    <div v-if="loading" style="margin-top: 8vw">
      <div>
        <img :src="CardInfo[ActiveVersion].photo" class="rounded-full" style="width: 5.2vw" />
      </div>
      <div>{{ CardInfo[ActiveVersion].title }}</div>
      <div>{{ CardInfo[ActiveVersion].description }}</div>
      <div>{{ CardInfo[ActiveVersion].created_at }}</div>
      <div>
        Автор
        <div>
          <a
            v-if="user.avatar"
            href="#"
            class="select-none flex justify-center cursor-default"
            role="menuitem"
            tabindex="-1"
            id="menu-item-0"
            ><img :src="user.avatar" class="rounded-full" style="width: 5.2vw" />
          </a>
          <a
            v-if="!user.avatar"
            href="#"
            class="select-none flex justify-center cursor-default"
            role="menuitem"
            tabindex="-1"
            id="menu-item-0"
            ><img src="/avatar.jpg" class="rounded-full" style="width: 5.2vw" />
          </a>
        </div>
        <div>{{ user.username }}</div>
      </div>
      <vue3starRatings
        v-model="roundedRating"
        :starSize="32"
        starColor="#00be73"
        inactiveColor="#034844"
        :numberOfStars="5"
        :disableClick="false"
        class="flex-wrap"
      />
    </div>
  </div>
</template>
