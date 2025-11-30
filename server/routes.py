# routes.py to handle routes
from .capture import get_frame
from .input_controller import handle_key, handle_scroll, handle_move, handle_click
from flask import Response, request, render_template, redirect, url_for, send_from_directory
from .config import Config
import time
import os
from werkzeug.utils import secure_filename


def register_routes(app):
    # Ensure upload directory exists
    if not os.path.exists(Config.UPLOAD_FOLDER):
        os.makedirs(Config.UPLOAD_FOLDER)

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/video_feed')
    def video_feed():
        def frame_gen():    
            while True:
                frame = get_frame()
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n'
                       b'Content-Length: ' + str(len(frame)).encode() + b'\r\n'
                       b'\r\n' + frame + b'\r\n')
                time.sleep(1.0 / Config.FPS)   
        return Response(frame_gen(), mimetype='multipart/x-mixed-replace; boundary=frame')
    
    @app.post('/click')
    def click():
        data = request.json
        x = data['x']
        y = data['y']
        action = data.get('action', 'click')
        handle_click(x, y, action)
        return {"status": "ok"}

    @app.post('/move')
    def move():
        data = request.json
        x = data['x']
        y = data['y']
        handle_move(x, y)
        return {"status": "ok"}
    
    @app.post('/key')
    def key():
        data = request.json
        key = data['key']
        action = data.get('action', 'press')
        handle_key(key, action)
        return {"status": "ok"}
    
    @app.post('/scroll')
    def scroll():
        data = request.json
        y = data['y']
        handle_scroll(y)
        return {"status": "ok"}
    
    @app.post('/upload')
    def upload_file():
        if 'file' not in request.files:
            return redirect(url_for('index'))
        file = request.files['file']
        if file.filename == '':
            return redirect(url_for('index'))
        if file:
            filename = secure_filename(file.filename)
            file.save(os.path.join(Config.UPLOAD_FOLDER, filename))
            return redirect(url_for('index'))
    
    @app.route('/download/<filename>')
    def download_file(filename):
        return send_from_directory(Config.UPLOAD_FOLDER, filename)

    @app.post('/end')
    def end():
        os._exit(0)
        return "ok"

    @app.post('/settings')
    def update_settings():
        data = request.json
        if 'scale' in data:
            Config.SCALE = float(data['scale'])
        if 'quality' in data:
            Config.IMAGE_QUALITY = int(data['quality'])
        if 'fps' in data:
            Config.FPS = int(data['fps'])
        return {
            "status": "ok", 
            "scale": Config.SCALE,
            "quality": Config.IMAGE_QUALITY,
            "fps": Config.FPS
        }