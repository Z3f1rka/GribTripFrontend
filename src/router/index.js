import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CreateRouteView from '../views/CreateRouteView.vue'
import Register from '../views/Register.vue'
import Login from '@/views/Login.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/create_route',
      name: 'create route',
      component: CreateRouteView,
    },
    { path: '/register', name: 'register', component: Register },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
  ],
})

export default router
