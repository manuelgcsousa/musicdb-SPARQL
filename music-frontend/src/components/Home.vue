<template>
    <v-app id="inspire">
        <v-navigation-drawer
            v-model="drawer"
            :clipped="$vuetify.breakpoint.lgAndUp"
            :genres="genres"
            fixed
            app
        >
        <v-list dense>
            <template v-for="item in items">
                <v-layout
                    v-if="item.heading"
                    :key="item.heading"
                    row
                    align-center
                >
                    <v-flex xs6>
                        <v-subheader v-if="item.heading">
                            {{ item.heading }}
                        </v-subheader>
                    </v-flex>
                    <v-flex xs6 class="text-xs-center">
                        <a href="#!" class="body-2 black--text">EDIT</a>
                    </v-flex>
                </v-layout>
                <v-list-group
                    v-else-if="item.children"
                    :key="item.text"
                    no-action
                >
                    <template v-slot:activator>
                        <v-list-tile>
                            <v-list-tile-content>
                                <v-list-tile-title>
                                    {{ item.text }}
                                </v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </template>
                    <v-list-tile
                        v-for="(child, i) in item.children"
                        :key="i"
                        @click="submenuClicked({ id: child.id, name: child.name })"
                    >
                        <v-list-tile-action v-if="child.icon">
                            <v-icon>{{ child.icon }}</v-icon>
                        </v-list-tile-action>
                        <v-list-tile-content>
                            <v-list-tile-title>
                                {{ child.name }}
                            </v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-list-group>
                <v-list-tile v-else :key="item.text">
                    <v-list-tile-action>
                    <v-icon>{{ item.icon }}</v-icon>
                    </v-list-tile-action>
                    <v-list-tile-content>
                    <v-list-tile-title>
                        {{ item.text }}
                    </v-list-tile-title>
                    </v-list-tile-content>
                </v-list-tile>
            </template>
        </v-list>
        </v-navigation-drawer>

        <v-container>
            <v-card>
                <v-card-title>
                    List of Albums
                    <v-spacer></v-spacer>

                    <b>Genre:</b>
                    <template>
                        <div class="text-xs-center">
                            <v-chip
                                v-if="filter_genre == 'No genre selected'"
                                v-model="filter_chip"
                            >No genre selected</v-chip>

                            <v-chip
                                v-else
                                v-model="filter_chip"
                            >{{ filter_genre }}</v-chip>
                        </div>
                    </template>
                    <v-spacer></v-spacer>

                    <b>Style:</b>
                    <template>
                        <div class="text-xs-center">
                            <v-chip
                                v-if="filter_style == 'No style selected'"
                                v-model="filter_chip"
                            >No style selected</v-chip>

                            <v-chip
                                v-else
                                v-model="filter_chip"
                            >{{ filter_style }}</v-chip>
                        </div>
                    </template>
                    <v-spacer></v-spacer>

                    <v-text-field
                        v-model="search"
                        append-icon="search"
                        label="Search"
                        solo
                        hide-details
                    ></v-text-field>
                </v-card-title>
                <v-data-table
                    :headers="headers"
                    :items="maintable_data"
                    :search="search"
                    class="elevation-2"
                >
                    <template v-slot:items="props">
                        <tr @click="rowClicked(props.item)">
                            <td>{{ props.item.title }}</td>
                            <td class="text-xs-left">{{ props.item.name }}</td>
                            <td class="text-xs-left">{{ props.item.year }}</td>
                            <td class="text-xs-left">{{ props.item.country }}</td>
                        </tr>
                    </template>
                    <template v-slot:no-results>
                        <v-alert :value="true" color="error" icon="warning">
                            Your search for "{{ search }}" found no results.
                        </v-alert>
                    </template>
                    <template v-slot:no-data>
                        <v-alert :value="true" type="info">
                            Loading data...
                        </v-alert>
                    </template>
                </v-data-table>
                <v-card>
                    <div>
                        <v-btn 
                            color="info"
                            @click="resetFilters()"
                        >    
                            Reset Filters
                        </v-btn>
                    </div>
                </v-card>
            </v-card>
        </v-container>

        <v-toolbar
            :clipped-left="$vuetify.breakpoint.lgAndUp"
            color="blue darken-3"
            dark
            app
            fixed
        >
            <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
            <v-toolbar-title>MusicDB</v-toolbar-title>
            <v-spacer></v-spacer>
        </v-toolbar>
    </v-app>
