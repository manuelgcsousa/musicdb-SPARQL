#/usr/bin/env python3

import xml.etree.ElementTree as ET
import re
import time

'''
    => Conversão de XML em TTL.

    Parser que contrói um dicionário com uma estrutura previamente definida, e posteriormente
    cria o ficheiro TTL que suportará os indivíduos da ontologia.

    - Estrutura exemplo do dicionário:
    {
        'Artist1': {
            'discogs_id': '...',
            'members': {
                'id12345': '...' 
            },
            'realname': '...',
            'albums': {
                'Album1': {
                    'image_file': '...',
                    'songs': {
                        'Song1': {
                            'duration': '...',
                            'position': '...'
                        },
                        'Song2': { ... }
                    },
                    genres: [...],
                    styles: [...],
                    year: '...',
                    country: '...'
                },

                'Album2': { ... }
            }
        },

        'Artist2': { ... }
    }
'''

# Variáveis globais.
artists_dict = {}


###### Funções Auxiliares ######

def clean_name(name, flag):
    clean = re.sub(r"[^A-Za-z0-9]+", r"", name)

    if (flag != 0):
        clean = clean.lower()

    return clean

def process_classification(data, cl, storage):
    str_data = ''
    l = len(data)
    
    if (l != 0):
        for i in range(0, l - 1):
            _id = (':' + cl + '_' + clean_name(data[i], 1))
            storage.add( (_id, data[i]) )
            str_data += (_id + ', ')

        _id = (':' + cl + '_' + clean_name(data[l - 1], 1))
        storage.add( (_id, data[l - 1]) )
        str_data += (_id + ' ;')
    else:
        str_data = (':' + cl + '_NULL ;')

    return str_data

def process_info_artist(info):
    str_ids = ''
    l = len(info)

    for i in range(0, l - 1):
        str_ids += (info[i] + ', ')

    str_ids += (info[l - 1] + ' ;')

    return str_ids


def parse_artists():
    # Parse XML file && Get root.
    tree = ET.parse('data/artists-big_discogs.xml')
    root = tree.getroot()
    
    for artist in root.iter('artist'):
        name = artist.find('name').text
        discogs_id = artist.find('id').text
        
        artists_dict[name] = {}
        artists_dict[name]['discogs_id'] = discogs_id
        artists_dict[name]['members'] = {}

        for member in artist.iter('members'):
            names = member.findall('name')

            for i in range(0, len(names)):
                _id = names[i].get('id')
                artists_dict[name]['members'][_id] = names[i].text

        real = '-'
        if (artist.find('realname') != None):
            real = artist.find('realname').text
            
        artists_dict[name]['realname'] = real

def parse_releases():
    # Parse XML file && Get root.
    tree = ET.parse('data/releases-big_discogs.xml')
    root = tree.getroot()
    
    for release in root.iter('release'):
        flag = False
        nome = ''

        for artists in release.iter('artists'):
            for artist in artists.iter('artist'):
                if (flag == False):
                    flag = True
                    nome = artist.find('name').text
        
        if nome in artists_dict:
            # Obtém valores dos campos.
            album = release.find('title').text
            
            if (not 'albums' in artists_dict[nome]):
                artists_dict[nome]['albums'] = {}

            # Atribui valores ao dicionário.
            artists_dict[nome]['albums'][album] = {}
            artists_dict[nome]['albums'][album]['image_file'] = '' 
            artists_dict[nome]['albums'][album]['songs'] = {}
            
            # Obtém géneros de um álbum.
            genres = []
            for genre in release.iter('genres'):
                gs = genre.findall('genre')

                for i in range(0, len(gs)):
                    genres.append(gs[i].text)
            
            artists_dict[nome]['albums'][album]['genres'] = genres

            # Obtém lista de estilos de um álbum.
            styles = []
            for style in release.iter('styles'):
                sts = style.findall('style')

                for i in range(0, len(sts)):
                    styles.append(sts[i].text)

            artists_dict[nome]['albums'][album]['styles'] = styles
            
            # Atribuir ano ao álbum.
            year = -1
            
            date = release.find('released')
            if (date != None):
                year = date.text.split('-')[0]
                if (year == '?'):
                    year = -1
            
            artists_dict[nome]['albums'][album]['year'] = int(year)

            # Atribuir país ao álbum.
            country = '-'
             
            c = release.find('country')
            if (c != None):
                country = c.text
            
            artists_dict[nome]['albums'][album]['country'] = country

            # Obtém todas as músicas de um determinado álbum.
            for track in release.iter('tracklist'):
                for t in track.iter('track'):
                    song = re.sub(r"[\"|\/]", r"", t.find('title').text)
                    dur = t.find('duration').text
                    pos = t.find('position').text

                    if (dur == None):
                        dur = '-'
                    
                    if (pos == None):
                        pos = '-'

                    # Guarda informação no dicionário.
                    artists_dict[nome]['albums'][album]['songs'][song] = { 'duration': dur, 'position': pos }

