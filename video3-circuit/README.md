# Video 3 — "Code Builds a Circuit"

Silent, educational 28 s Short (1080x1920, 30 fps, seamless loop).

- `scene.js` / `scene.html` — deterministic canvas renderer (`renderFrame(t)`).
- `render.mjs` — drives headless Chromium, pipes frames to ffmpeg (`node render.mjs build`).
- `audio.py` — key clicks synced to every typed character, ambient hum, power-on buzz
  (`python3 audio.py build/schedule.json build/audio.wav`).
- Mux: `ffmpeg -i build/video_silent.mp4 -i build/audio.wav -af "lowpass=f=15000:p=2" -c:v copy -c:a aac -b:a 256k -movflags +faststart ../videos/video3_code_builds_a_circuit_1080x1920.mp4`

Output: `videos/video3_code_builds_a_circuit_1080x1920.mp4`
