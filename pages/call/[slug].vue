<script setup lang="ts">
    const route = useRoute()
    
    const { data: JWT } = await useFetch(`/api/token?slug=${route.params.slug}`);
</script>

<template>
    <div>
        <ClientOnly>
            <Videocall :slug="route.params.slug" :JWT="JWT" />
        </ClientOnly>
    </div>
</template>