</template>

<script>
    import axios from 'axios'
    const host = 'http://localhost:2727'

    export default {
        data: () => ({
            filter_chip: true,
            search: '',
            headers: [
                {
                    text: 'Albums',
                    align: 'left',
                    sortable: false,
                    value: 'title'
                },
                { text: 'Artist', value: 'name' },
                { text: 'Year', value: 'year' },
                { text: 'Country', value: 'country' }
            ],
            filter_style: 'No style selected',
            filter_genre: 'No genre selected',
            maintable_data: [],
            albums: [],
            dialog: false,
            drawer: null,
            genres: [],
            styles: [],
            items: [
                { 
                    icon: 'keyboard_arrow_up',
                    'icon-alt': 'keyboard_arrow_down',
                    text: 'Genre',
                    model: true,
                    children: []
                },
                { 
                    icon: 'keyboard_arrow_up',
                    'icon-alt': 'keyboard_arrow_down',
                    text: 'Style',
                    model: true,
                    children: []
                }
            ]
        }),

        mounted: async function() {
            try {
                this.getGenres();
                this.getStyles();
                this.getArtistsWithAlbums();
            } catch (err) {
                return err;
            }
        },

        methods: {
            getGenres: async function() {
                let sessionGenres = sessionStorage.getItem('genres');

                if (sessionGenres) {
                    this.genres = this.items[0].children = JSON.parse(sessionGenres);
                } else {
                    var gns = await axios.get(host + '/genres');
                    this.genres = this.items[0].children = gns.data;

                    sessionStorage.setItem('genres', JSON.stringify(this.genres));
                }
            },

            getStyles: async function() {
                let sessionStyles = sessionStorage.getItem('styles');

                if (sessionStyles) {
                    this.styles = this.items[1].children = JSON.parse(sessionStyles);
                } else {
                    var sts = await axios.get(host + '/styles');
                    this.styles = this.items[1].children = sts.data;

                    sessionStorage.setItem('styles', JSON.stringify(this.styles));
                }
            },

            getArtistsWithAlbums: async function() {
                var albs = await axios.get(host + '/artists?f=table');
                this.albums = albs.data;
                this.maintable_data = this.albums;
            },

            submenuClicked: async function(obj) {
                var res = [];

                if (obj.id[0] === 'G') {
                    if (this.filter_style == 'No style selected') {
                        // Ir buscar todos os albums consoante um determinado género.
                        res = await axios.get(host + '/genres?g=' + obj.id);
                    } else {
                        let style = this.styles.find(obj => obj.name == this.filter_style);
                        // Ir buscar todos os albums consoante um determinado género e estilo.
                        res = await axios.get(host + '/filters?s=' + style.id + '&g=' + obj.id);
                    }
                    
                    this.filter_genre = obj.name;
                } else {
                    if (this.filter_genre == 'No genre selected') {
                        // Ir buscar todos os albums consoante um determinado estilo.
                        res = await axios.get(host + '/styles?s=' + obj.id);
                    } else {
                        let genre = this.genres.find(obj => obj.name == this.filter_genre);
                        // Ir buscar todos os albums consoante um determinado estilo e género.
                        res = await axios.get(host + '/filters?s=' + obj.id + '&g=' + genre.id);
                    }

                    this.filter_style = obj.name;
                }

                this.maintable_data = res.data;
            },

            resetFilters: function() {
                this.filter_genre = 'No genre selected';
                this.filter_style = 'No style selected';
                this.maintable_data = this.albums; 
            },
 
            rowClicked: function(item) {
                this.$router.push('/artist/' + item.id_artist);
            }
        },

        props: {
            source: String
        }
    }
</script>