import { createRouter, createWebHistory } from 'vue-router';
import AppLayout from '@/layout/AppLayout.vue';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: AppLayout,
            children: [
                {
                    path: '/',
                    redirect: '/auth/login'
                },
                {
                    path: '/dashboard',
                    name: 'dashboard',
                    component: () => import('@/views/Dashboard.vue')
                },
                {
                    path: '/dynamic',
                    name: 'dynamic',
                    component: () => import('@/views/Dynamic.vue')
                },
                {
                    path: '/administracija/korisnici',
                    name: 'korisnici',
                    component: () => import('@/views/administracija/Korisnici.vue')
                },
                {
                    path: '/administracija/sobe',
                    name: 'sobe',
                    component: () => import('@/views/administracija/Sobe.vue')
                },
                {
                    path: '/administracija/rezervacije',
                    name: 'rezervacije',
                    component: () => import('@/views/administracija/Rezervacije.vue')
                }
            ]
        },
        // {
        //     path: '/landing',
        //     name: 'landing',
        //     component: () => import('@/views/pages/Landing.vue')
        // },
        // {
        //     path: '/pages/notfound',
        //     name: 'notfound',
        //     component: () => import('@/views/pages/NotFound.vue')
        // },

        {
            path: '/auth/login',
            name: 'login',
            component: () => import('@/views/pages/auth/Login.vue')
        },
        // {
        //     path: '/auth/access',
        //     name: 'accessDenied',
        //     component: () => import('@/views/pages/auth/Access.vue')
        // },
        // {
        //     path: '/auth/error',
        //     name: 'error',
        //     component: () => import('@/views/pages/auth/Error.vue')
        // }
    ]
});

export default router;
