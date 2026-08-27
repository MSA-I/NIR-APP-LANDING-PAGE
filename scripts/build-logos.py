# Build the logo wall's marks from the sources the owner supplied.
#
# The files in the לוגואים folder are what real brand assets look like when they
# come out of as many different design studios: some sit on a light card, some
# sit on a black one, one is a wide banner with a black bar across the top.
# Dropped onto the colophon's onyx ground as-is, most of them would draw their
# own rectangle and the wall would read as screenshots rather than marks.
#
# So the background is not "removed", it is keyed, and every mark comes out in
# ONE tint. That is what a logo wall on a dark ground does — the catalogue
# component this section follows applies `dark:brightness-0 dark:invert` for
# exactly this reason — and it is also the only treatment under which a gold
# seal, a blue wordmark and a red serif can sit in a row without one of them
# winning.
#
# Keying, per source:
#   light   the mark is darker than its card. alpha = how far below the card.
#   dark    the mark is lighter than its card. alpha = how far above it.
# Both then get a gamma so soft antialiased edges stay soft rather than
# snapping to a hard cut.
#
# Then each mark is trimmed to its own alpha bounding box, so the wall spaces
# the MARKS evenly rather than the whitespace their exporters left around them.
#
#   python scripts/build-logos.py
#
# Output: public/assets/logos/*.webp, and a manifest printed for extra.ts.

import os
import sys
from PIL import Image
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
# The sources are the owner's brand assets, not this page's, so they are not
# committed. Where they SIT is the owner's business: beside the repository, or
# inside it and untracked, which is where they were found on 27.08.2026. The
# probe checks each folder from the repository root upwards, so both spellings
# of "beside" work and neither has to be argued about again.
SRC = None
probe = ROOT
for _ in range(8):
    cand = os.path.join(probe, 'לוגואים')
    if os.path.isdir(cand):
        SRC = os.path.abspath(cand)
        break
    up = os.path.dirname(probe)
    if up == probe:
        break
    probe = up
if SRC is None:
    sys.exit('logo sources not found: expected a "לוגואים" folder in or beside the repository')

OUT = os.path.join(ROOT, 'public', 'assets', 'logos')
os.makedirs(OUT, exist_ok=True)

# slug, source file, which way the mark runs against its card, display name,
# and an optical scale.
#
# The scale is not decoration. Normalising six marks to one HEIGHT is the wrong
# normalisation when two of them are round seals and four are wordmarks: a
# circular seal at the cap height of a wordmark reads as half the size, because
# the eye measures a wordmark by its letters and a seal by its diameter. The
# two seals are given a third more height, which is what makes the row look
# level. Measured by eye against the row, which is the only instrument there is
# for this.
#
# Two of the six carry a real alpha channel already, but BOTH of them still
# need keying on top of it: the contractor's banner has a black bar baked into
# the opaque area, and the events seal is gold on black inside its own
# silhouette. `dark` keys by luma and then multiplies by whatever alpha the
# file already had, so both are handled by one path.
#
# The last number is the floor: how far a pixel has to depart from its card
# before it counts as ink. 0.06 is enough for a flat card. The contractor's
# banner is a WHITE house sitting on a dark red badge sitting on a black bar,
# and at 0.06 the badge keys to a quarter opacity and the mark arrives wearing
# a plate none of the other five wear.
#
# Xel Extreme Linen came off the wall on 27.08.2026 and Spring Footwear went on
# the same day, both by the owner. Xel's source stays in that folder and is
# simply not built any more, so a rebuild cannot put a mark back on a wall it
# was taken off. Spring is white type on a flat mid-grey card: the `dark` path.
LOGOS = [
    ('falafel',   'LOGO1.png',                                  'light', 'פלאפל בתחנה',       1.34, 0.06),
    ('adir',      'adir_contracting_group_signslandscape.webp', 'dark',  'Adir Contracting',  1.0,  0.12),
    ('gamos',     'לוגו מרכזי.png',                              'dark',  'GAMOS אירועים',     1.24, 0.10),
    ('nir',       'ניר-נדלן-לוגו.png',                           'light', 'NIR Estate',        1.0,  0.06),
    ('priscilla', 'פרסיליה לוגו_2.png',                          'light', 'פרסיליה',           1.0,  0.06),
    ('spring',    'spring.png',                                 'dark',  'Spring Footwear',   1.0,  0.06),
]

# The colophon's ink. One tint for all six.
TINT = (251, 246, 238)
# Rendered at 2x of a 30px display height.
TARGET_H = 60


