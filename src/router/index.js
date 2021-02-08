import Vue from 'vue';
import VueRouter from 'vue-router';
// import Fetch from '../components/Fetch.vue';
import Todos from '../components/Todos.vue';
//  import Home from './components/home.vue';

Vue.use(VueRouter);

const routes = [
//  {
//  path: '/',
//  name: 'Home',
//  component: Home,
//  },
  {
    path: '/todos',
    name: 'todos',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: Todos,
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
