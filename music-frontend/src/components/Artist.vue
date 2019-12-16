<template>
    <v-container>
        <template>     
            <v-toolbar
                :clipped-left="$vuetify.breakpoint.lgAndUp"
                color="blue darken-3"
                dark
                app
                fixed
            >
                <v-btn dark icon @click="$router.go(-1)">
                    <v-icon>chevron_left</v-icon>
                </v-btn>
                <v-toolbar-title>{{ this.name + ' (' + this.type + ')' }}</v-toolbar-title>
                <v-spacer></v-spacer>

                <v-toolbar-title>{{ this.people }}</v-toolbar-title>
            </v-toolbar>
            
            <v-layout row wrap>
                <v-flex xs7 sm8 offset-sm2>
                    <v-card>
                        <v-carousel hide-delimiters>
                            <v-carousel-item
                                v-for="(img, i) in slideshow_covers"
                                :key="i"
                                :src="img"
                            ></v-carousel-item>
                        </v-carousel>

                        <v-list>
                            <v-subheader inset>Albums</v-subheader>
                            <hr/>
                            <v-list-group
                                v-for="album in albums"
                                :key="album.title"
                                no-action
                            >
                                <template v-slot:activator>
                                    <v-list-tile>
                                        <v-list-tile-action>
                                            <v-icon>album</v-icon>
                                        </v-list-tile-action>

                                        <v-list-tile-content>
                                            <v-list-tile-title>{{ album.title }}</v-list-tile-title>
                                        </v-list-tile-content>
                                    </v-list-tile>
                                </template>

                                <br/>
                                <v-subheader>Songs</v-subheader>

                                <v-list-tile
                                    v-for="song in album.songs"
                                    :key="song.title"
                                >
                                    <v-list-tile-action>
                                        <v-icon>music_note</v-icon>
                                    </v-list-tile-action>

                                    <v-list-tile-content>
                                        <v-list-tile-title>{{ song.title }}</v-list-tile-title>
                                    </v-list-tile-content>

                                   <v-list-tile-action-text>{{ song.duration }}</v-list-tile-action-text>
                                </v-list-tile>
                                <br/>
                            </v-list-group>
                        </v-list>
                    </v-card>
                </v-flex>
            </v-layout>
        </template>
    </v-container>
</template>

<script>
    import axios from 'axios'
    import { async } from 'q';
    const host = 'http://localhost:2727'

    export default {
        data: () => ({
            drawer: null,
            name: '',
            people: '',
            type: '',
            albums: [],
            slideshow_covers: [],
        }),

        mounted: async function() {
            this.getArtistInfo();
            await this.getArtistWork();
            this.getArtistCover();
        },

        methods: {
            getArtistInfo: async function() {
                var res = await axios.get(host + '/artist/' + this.idArtist);

                let info_artist = res.data
                    .filter(info => info.type == 'Solo' || info.type == 'Group')[0];
                
                this.name = info_artist.name;
                this.type = info_artist.type;

                if (this.type == 'Group') {
                    var members = await axios.get(host + '/members/' + this.idArtist);

                    this.people += 'Members: ';
                    
                    let len = members.data.length;
                    for (let i = 0; i < len - 1; i++) {
                        this.people += (members.data[i].name + ', ');
                    }
                    this.people += members.data[len - 1].name;
                } else {
                    this.people = ('Realname: ' + info_artist.realname);
                }
            },

            getArtistWork: async function() {
                var res = await axios.get(host + '/albums/' + this.idArtist);

                this.albums = res.data;

                /* Percorrer a lista de albums e para cada um obter as músicas. */
                for (let i = 0; i < this.albums.length; i++) {
                    var songs = await axios.get(host + '/songs/' + this.albums[i].id);
                    this.albums[i]['songs'] = songs.data;
                }
            },

            getArtistCover: async function() {
                var res = await axios.get("https://api.discogs.com/artists/" + this.albums[0].discogs_id + 
                                          "?token=ZvuCnHnfcrmIvOmnsFMjyBSbCVMRJIcMHLgYSrbc");
                
                if (res.data.images) {
                    res.data.images.forEach(image => {
                        this.slideshow_covers.push(image.uri);
                    });
                } else {
                    this.slideshow_covers.push('https://i.imgur.com/hNdiQFL.png');
                }
            }, 
        },

        props: ['idArtist']
    }
</script>