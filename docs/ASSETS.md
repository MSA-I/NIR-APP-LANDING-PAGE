# Generated media manifest

Owner approved asset generation on 2026-08-24 (chat). Rule set (research brief §14):
hero loop 16:9, 6-8s, seamless, silent; matching poster; lightweight mobile variant;
no readable text, no logos, no people, no generated UI, no neon/glow. The real product
UI composites in DOM on top; video is atmosphere only.

| Take | Job id | Model | Params | Verdict |
|---|---|---|---|---|
| 1 | e87f332d-4fa4-449d-918f-a03cc3fd64af | seedance_2_0 | 16:9 · 8s · 1080p · silent | **REJECTED** in review: readable text ("Purchase order"), neon-cyan glow line, generic explainer icons. Violates no-text/no-neon rules. Raw kept at artifacts/hero-raw.mp4 (not shipped). |
| 2 | ff37fc7c-c4a0-4398-b286-7cd367e67c61 | seedance_2_0 | 16:9 · 8s · 1080p · silent · hardened constraints | **REJECTED**: no text (fixed) but glossy 3D-plastic teal tube, cartoon-smooth paper, one crumpled artifact. Negative-list prompting confirmed weak; switched to owner-directed image-first pipeline. |
| S1 | 2c5df1a8-2d0e-4dbf-9452-a8483c9f9034 | gpt_image_2 | 16:9 · 2k still | **APPROVED**: photoreal paper fiber, matte deep-teal ribbon, wheat glint, charcoal void, clean start-third, zero text/icons. Becomes poster + video anchor. |
| 3 | (pending) | seedance_2_0 | image-to-video: start+end = S1 (seamless loop), motion-only prompt per Seedance guide (front-loaded, ~45 words, one camera move, "preserve composition and colors") | pending review |

Derived files (produced with ffmpeg from the approved take):
- public/media/hero-loop.mp4 (h264, capped bitrate) + hero-loop.webm
- public/media/hero-poster.webp (frame chosen for composition, LCP-safe)
- public/media/hero-loop-mobile.mp4 (cropped/lighter; currently poster-only on mobile)

Verification: every derived file measured with ffprobe (resolution/duration/size)
before shipping; hero screenshot re-taken with media active.
