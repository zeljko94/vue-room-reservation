<script>
import { ref, onMounted } from 'vue';
import RssService from '@/service/RssService';

export default {
    setup() {
        const rssItems = ref([]);

        onMounted(async () => {
            rssItems.value = await RssService.fetchRssFeed();
        });

        return {
            rssItems
        };
    }
};
</script>

<style scoped>
/* Add any styles you want here */
</style>


<template>
    <div>
        <h1>New York Times World News</h1>
        <ul>
            <li v-for="(item, index) in rssItems" :key="index">
                <a :href="item.link" target="_blank">{{ item.title }}</a>
                <p>{{ item.description }}</p>
            </li>
        </ul>
    </div>
</template>