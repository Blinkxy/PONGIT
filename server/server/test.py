from PIL import Image, ImageDraw, ImageFont
import random
import colorsys

def generate_profile_image(initials, size=50, background_type='gradient'):
    image = Image.new('RGB', (size, size), color='white')
    draw = ImageDraw.Draw(image)

    def generate_blue_purple_gradient():
        hue1 = random.uniform(0.6, 0.78)
        hue2 = hue1 + random.uniform(0.05, 0.2)
        
        hue1 = hue1 % 1
        hue2 = hue2 % 1
        rgb1 = [int(x * 255) for x in colorsys.hsv_to_rgb(hue1, 0.7, 0.8)]
        rgb2 = [int(x * 255) for x in colorsys.hsv_to_rgb(hue2, 0.7, 0.8)]

        return tuple(rgb1), tuple(rgb2)
    
    color1, color2 = generate_blue_purple_gradient()
    for y in range(size):
        r = int(color1[0] + (color2[0] - color1[0]) * y / size)
        g = int(color1[1] + (color2[1] - color1[1]) * y / size)
        b = int(color1[2] + (color2[2] - color1[2]) * y / size)

        draw.line([(0, y), (size, y)], fill=(r, g, b))

    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size=int(size * 0.6))
    except IOError:
        font = ImageFont.load_default()
    
    text = initials.upper()
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1] * 3

    # Center the text precisely
    position = ((size - text_width) / 2, (size - text_height) / 2 - int(size * 0.05))

    # Calculate luminance for text color
    luminance = 0.299 * color1[0] + 0.587 * color1[1] + 0.114 * color1[2]
    text_color = (0, 0, 0) if luminance > 128 else (255, 255, 255)

    draw.text(position, text, font=font, fill=text_color)

    return image

test_image = generate_profile_image("AB")
test_image.save("test_profile.png")
print("Test image saved as test_profile.png")