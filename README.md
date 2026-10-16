# Hasan Downloader

A universal video, music and photo downloader website.
Designed by SYED HASAN SHAH.

## Features
- Paste a link and see a preview of the video or photo
- Choose Video (360p up to 1080p), Music (audio only) or Photo
- Library with live download progress (%) and in-app playback
- "Save to gallery" button that opens the gallery or share sheet on mobile
- 14 supported platforms: YouTube, TikTok, Facebook, Instagram, X, Pinterest, Reddit, Vimeo, Twitch, Dailymotion, SoundCloud, Snapchat, LinkedIn, Bilibili
- Sign in with Gmail, plus an About section
- Dark and light themes

## Project structure
All files live in the root of the main branch (no subfolders):

```
Dockerfile      Container for Render (Node + ffmpeg + yt-dlp)
package.json    Node dependencies
server.js       Backend API (/api/info and /api/download) and static file serving
index.html      Page structure
style.css       Design and themes
app.js          Frontend logic
config.js       Google Client ID goes here
README.md       This file
```

## Run locally
Requirements: Node 18+, Python 3, ffmpeg, yt-dlp

```
pip install -U yt-dlp
npm install
npm start
```

Then open http://localhost:3000 in your browser.

## Deploy free on Render
1. Upload all files to the root of your GitHub repository (main branch).
2. On render.com choose New > Web Service and select your repository.
3. Set Runtime to Docker and Plan to Free.
4. Click Deploy. After a few minutes your site is live.

Note: the free plan sleeps after 15 minutes of inactivity, so the first request after a break can be slow.

## Enable Gmail sign-in
1. Go to console.cloud.google.com and create a project.
2. Open APIs & Services > Credentials > Create OAuth client ID > Web application.
3. Add your Render site link under Authorized JavaScript origins.
4. Paste the Client ID into config.js:

```
window.APP_CONFIG={GOOGLE_CLIENT_ID:"YOUR-CLIENT-ID"};
```

## How it works
1. The frontend sends the link to /api/info. The server uses yt-dlp to read the title, thumbnail and available qualities.
2. The user picks a type and quality, and the frontend requests the file from /api/download.
3. The server prepares the file and sends it back while the frontend shows the progress.
4. The file is saved to the device and also stored in the browser (IndexedDB) for the Library.

## Important notes
- Some platforms, especially YouTube, may block free server IP addresses from time to time.
- Library data stays on the user's own device.
- Only download content you own or have permission to save, and respect each platform's terms.
- Update yt-dlp regularly (redeploying rebuilds it with the latest version) so links keep working.

## Credit
Designed by SYED HASAN SHAH# ULTIMATE-DOWNLOADER-2.0
