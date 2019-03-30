import Vue from 'vue'
import Router from 'vue-router'
import HighchartsVue from 'highcharts-vue'

import Home from '@/components/Home'
// import VueSelect from 'vue-cool-select'
 
// Vue.use(VueSelect, {
//   theme: 'bootstrap' // or 'material-design'
// })

Vue.use(Router)
Vue.use(HighchartsVue)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    }
  ]
})
