Deno.serve(async (req) => {
     // CORS
       if (req.method === 'OPTIONS') {
       return new Response('ok', { 
           headers: { 
             'Access-Control-Allow-Origin': '*', 
             'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' 
           } 
        })
      }
   
      const SPOTIFY_CLIENT_ID = Deno.env.get("2c2d0e6de2c74806b1fe1a5cc1ee7d5b")
      const SPOTIFY_CLIENT_SECRET = Deno.env.get("7f6365b4067549b6a8148984a5f7e127")
   
      try {
        const authResponse = await fetch("https://accounts.spotify.com/api/token", {
          method: "POST",
          headers: {
           "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + btoa(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET),
          },
          body: "grant_type=client_credentials",
        })
        
        const tokenData = await authResponse.json()
        const { access_token } = tokenData
   
        const url = new URL(req.url)
        const playlistId = url.searchParams.get("playlistId") || "37i9dQZF1DWZeKCadgRdKQ"
        
        const tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          headers: { "Authorization": `Bearer ${access_token}` }
        })
        
        const data = await tracksResponse.json()
   
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        })
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        })
      }
    })