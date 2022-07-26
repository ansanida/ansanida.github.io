import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Container, InputGroup, FormControl, Button, Row, ModalHeader, ModalTitle } from 'react-bootstrap';
import { useState, useEffect} from 'react';
import Card from 'react-bootstrap/Card';
 
const CLIENT_ID = "4174bdd600c943c38bc1d5d2ba7004d0";
const CLIENT_SECRET=process.env.REACT_APP_CLIENT_SECRET;


function App() {
 const [searchInput, setSearchInput] = useState(""); // stores the artist the user is searching for
 const [accessToken, setAccessToken] = useState(""); // stores the access token to use for the spotify API
 const [songRecs, setSongRecs] = useState([]); // stores all the recommended songs given by the API
 
 useEffect(() => {
   // API access token
   var authParameters = {
     method: 'POST',
     headers: {
       'Content-Type': 'application/x-www-form-urlencoded'
     },
     body: 'grant_type=client_credentials&client_id='+ CLIENT_ID + '&client_secret='+ CLIENT_SECRET
   }
   fetch('https://accounts.spotify.com/api/token', authParameters)
   .then(result => result.json())
   .then(data => setAccessToken(data.access_token)) // access token to use spotify API
 }, [])
 
 // search
 async function search() { // async if program needs to wait
   console.log("search for " + searchInput);
 
   // get request using search to get the artist id
   var searchParameters = {
     method: 'GET',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer ' + accessToken
     }
   }
   // get the id of the artist to use for future API requests
   var artistID = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters)
     .then(response => response.json())
     .then(data => { 
      return data.artists.items[0].id }) // returns the artist id from the first search result

  // get the genre of the artist to use as a seed for the get recommendations feature of the API
   var artistsGenre = await fetch('https://api.spotify.com/v1/search?q=' + searchInput + '&type=artist', searchParameters)
      .then(response => response.json())
      .then(data => { 
       return data.artists.items[0].genres[0] }) // returns the first associated genre for the artist from the first search result
  
  /* note^: how can i store the id and the genre in the same spotify API call? */
 
  // checking if i got the correct artist id and genre
   console.log("artist id is " + artistID);
   console.log(artistsGenre);
 
   // get top tracks of the artist to use as a seed for the get recommendations feature
   var topTrack = await fetch('https://api.spotify.com/v1/artists/' + artistID + '/top-tracks' + '?&market=US&limit=50', searchParameters)
     .then(response => response.json())
     .then(data => {
       return data.tracks[0].id // only first track
     })
    
  // request recommendations from songs using the different seeds: artist, top genre, and top track
  var returnSongRecs = await fetch('https://api.spotify.com/v1/recommendations?limit=12&seed_artists=' + artistID + '&seed_genres=' + artistsGenre + '&seed_tracks=' + topTrack + '&market=US', searchParameters)
   // display those albums to the user
   .then(response => response.json())
   .then(data => {
      setSongRecs(data.tracks); // 12 recommended songs stored in songRecs
   })
 }

 return (
   <div className="App">
    <ModalHeader
      style={{
        padding: 24,
        backgroundColor: 'transparent',
      }}
    >
      <ModalTitle style={{ color: 'yellow' }}>song recommendations based on an artist</ModalTitle>
    </ModalHeader>
     <Container>
       <InputGroup className="mb-3" size="lg">
         <FormControl
           placeholder="enter an artist"
           type="input"
           onKeyPress={event => {
             if (event.key == "Enter") {
               search();
             }
           }}
           onChange={event => setSearchInput(event.target.value)}
         />
         <Button onClick={search}>
           search
         </Button>
       </InputGroup>
     </Container>
     <Container>
       <Row className="mx-2 row row-cols-4">
         {songRecs.map( (song, i) => {
           console.log(song);
           return (
             <Card>
               <Card.Img src = {song.album.images[0].url} />
               <Card.Body>
                 <Card.Title>
                   {song.name}
                 </Card.Title>
                 <Card.Text>
                  {song.artists[0].name}
                 </Card.Text>
                  <audio controls="controls" src={song.preview_url}>
                  </audio>
               </Card.Body>
             </Card>
           )
         })}
       </Row>
     </Container>
   </div>
 );
}
 
export default App;