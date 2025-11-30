# capture.py to capture the screen  
import mss
from PIL import Image
import io
from .config import Config

sct = mss.mss()

def get_frame():
    screen = sct.grab(sct.monitors[1])
    img = Image.frombytes("RGB", screen.size, screen.rgb)

    new_size = (int(screen.size[0] * Config.SCALE), int(screen.size[1] * Config.SCALE))
    img = img.resize(new_size, Image.Resampling.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=Config.IMAGE_QUALITY)
    buf.seek(0)
    return buf.getvalue()