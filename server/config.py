import os

class Config:
    FPS = 60
    HOST = "127.0.0.1" #change to 0.0.0.0 for same network remote access
    PORT = 5001
    IMAGE_QUALITY = 30
    SCALE = 0.5
    ALLOW_KEYBOARD = True
    ALLOW_MOUSE = True 
    UPLOAD_FOLDER = os.path.expanduser('~/Downloads') 
    

