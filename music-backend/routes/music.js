var express = require('express');
var Music = require('../controllers/music');
var router = express.Router();

/* Devolve informação sobre um artista em específico. */
router.get('/artist/:idArtist', async function(req, res, next) {
    await Music.getArtist(req.params.idArtist)
        .then(data => res.jsonp(data))
        .catch(err => console.log('Error: ' + err));
});

/* Devolve o nome de todos os membros de um grupo. */
router.get('/members/:idGroup', async function(req, res, next) {
    await Music.getMembersOfGroup(req.params.idGroup)
        .then(data => res.jsonp(data))
        .catch(err => console.log('Error: ' + err));
});

/* Devolve todos os artistas. */
router.get('/artists', async function(req, res, next) {
    if (req.query.f == 'table') {
        await Music.getArtistsWithAlbums()
            .then(data => res.jsonp(data))
            .catch(err => console.log('Error: ' + err));
	} else {
        await Music.getArtists()
            .then(data => res.jsonp(data))
            .catch(err => console.log('Error: ' + err));
	}
});

/* Devolve todas as músicas. */
router.get('/songs', async function(req, res, next) {
    await Music.getSongs()
        .then(data => res.jsonp(data))
        .catch(err => console.log('Error: ' + err));
});

/* Devolve todas as músicas pertencentes a um determinado álbum. */
router.get('/songs/:idAlbum', async function(req, res, next) {
    await Music.getSongsByAlbum(req.params.idAlbum)
        .then(data => res.jsonp(data))
        .catch(err => console.log('Error: ' + err));
});

/* Devolve todos os álbuns. */
router.get('/albums', async function(req, res, next) {
	await Music.getAlbums()
		.then(data => res.jsonp(data))
		.catch(err => console.log('Error: ' + err));
});

/* Devolve todos os álbuns pertencentes a um determinado artista. */
router.get('/albums/:idArtist', async function(req, res, next) {
    await Music.getAlbumsByArtist(req.params.idArtist)
        .then(data => res.jsonp(data))
        .catch(err => console.log('Error: ' + err));
});

/* Devolve todos os géneros. */
/* Devolve todos os álbuns pertencentes a um determinado género. */
router.get('/genres', async function(req, res, next) {
    if (!req.query.g) {
        await Music.getGenres()
            .then(data => res.jsonp(data))
            .catch(err => console.log('Error: ' + err));
    } else {
        await Music.getAlbumsByGenre(req.query.g)
            .then(data => res.jsonp(data))
            .catch(err => console.log('Error: ' + err));
    }
});

/* Devolve todos os estilos. */
/* Devolve todos os álbuns pertencentes a um determinado estilo. */
router.get('/styles', async function(req, res, next) {
    if (!req.query.s) {
        await Music.getStyles()
            .then(data => res.jsonp(data))
            .catch(err => console.log('Error: ' + err));
    } else {
        await Music.getAlbumsByStyle(req.query.s)
            .then(data => res.jsonp(data))
            .catch(err => console.log('Error: ' + err));
    }
});

/* Devolve todos os álbuns pertencentes a um determinado estilo com um determinado género. */
router.get('/filters', async function(req, res, next) {
    if (req.query.s && req.query.g) {
        await Music.getAlbumsByStyleWithGenre(req.query.s, req.query.g)
            .then(data => res.jsonp(data))
            .catch(err => console.log('Error: ' + err)); 
    }
});


module.exports = router;
