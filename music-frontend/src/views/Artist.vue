<template>
    <v-container>
        <Artist :idArtist="$route.params.id_artist"/>
    </v-container>
</template>

<script>
    import Artist from '@/components/Artist'

    export default {
        components: {
            Artist
        }
    }
</script>