def key(img, mode, floor):
    """Alpha from how far the pixel departs from its card, not from a colour match."""
    rgb = np.asarray(img.convert('RGB'), dtype=np.float32)
    # Rec. 601 luma: the eye's own weighting, so a mid-blue mark and a mid-grey
    # one key to the same opacity.
    lum = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]

    src = np.asarray(img.convert('RGBA'), dtype=np.float32)
    had_alpha = src[:, :, 3]

    if mode == 'own':
        return had_alpha.astype(np.uint8)

    if mode == 'light':
        # The card is the brightest thing in the file. Measure it rather than
        # assuming white: two of these cards are #e8e8e8, not #ffffff.
        card = np.percentile(lum, 97)
        a = (card - lum) / max(card * 0.72, 1.0)
    else:
        # On a black card, luma alone cannot tell a dark red badge from the
        # black behind it: the contractor's mark is a WHITE house on a DARK RED
        # badge on a BLACK bar, and its wordmark is the same dark red as the
        # badge. Keyed on luma the wordmark and the badge key together, and
        # raising the floor far enough to lose the badge loses the word "ADIR"
        # with it. Chroma separates them: the bar is neutral and everything the
        # designer drew is not.
        chroma = rgb.max(axis=2) - rgb.min(axis=2)
        # 1.15, not 2.0. At 2.0 the badge keys solid and swallows the white
        # house inside it; at 1.15 the badge lands around a third of an opacity
        # and the house still reads through it as the brightest thing in the
        # mark, which is a knockout of that logo rather than a silhouette of
        # its outline.
        signal = np.maximum(lum, chroma * 1.15)
        card = np.percentile(signal, 3)
        a = (signal - card) / max((255.0 - card) * 0.72, 1.0)

    a = np.clip(a, 0.0, 1.0)
    # A floor under the card. The cards are not flat: a JPEG-ish grey at 235
    # against a measured card of 243 keys to alpha 12, which is invisible on
    # its own and a rectangular haze the size of the whole file once six of
    # them sit on an onyx ground. Everything under the floor is the card.
    a = np.clip((a - floor) / (1.0 - floor), 0.0, 1.0)
    # Gamma below 1 lifts the faint edge pixels, which is what keeps a thin
    # serif from breaking up. Above ~0.85 the fill goes chalky.
    a = a ** 0.78
    # Whatever transparency the file already carried still wins.
    a = a * (had_alpha / 255.0)
    return (a * 255.0).astype(np.uint8)


def trim(arr_rgba):
    """Crop to the alpha bounding box, ignoring near-transparent dust."""
    a = arr_rgba[:, :, 3]
    solid = a > 12
    rows = np.any(solid, axis=1)
    cols = np.any(solid, axis=0)
    if not rows.any() or not cols.any():
        return arr_rgba
    y0, y1 = np.where(rows)[0][[0, -1]]
    x0, x1 = np.where(cols)[0][[0, -1]]
    return arr_rgba[y0:y1 + 1, x0:x1 + 1]


manifest = []
for slug, filename, mode, label, scale, floor in LOGOS:
    path = os.path.join(SRC, filename)
    if not os.path.isfile(path):
        sys.exit('missing logo source: ' + path)
    img = Image.open(path)
    alpha = key(img, mode, floor)

    out = np.zeros((alpha.shape[0], alpha.shape[1], 4), dtype=np.uint8)
    out[:, :, 0] = TINT[0]
    out[:, :, 1] = TINT[1]
    out[:, :, 2] = TINT[2]
    out[:, :, 3] = alpha
    out = trim(out)

    im = Image.fromarray(out, 'RGBA')
    h = max(1, round(TARGET_H * scale))
    w = max(1, round(im.width * h / im.height))
    im = im.resize((w, h), Image.LANCZOS)
    dest = os.path.join(OUT, slug + '.webp')
    im.save(dest, 'WEBP', quality=92, method=6)
    manifest.append((slug, label, im.width, im.height, os.path.getsize(dest)))
    print('  %-10s %-28s %4dx%-3d  %5.1f KB  (%s card)' %
          (slug, label, im.width, im.height, os.path.getsize(dest) / 1024, mode))

print('\nfor src/content/extra.ts:')
for slug, label, w, h, _ in manifest:
    print("      { src: 'assets/logos/%s.webp', name: '%s', w: %d, h: %d }," % (slug, label, w, h))
