<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';
import { AuthService } from '@/service/AuthService';

const authService = new AuthService();
const isAdmin = authService.isAdmin();

const model = ref([
    {
        label: 'Home',
        items: 
        [
            { label: 'Početna', icon: 'pi pi-fw pi-home', to: '/dashboard' },
            { label: 'Dinamička stranica (RSS Feeds)', icon: 'pi pi-fw pi-box', to: '/dynamic' }
        ]
    },
    isAdmin ? {
        label: 'Administracija',
        items: [
            { label: 'Korisnici', icon: 'pi pi-fw pi-users', to: '/administracija/korisnici' },
            { label: 'Sobe', icon: 'pi pi-fw pi-building', to: '/administracija/sobe' },
            { label: 'Rezervacije', icon: 'pi pi-fw pi-calendar', to: '/administracija/rezervacije' }
        ]
    } : {}
]);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
        <!-- <li>
            <a href="https://www.primefaces.org/primeblocks-vue/#/" target="_blank">
                <img src="/layout/images/banner-primeblocks.png" alt="Prime Blocks" class="w-full mt-3" />
            </a>
        </li> -->
    </ul>
</template>

<style lang="scss" scoped></style>
