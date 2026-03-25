import numpy as np
from PIL import Image
import os
from config import UPLOAD_FOLDER


def text_to_bits(text):
    return ''.join(format(ord(c), '08b') for c in text)


def bits_to_text(bits):
    chars = [bits[i:i+8] for i in range(0, len(bits), 8)]
    return ''.join(chr(int(c, 2)) for c in chars if len(c) == 8)


def embed_watermark(image_path, watermark_text):
    img = Image.open(image_path).convert('RGB')
    pixels = np.array(img)

    delimiter = "####END####"
    message = watermark_text + delimiter
    bits = text_to_bits(message)

    flat = pixels.flatten()
    if len(bits) > len(flat):
        raise ValueError("Image too small for this watermark")

    for i, bit in enumerate(bits):
        flat[i] = (flat[i] & 0xFE) | int(bit)

    watermarked = flat.reshape(pixels.shape)
    result = Image.fromarray(watermarked.astype('uint8'))

    filename = f"watermarked_{os.path.basename(image_path)}"
    if not filename.lower().endswith('.png'):
        filename = os.path.splitext(filename)[0] + '.png'
    output_path = os.path.join(UPLOAD_FOLDER, filename)
    result.save(output_path, 'PNG')

    return output_path, filename


def extract_watermark(image_path):
    img = Image.open(image_path).convert('RGB')
    pixels = np.array(img)
    flat = pixels.flatten()

    bits = ''
    delimiter = "####END####"
    delimiter_bits = text_to_bits(delimiter)

    max_bits = min(len(flat), 10000 * 8)
    for i in range(max_bits):
        bits += str(flat[i] & 1)
        if len(bits) >= len(delimiter_bits) and bits.endswith(delimiter_bits):
            message_bits = bits[:-len(delimiter_bits)]
            return bits_to_text(message_bits)

    return None
