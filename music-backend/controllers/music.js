const axios = require('axios');
const Music = module.exports;


normalize = function(response) {
    return response.results.bindings.map(obj =>
        Object.entries(obj)
            .reduce((new_obj, [k,v]) => (new_obj[k] = v.value, new_obj),
                    new Object()));
};

async function execQuery(q) {
    try {
        var encoded = encodeURIComponent(q);
        response = await axios.get("http://localhost:7200/repositories/music-db" + '?query=' + encoded);
        return normalize(response.data);
    } catch (err) {
        return ('ERRO: ' + err);
    }
}

Music.getArtist = async function(idArtist) {
    const query = 
        `PREFIX : <http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        SELECT ?discogs_id ?name ?realname ?type WHERE {     
            :${idArtist} :name ?name ;
                         :realname ?realname ;
                         :discogs_id ?discogs_id ;
                         rdf:type ?rdf_type .
            
            BIND(STRAFTER(STR(?rdf_type), 'music-ontology#') AS ?type) .
        }`
    ;

    var res = await execQuery(query);
    return res;
}

Music.getMembersOfGroup = async function(idGroup) {
    const query = 
        `PREFIX : <http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#>
        SELECT ?id ?name WHERE {     
            :${idGroup} :hasMember ?idMember .
    
    		?idMember :name ?name .
    		
    		BIND(STRAFTER(STR(?idMember), 'music-ontology#') AS ?id) .
        }`
    ;

    var res = await execQuery(query);
    return res;
}

Music.getArtists = async function() {
    const query = 
        `PREFIX : <http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#>
        SELECT ?id ?name WHERE { 
            ?idArtist a :Artist .
            ?idArtist :name ?name .

            BIND(STRAFTER(STR(?idArtist), 'music-ontology#') AS ?id) .
        }`
    ;

    var res = await execQuery(query);
    return res;
}

Music.getArtistsWithAlbums = async function() {
    const query = 
        `PREFIX : <http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#>
        SELECT ?id_artist ?id_album ?id_genre ?title ?name ?year ?country ?genre WHERE { 
            ?idArtist a :Artist .
            ?idArtist :hasAlbum ?idAlbum ;
                      :name ?name .
            
            ?idAlbum :hasGenre ?idGenre ;
                     :title ?title ;
                     :country ?country ;
                     :year ?year .
                    
            ?idGenre :name ?genre .
            
            BIND(STRAFTER(STR(?idArtist), 'music-ontology#') AS ?id_artist) .
            BIND(STRAFTER(STR(?idAlbum), 'music-ontology#') AS ?id_album) .
            BIND(STRAFTER(STR(?idGenre), 'music-ontology#') AS ?id_genre) .
        }` 
	;

	var res = await execQuery(query);
	return res;
}

Music.getSongs = async function() {
    const query = 
        `PREFIX : <http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#>
        SELECT ?id ?title ?duration WHERE { 
            ?idSong a :Song .
            ?idSong :title ?title .
            ?idSong :duration ?duration .

            BIND(STRAFTER(STR(?idSong), 'music-ontology#') AS ?id) .
        }`
    ;

    var res = await execQuery(query);
    return res;
}

Music.getSongsByAlbum = async function(idAlbum) {
    const query = 
        `PREFIX : <http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#>
        SELECT ?id ?title ?duration WHERE { 
            :${idAlbum} :hasSong ?idSong .
            ?idSong :title ?title .
            ?idSong :duration ?duration .
            
            BIND(STRAFTER(STR(?idSong), 'music-ontology#') AS ?id) .
        }`
    ;

    var res = await execQuery(query);
    return res;
}

Music.getAlbums = async function() {
    const query = 
        `PREFIX : <http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#>
        SELECT ?id ?title ?genre ?country ?year WHERE { 
            ?idAlbum a :Album .
            ?idAlbum :title ?title ; 
            		 :hasGenre ?idGenre ;
    				 :country ?country ;
         			 :year ?year .
   			?idGenre :name ?genre .

            BIND(STRAFTER(STR(?idAlbum), 'music-ontology#') AS ?id) .
        }`
    ;

    var res = await execQuery(query);
    return res;
}

