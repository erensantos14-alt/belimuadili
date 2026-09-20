"""
Uygulama simgesini üretir.

Mark: uzunlukları azalan üç çubuk — sıralanmış bir liste.
Renkler globals.css'teki paletten: petrol zemin, kağıt rengi çubuklar.

Çalıştırmak için:  python3 scripts/make_icons.py
Simgeyi değiştirmek istersen buradaki değerleri düzenleyip tekrar çalıştır.
"""

from PIL import Image, ImageDraw

PETROL = (14, 106, 94)      # --accent
PAPER = (242, 241, 236)     # --paper
AMBER = (232, 176, 63)      # tepe çubuğu için vurgu

# Çubuklar: (genişlik oranı, renk) — tepeden aşağı kısalıyor
BARS = [
    (1.00, AMBER),
    (0.76, PAPER),
    (0.55, PAPER),
    (0.36, PAPER),
]

BAR_GAP = 0.34  # çubuk yüksekliğine oranla boşluk


def draw_icon(size: int, safe: float) -> Image.Image:
    """safe: kenarlardan bırakılacak boşluk oranı (maskeli simgeler için)."""
    img = Image.new("RGBA", (size, size), PETROL + (255,))
    d = ImageDraw.Draw(img)

    inset = size * safe
    box = size - inset * 2

    n = len(BARS)
    bar_h = box / (n + BAR_GAP * (n - 1))
    gap = bar_h * BAR_GAP
    radius = bar_h / 2

    y = inset
    for ratio, color in BARS:
        w = box * ratio
        d.rounded_rectangle(
            [inset, y, inset + w, y + bar_h],
            radius=radius,
            fill=color + (255,),
        )
        y += bar_h + gap

    return img


def main() -> None:
    # Ana ekran ve favicon — kenarlarda rahat boşluk
    draw_icon(512, 0.22).save("public/icon-512.png")
    draw_icon(192, 0.22).save("public/icon-192.png")

    # iOS ana ekran simgesi (köşeleri iOS kendi yuvarlıyor)
    draw_icon(180, 0.22).save("src/app/apple-icon.png")

    # Sekme simgesi — küçük boyutta okunsun diye biraz daha dolu
    draw_icon(256, 0.18).save("src/app/icon.png")

    print("Simgeler üretildi.")


if __name__ == "__main__":
    main()