def clean_dict():
    bad_keys = []

    for artist in artists_dict:
        a = artists_dict[artist]
        if (not 'albums' in a):
            bad_keys.append(artist)

    for key in bad_keys:
        artists_dict.pop(key, None)

def print_ttl():    
    print('###### ADDED BY PYTHON SCRIPT -> xml2ttl.py ######')

    id_genres   = set([])
    id_styles   = set([])
    song_count  = 1
    album_count = 1

    for artist in artists_dict:
        artist_clean = clean_name(artist, 1)

        albums = artists_dict[artist]['albums']
        id_albums  = []

        for album in albums:
            album_clean = clean_name(album, 1)
            
            songs   = albums[album]['songs']
            genres  = albums[album]['genres']
            styles  = albums[album]['styles']
            year    = albums[album]['year']
            country = albums[album]['country']
            cover   = albums[album]['image_file']
            
            id_songs = []
            for song in songs:
                title_clean = clean_name(song, 1)
                id_songs.append(':S' + str(song_count) + '_' + title_clean)
                s = songs[song]

                print('\n###  http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#Sg_' + title_clean)
                print(':S' + str(song_count) + '_' + title_clean + ' rdf:type owl:NamedIndividual,\n :Song ;\n :title \"' 
                        + re.sub(r"\\", r"", song) + '\" ;\n :duration \"' + s['duration'] + '\" ;\n :position \"' 
                        + re.sub(r"\"", r"'", s['position']) + '\" .')

                song_count += 1
            
            id_alb = (':Al' + str(album_count) + '_' + album_clean)
            id_albums.append(id_alb)
            print('\n###  http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#Al_' + album_clean)
            print(f'' + id_alb + ' rdf:type owl:NamedIndividual,\n :Album ;\n :hasGenre ' + process_classification(genres, 'G', id_genres)
                    + '\n :hasStyle ' + process_classification(styles, 'St', id_styles) + '\n :hasSong ' + process_info_artist(id_songs)
                    + '\n :title \"' + re.sub(r"[\"|\\]", r"'", album) + '\" ;\n :year ' + str(year) + ' ;\n :country \"' + country 
                    + '\" ;\n :album_cover \"' + cover + '\" .')

            album_count += 1
        
         
        members = artists_dict[artist]['members']
        if not members:
            print('\n###  http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#Art_' + artist_clean)

            # Solo Artist
            print(':Art_' + artist_clean + ' rdf:type owl:NamedIndividual,\n :Solo ;\n :hasAlbum ' + process_info_artist(id_albums)
                    + '\n :name \"' + re.sub(r"\"", r"'", artist) + '\" ;\n :discogs_id ' + str(artists_dict[artist]['discogs_id'])
                    + ' ;\n :realname \"' + re.sub(r"\"", r"'", artists_dict[artist]['realname']) + '\" .')
        else:
            id_members = []

            # Print Members
            for m in members:
                id_members.append(':M' + m)
                print('\n###  http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#M' + m)
                print(':M' + m + ' rdf:type owl:NamedIndividual,\n :Member ;\n :name \"' + re.sub(r"\"", r"'", members[m]) + '\" .')

            # Group Artist
            print('\n###  http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#Art_' + artist_clean)
            print(':Art_' + artist_clean + ' rdf:type owl:NamedIndividual,\n :Group ;\n :hasMember ' + process_info_artist(id_members) 
                    + '\n :hasAlbum ' + process_info_artist(id_albums) + '\n :name \"' + re.sub(r"\"", r"'", artist) + '\" ;\n :discogs_id ' + str(artists_dict[artist]['discogs_id'])
                    + ' ;\n :realname \"' + re.sub(r"\"", r"'", artists_dict[artist]['realname']) + '\" .')


    # Print Genres
    for g in id_genres:
        print('\n###  http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#' + g[0][1:])
        print(g[0] + ' rdf:type owl:NamedIndividual,\n :Genre ;\n :name \"' + g[1] + '\" .')
    
    print('\n###  http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#G_NULL')
    print(':G_NULL rdf:type owl:NamedIndividual,\n :Genre ;\n :name \"Not Defined\" .')

    for s in id_styles:
        print('\n###  http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#' + s[0][1:])
        print(s[0] + ' rdf:type owl:NamedIndividual,\n :Style ;\n :name \"' + s[1] + '\" .')

    print('\n###  http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#St_NULL')
    print(':St_NULL rdf:type owl:NamedIndividual,\n :Style ;\n :name \"Not Defined\" .')

def main():
    # Retira informação base dos artistas.
    parse_artists()
    # Preenche informação de cada artista com os seus albums.
    parse_releases()
    # Limpa o dicionário no caso de certos artistas não terem informação completa.
    clean_dict()
    # Imprime a informação guardada no dicionário em formato TTL.
    print_ttl()


if __name__ == '__main__':
    main()

