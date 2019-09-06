let accessToken;
const clientId = 'd189c1b5288b4778bab3c7d60ff2f4cb';
const redirectUri ='http://localhost:3000'; // 'http://left-purpose.surge.sh'; // 

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        }

        // check for access token match
        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

        if (accessTokenMatch && expiresInMatch) {
            accessToken = accessTokenMatch[1];
            const expiresIn = Number(expiresInMatch[1]);

            // This clears the parameters, allowing us to grab a new access token when it expires.
            window.setTimeout(() => accessToken = '', expiresIn * 1000);
            window.history.pushState('Access Token', null, '/');
            return accessToken;
        } else {
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`;

            window.location = accessUrl;

            console.log("Spotify.accessToken window.location="+window.location);
        }
    },

    /*
    Inside .search(), start the promise chain by returning a GET request (using fetch()) to the following Spotify endpoint:

    https://api.spotify.com/v1/search?type=track&q=TERM
    Replace the value of TERM with the value saved to the search term argument.

    Add an Authorization header to the request containing the access token.

    Convert the returned response to JSON.

    Then, map the converted JSON to an array of tracks. If the JSON does not contain any tracks, return an empty array.

     mapped array should contain a list of track objects with the following properties:

     — returned as track.id
        Name — returned as track.name
        Artist — returned as track.artists[0].name
        Album — returned as track.album.name
        URI — returned as track.uri
    */

    search(term) {
        // alert("spotify.search "+term);
        const accessToken = Spotify.getAccessToken();

        return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(response => response.json()).then(jsonResponse => {
            if (!jsonResponse.tracks) {
                return [];
            }
            return jsonResponse.tracks.items.map(track => {
                return {
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    uri: track.uri
                }
            });
        });
    },

    /*
    The .savePlaylist() method accepts a playlist name and an array of track URIs. It makes the following three requests to the Spotify API:

    GET current user’s ID
    POST a new playlist with the input name to the current user’s Spotify account. Receive the playlist ID back from the request.
    POST the track URIs to the newly-created playlist, referencing the current user’s account (ID) and the new playlist (ID)
    
    */
    savePlaylist(name, trackUris) {
        if (!name || !trackUris.length) {
            return;
        }

        const accessToken = Spotify.getAccessToken();
        console.log("Spotify.savePlaylist accessToken="+accessToken);

        const headers = { Authorization: `Bearer ${accessToken}`};
        let userId;

        /* Make a request that returns the user's Spotify username */
        return fetch('https://api.spotify.com/v1/me', {
            headers : headers
        }).then(response => response.json()).then(jsonResponse => {
            userId = jsonResponse.id;

            console.log("Spotify.savePlaylist userId="+userId);
            
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
                headers: headers,
                method: 'POST',
                body: JSON.stringify({ name: name }) 
            }).then(response => response.json()).then(jsonResponse => {
                const playlistId = jsonResponse.id;
    
                return fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({ uris: trackUris})
                })
            });
       
        });

        

        
    }
};

export default Spotify;