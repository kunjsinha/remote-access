# run_server.py to run the flask app

from server.app import create_app
from server.config import Config

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, use_reloader=False, port=Config.PORT, host=Config.HOST)