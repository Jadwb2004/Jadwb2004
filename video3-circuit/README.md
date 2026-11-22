# Video 3 v2 — "Code Builds a Circuit"

Silent, educational 28 s Short (1080x1920, 30 fps, seamless loop). 3D build, 9 code lines, no comments.

- `scene3d.js` / `scene.html` — three.js scene (bloom), deterministic `renderFrame(t)`; 2D overlay for code, labels, hook.
- `render.mjs` — serves the folder, drives headless Chromium (SwiftShader WebGL), pipes PNG frames to ffmpeg.
  `npm install && node render.mjs build` (~11 min).
- `audio.py` — soft round key clicks (one per typed character) + barely-there hum with a warm swell at power-on.
  `python3 audio.py build/schedule.json build/audio.wav`
- Mux: `ffmpeg -i build/video_silent.mp4 -i build/audio.wav -c:v copy -c:a aac -b:a 256k -movflags +faststart ../videos/video3_v2_code_builds_a_circuit_1080x1920.mp4`
