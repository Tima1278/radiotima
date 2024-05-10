import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import PosizioneRadio from '../views/PosizioneRadio.vue'
import FavoriteRadio from '../views/FavoriteRadio.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/posizione_radio',
    name: 'PosizioneRadio',
    component: PosizioneRadio
  },
  {
    path: '/favorite',
    name: 'FavoriteRadio',
    component: FavoriteRadio
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
