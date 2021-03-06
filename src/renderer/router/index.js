import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'landing-page',
            component: require('@/components/MainPage').default
        },
        {
            path: '*',
            redirect: '/'
        },
        {
            path: '/connection',
            component: require('@/components/ConnectionDetails').default
        },
        {
            path: '/preview',
            component: require('@/components/Preview').default
        }
    ]
})
