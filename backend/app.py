import os

from flask import Flask
from flask_cors import CORS
from werkzeug.exceptions import HTTPException, RequestEntityTooLarge

from config import config
from routes.chat_routes import chat_bp
from routes.files_routes import files_bp
from routes.health_routes import health_bp
from routes.upload_routes import upload_bp
from utils.responses import error


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = config.MAX_CONTENT_LENGTH

    # In development, allow any localhost/127.0.0.1 origin regardless of
    # port (Vite auto-increments its port when 5173 is already taken), on
    # top of the explicit CORS_ORIGINS list. Production should rely on
    # CORS_ORIGINS only, since DEBUG is false there.
    allowed_origins = list(config.CORS_ORIGINS)
    if config.DEBUG:
        import re

        allowed_origins.append(re.compile(config.DEV_CORS_ORIGIN_REGEX))

    CORS(app, origins=allowed_origins, supports_credentials=True)

    os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)

    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(upload_bp, url_prefix="/api")
    app.register_blueprint(files_bp, url_prefix="/api")
    app.register_blueprint(chat_bp, url_prefix="/api")

    @app.errorhandler(RequestEntityTooLarge)
    def handle_too_large(_exc):
        return error(
            f"File exceeds the {config.MAX_UPLOAD_MB}MB upload limit.",
            413,
            code="file_too_large",
        )

    @app.errorhandler(404)
    def handle_not_found(_exc):
        return error("Route not found.", 404, code="not_found")

    @app.errorhandler(HTTPException)
    def handle_http_exception(exc):
        return error(exc.description or exc.name, exc.code, code="http_error")

    @app.errorhandler(Exception)
    def handle_unexpected(exc):
        app.logger.exception(exc)
        return error("Internal server error.", 500, code="internal_error")

    return app


app = create_app()

if __name__ == "__main__":
    # threaded=True lets the dev server handle multiple concurrent uploads
    # (e.g. several files dropped at once from the frontend) instead of
    # processing requests one at a time.
    app.run(host="0.0.0.0", port=config.PORT, debug=config.DEBUG, threaded=True)
