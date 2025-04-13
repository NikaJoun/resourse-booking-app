import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

const app = createApp(App);
app.use(store);
app.use(router);
app.use(Toast, {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
});

app.mount('#app')