Music.getAlbumsByArtist = async function(idArtist) {
    const query =
        `PREFIX : <http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#>
        SELECT ?id ?discogs_id ?artist ?title ?country ?year WHERE { 
            :${idArtist} :hasAlbum ?idAlbum ;
                         :name ?artist ;
                         :discogs_id ?discogs_id .
            
            ?idAlbum :title ?title ; 
                     :country ?country ;
                     :year ?year .
                    
            BIND(STRAFTER(STR(?idAlbum), 'music-ontology#') AS ?id) .
        }`
    ;

    var res = await execQuery(query);
    return res;
}

Music.getGenres = async function() {
    const query = 
        `PREFIX : <http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#>
        SELECT ?id ?name WHERE { 
            ?idGenre a :Genre .
            ?idGenre :name ?name .

            BIND(STRAFTER(STR(?idGenre), 'music-ontology#') AS ?id) .
        }`
    ;
    
    var res = await execQuery(query);
    return res;
}

Music.getAlbumsByGenre = async function(idGenre) {
    const query = 
        `PREFIX : <http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#>
        SELECT ?id_album ?title ?country ?year ?id_artist ?name WHERE { 
            :${idGenre} :classifiesAlbum ?idAlbum .

            ?idAlbum :title ?title ;
                     :country ?country ;
                     :year ?year .
            
            ?idArtist :hasAlbum ?idAlbum ;
                      :name ?name .

            BIND(STRAFTER(STR(?idAlbum), 'music-ontology#') AS ?id_album) .
            BIND(STRAFTER(STR(?idArtist), 'music-ontology#') AS ?id_artist) .
        }`
    ;
    
    var res = await execQuery(query);
    return res;
}

Music.getStyles = async function() {
    const query = 
        `PREFIX : <http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#>
        SELECT ?id ?name WHERE { 
            ?idStyle a :Style .
            ?idStyle :name ?name .

            BIND(STRAFTER(STR(?idStyle), 'music-ontology#') AS ?id) .
        }`
    ;
    
    var res = await execQuery(query);
    return res;
}

Music.getAlbumsByStyle = async function(idStyle) {
    const query = 
        `PREFIX : <http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#>
        SELECT ?id_album ?title ?country ?year ?id_artist ?name WHERE {
            :${idStyle} :includesAlbum ?idAlbum .
            
            ?idAlbum :title ?title ;
                     :country ?country ;
                     :year ?year .
            
            ?idArtist :hasAlbum ?idAlbum ;
                      :name ?name .
            
            BIND(STRAFTER(STR(?idAlbum), 'music-ontology#') AS ?id_album) .
            BIND(STRAFTER(STR(?idArtist), 'music-ontology#') AS ?id_artist) .
        }`
    ;
    
    var res = await execQuery(query);
    return res;
}

Music.getAlbumsByStyleWithGenre = async function(idStyle, idGenre) {
    const query =
        `PREFIX : <http://www.semanticweb.org/mgcsousa/prc2019/ontologies/music-ontology#>
        SELECT ?id_album ?title ?country ?year ?id_artist ?name WHERE {
            :${idStyle} :includesAlbum ?idAlbum .
            
            ?idAlbum :hasGenre :${idGenre} ;
        			 :title ?title ;
                     :country ?country ;
                     :year ?year .
            
            ?idArtist :hasAlbum ?idAlbum ;
                      :name ?name .
            
            BIND(STRAFTER(STR(?idAlbum), 'music-ontology#') AS ?id_album) .
            BIND(STRAFTER(STR(?idArtist), 'music-ontology#') AS ?id_artist) .
        }`
    ;

    var res = await execQuery(query);
    return res;
}