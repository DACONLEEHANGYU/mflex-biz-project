import '@/assets/sass/main.scss';
import { createApp } from 'vue';
import App from './App.vue';
import i18n from './plugins/i18n';
import router from '@/router';
import { createPinia } from 'pinia';
import globalComponents from './plugins/global-components';
import dayjs from './plugins/dayjs';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(fas);
// import VueApexCharts from 'vue3-apexcharts';

const app = createApp(App);

app.component('font-awesome-icon', FontAwesomeIcon);

window.app = app
  .use(globalComponents)
  // .use(VueApexCharts)
  .use(i18n)
  .use(dayjs)
  .use(router)
  .use(createPinia())
  .mount('#app');
