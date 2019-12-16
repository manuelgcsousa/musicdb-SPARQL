# MusicDB-SPARQL

MusicDB is a web application that allows the user to navigate through an ontology, which belongs to the music domain. It is possible to filter by "Genre" or "Style", retrieving all the songs based on those filters. The results are presented in a main table, where each line represents an album. When clicked, it will redirect the user to the artists page, with all his albums and respective songs.

## Installation

1. Start GraphDB: http://localhost:7200
   
   1. Create a repository named "music-db"
   
   2. Import ["ontology/music-db-short.ttl"](https://github.com/MGCSousa/MusicSPARQL-PRC2019/blob/master/ontology/music-db-short.ttl) to that same repository

2. Start Backend Server (Node.js)
   
   1. Navigate to ["music-backend"](https://github.com/MGCSousa/MusicSPARQL-PRC2019/tree/master/music-backend)
      
      ```bash
      cd music-backend
      ```
   
   2. Install all components
      
      ```bash
      npm install
      ```
   
   3. Start backend server: http://localhost:2727
      
      ```bash
      npm start
      ```

3. Start Frontend Server (Vue.js)
   
   1. Navigate to ["music-frontend"](https://github.com/MGCSousa/MusicSPARQL-PRC2019/tree/master/music-frontend)
      
      ```bash
      cd music-frontend
      ```
   
   2. Install all components
      
      ```bash
      npm install
      ```
   
   3. Start frontend server: http://localhost:8080
      
      ```bash
      npm run serve
      ```

&nbsp;

&nbsp;

*University Project - Processamento e Representação de Conhecimento, Universidade do Minho (2018-2019)*
