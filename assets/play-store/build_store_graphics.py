from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math


ROOT = Path(__file__).resolve().parent
RAW = ROOT / "raw"
FINAL = ROOT / "final"
FINAL.mkdir(parents=True, exist_ok=True)

PORTRAIT = (1080, 1920)
LANDSCAPE = (1920, 1080)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("C:/Windows/Fonts/seguisb.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


def gradient(size, top, bottom):
    w, h = size
    image = Image.new("RGB", size)
    pixels = image.load()
    for y in range(h):
        t = y / max(h - 1, 1)
        color = tuple(round(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        for x in range(w):
            pixels[x, y] = color
    return image


def add_glow(canvas, center, radius, color, opacity=90):
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    x, y = center
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*color, opacity))
    layer = layer.filter(ImageFilter.GaussianBlur(radius // 2))
    canvas.alpha_composite(layer)


def rounded_mask(size, radius):
    mask = Image.new("L", size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius=radius, fill=255)
    return mask


def phone_card(canvas, screenshot_path, box, rotation=0):
    x, y, w, h = box
    screenshot = Image.open(screenshot_path).convert("RGB").resize((w, h), Image.Resampling.LANCZOS)
    radius = max(24, w // 18)
    mask = rounded_mask((w, h), radius)
    phone = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    phone.paste(screenshot, (0, 0), mask)

    border = Image.new("RGBA", (w + 12, h + 12), (0, 0, 0, 0))
    ImageDraw.Draw(border).rounded_rectangle(
        (1, 1, w + 10, h + 10), radius=radius + 5,
        fill=(4, 8, 18, 255), outline=(118, 215, 255, 90), width=2,
    )
    border.alpha_composite(phone, (6, 6))

    if rotation:
        border = border.rotate(rotation, resample=Image.Resampling.BICUBIC, expand=True)

    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sx = x - (border.width - w) // 2
    sy = y - (border.height - h) // 2
    sh = Image.new("RGBA", border.size, (0, 0, 0, 0))
    sh.paste((0, 0, 0, 190), (0, 0, border.width, border.height), border.getchannel("A"))
    sh = sh.filter(ImageFilter.GaussianBlur(34))
    shadow.alpha_composite(sh, (sx, sy + 30))
    canvas.alpha_composite(shadow)
    canvas.alpha_composite(border, (sx, sy))


def wrap_text(draw, text, fnt, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if draw.textbbox((0, 0), candidate, font=fnt)[2] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def draw_headline(draw, text, xy, max_width, size=84, fill=(247, 250, 255), spacing=8):
    fnt = font(size, bold=True)
    lines = wrap_text(draw, text, fnt, max_width)
    x, y = xy
    line_height = size + spacing
    for line in lines:
        draw.text((x, y), line, font=fnt, fill=fill, stroke_width=1, stroke_fill=(247, 250, 255, 80))
        y += line_height
    return y


def brand_pill(draw, x, y, accent):
    label = "DHULO  •  THOUGHTS MEANT TO FADE"
    fnt = font(24, bold=True)
    bbox = draw.textbbox((0, 0), label, font=fnt)
    width = bbox[2] + 42
    draw.rounded_rectangle((x, y, x + width, y + 52), radius=26, fill=(17, 31, 48, 255), outline=(*accent, 160), width=2)
    draw.text((x + 21, y + 11), label, font=fnt, fill=(205, 230, 247, 255))


def portrait_asset(filename, screenshot, headline, subline, top, bottom, accent):
    base = gradient(PORTRAIT, top, bottom).convert("RGBA")
    add_glow(base, (900, 260), 360, accent, 90)
    add_glow(base, (120, 1540), 300, (61, 90, 170), 55)
    draw = ImageDraw.Draw(base)
    brand_pill(draw, 72, 72, accent)
    end_y = draw_headline(draw, headline, (72, 174), 936, size=78)
    draw.text((74, end_y + 16), subline, font=font(31), fill=(173, 195, 216, 255))

    card_y = max(565, end_y + 105)
    card_h = 1250
    card_w = round(card_h * 432 / 768)
    phone_card(base, RAW / screenshot, ((PORTRAIT[0] - card_w) // 2, card_y, card_w, card_h))

    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle((72, 1810, 1008, 1813), radius=2, fill=(*accent, 150))
    draw.text((72, 1840), "PRIVATE • LOCAL • MADE TO FADE", font=font(22, bold=True), fill=(130, 159, 188, 255))
    base.convert("RGB").save(FINAL / filename, quality=96)


PORTRAITS = [
    ("01-quiet-place-9x16.png", "06-home.png", "A quiet place for thoughts that don’t need to stay.", "Write it down. Breathe a little easier.", (4, 9, 22), (7, 19, 38), (80, 201, 255)),
    ("02-write-and-release-9x16.png", "05-editor.png", "Write it. Set a lifespan. Let it go.", "A private ritual, shaped by you.", (8, 10, 26), (19, 17, 48), (255, 203, 91)),
    ("03-watch-it-fade-9x16.png", "03-decay.png", "Watch your words gently fade.", "Ash, Drift, Redact or Scramble.", (3, 12, 28), (4, 29, 45), (82, 218, 255)),
    ("04-make-space-9x16.png", "07-reader.png", "Make space, one thought at a time.", "Pause it, add time, or let the ending begin.", (7, 9, 24), (18, 13, 39), (129, 163, 255)),
    ("05-release-for-good-9x16.png", "04-release.png", "When you’re ready, release it for good.", "No archive. No clutter. No looking back.", (7, 10, 24), (32, 15, 32), (255, 120, 157)),
    ("06-your-space-9x16.png", "09-profile.png", "Your space. Your colours. Your calm.", "Themes and wallpapers for every mood.", (4, 13, 28), (14, 25, 47), (112, 220, 255)),
    ("07-choose-the-feeling-9x16.png", "08-settings.png", "Choose how each thought fades.", "Fine-tune time, motion, sound and feedback.", (8, 10, 23), (14, 27, 40), (83, 230, 194)),
    ("08-private-by-design-9x16.png", "02-write.png", "Private by design. Yours by default.", "No account, no ads and no cloud note sync.", (5, 10, 24), (18, 18, 42), (255, 205, 87)),
]


for item in PORTRAITS:
    portrait_asset(*item)


def landscape_journey():
    base = gradient(LANDSCAPE, (4, 9, 22), (9, 24, 45)).convert("RGBA")
    add_glow(base, (960, 130), 430, (72, 191, 255), 70)
    draw = ImageDraw.Draw(base)
    brand_pill(draw, 72, 58, (80, 201, 255))
    draw_headline(draw, "Write it. Watch it fade. Let it go.", (72, 155), 1776, size=78)
    draw.text((75, 260), "A small, private ritual for thoughts that have stayed too long.", font=font(31), fill=(177, 202, 224, 255))
    shots = ["05-editor.png", "03-decay.png", "04-release.png"]
    xs = [210, 766, 1322]
    for i, (shot_name, x) in enumerate(zip(shots, xs)):
        phone_card(base, RAW / shot_name, (x, 350, 388, 690), rotation=(-3, 0, 3)[i])
    ImageDraw.Draw(base).text((72, 1010), "DHULO", font=font(23, bold=True), fill=(114, 160, 193, 255))
    base.convert("RGB").save(FINAL / "09-write-fade-release-16x9.png", quality=96)


def landscape_personal():
    base = gradient(LANDSCAPE, (9, 8, 24), (21, 18, 48)).convert("RGBA")
    add_glow(base, (1570, 230), 430, (164, 111, 255), 80)
    add_glow(base, (250, 900), 360, (62, 195, 255), 50)
    draw = ImageDraw.Draw(base)
    brand_pill(draw, 72, 58, (150, 124, 255))
    draw_headline(draw, "A softer way to move forward.", (72, 165), 910, size=86)
    draw.text((77, 382), "Temporary notes. Gentle decay. A space that feels like yours.", font=font(32), fill=(191, 187, 222, 255))
    draw.rounded_rectangle((72, 500, 760, 828), radius=34, fill=(25, 24, 55, 255), outline=(150, 124, 255, 150), width=2)
    bullets = ["No account", "No ads", "No cloud note sync", "Multiple themes & wallpapers"]
    y = 552
    for bullet in bullets:
        draw.ellipse((112, y + 11, 130, y + 29), fill=(103, 211, 255, 255))
        draw.text((154, y), bullet, font=font(30, bold=True), fill=(239, 242, 252, 255))
        y += 66
    phone_card(base, RAW / "06-home.png", (1050, 230, 410, 729), rotation=-3)
    phone_card(base, RAW / "09-profile.png", (1400, 265, 410, 729), rotation=4)
    base.convert("RGB").save(FINAL / "10-softer-way-16x9.png", quality=96)


landscape_journey()
landscape_personal()

print(f"Created {len(PORTRAITS) + 2} Play Store graphics in {FINAL}")
