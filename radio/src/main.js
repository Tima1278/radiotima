import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Import Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// Add solid icons to Font Awesome library
library.add(fas)

// Configure Vuetify
const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)

// Register the Font Awesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

// Use Vuetify and Router
app.use(router).use(vuetify).mount('#app')
