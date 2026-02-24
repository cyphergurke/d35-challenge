import { createApp } from 'vue'
import App from './App.vue'
import './styles/index.css'
import './widgets/filter'

const appRoot = document.querySelector('#app')

if (appRoot) {
  createApp(App).mount(appRoot)
}
