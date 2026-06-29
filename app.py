import random
from flask import Flask, render_template, jsonify
import yt_dlp

app = Flask(__name__)

CARTI_SONGS = [
    "Playboi Carti - Magnolia",
    "Playboi Carti - Location",
    "Playboi Carti - Shoota",
    "Playboi Carti - R.I.P.",
    "Playboi Carti - Sky",
    "Playboi Carti - Vamp Anthem",
    "Playboi Carti - Stop Breathing",
    "Playboi Carti - Kid Cudi Pissy Pamper (Leak)",
    "Playboi Carti - Cancun (Leak)",
    "Playboi Carti - Skeleton (Leak)",
    "Playboi Carti - Molly (Leak)",
    "Playboi Carti - Neon (Leak)",
    "Playboi Carti - Goku (Leak)",
    "Playboi Carti - Shawty In Love (Leak)",
    "Playboi Carti - Cashin (Leak)",
    "Playboi Carti - Medusa (Leak)",
    "Playboi Carti - Buffy The Body (Leak)"
]

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/random_song")
def random_song():
    try:
        # Pick a random song title
        song_query = random.choice(CARTI_SONGS)
        
        # Append 'audio' to avoid official videos that disable embedding
        search_query = song_query
        if "(Leak)" not in song_query:
            search_query += " audio"
        
        # Search YouTube using yt-dlp
        ydl_opts = {
            'default_search': 'ytsearch',
            'max_downloads': 1,
            'quiet': True,
            'extract_flat': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"ytsearch1:{search_query}", download=False)
            
            if 'entries' in info and len(info['entries']) > 0:
                entry = info['entries'][0]
                video_id = entry.get('id')
                title = entry.get('title')
                thumbnails = entry.get('thumbnails', [])
                thumbnail_url = thumbnails[-1].get('url') if thumbnails else ""
                
                return jsonify({
                    "success": True,
                    "video_id": video_id,
                    "title": title,
                    "thumbnail": thumbnail_url,
                    "query": song_query
                })
            else:
                return jsonify({"success": False, "error": "No results found for query."}), 404
            
    except Exception as e:
        print(f"Error fetching song: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
