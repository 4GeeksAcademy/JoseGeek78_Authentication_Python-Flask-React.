import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS
from api.utils import APIException
from api.models import db, User
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from flask_bcrypt import Bcrypt
from datetime import timedelta
from flask_jwt_extended import JWTManager

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../public/')
app = Flask(__name__)
app.url_map.strict_slashes = False
bcrypt = Bcrypt(app)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)
app.config["JWT_SECRET_KEY"] = os.environ.get('JWT_SECRET')
jwt = JWTManager(app)
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type = True)
db.init_app(app)
CORS(app)
setup_admin(app)
setup_commands(app)
app.register_blueprint(api, url_prefix='/api')

@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response

@app.route("/api/token", methods=["POST"])
def create_token():
    body = request.get_json(silent=True)
    if body is None: 
        return jsonify({"msg": "Body missing"}), 400 
    if "email" not in body:
        return jsonify({"msg": "Email missing"})
    if "password" not in body:
        return jsonify({"msg": "Password missing"})
    user = User.query.filter_by(email=body['email']).first()
    if user is None: 
        return jsonify({"msg": "user doesn't exist"}), 402
    if not bcrypt.check_password_hash(user.password, body['password']):
        return jsonify({'msg':'password is not correct'}), 402
    access_token = create_access_token(identity=user.email)
    return jsonify(access_token=access_token), 200

@app.route('/api/user', methods=['POST'])
def add_new_user():
    body = request.get_json(silent=True)
    if body is None: 
        return jsonify({"msg": "Body missing"}), 400
    if "email" not in body:
        return jsonify({"msg": "Email missing"})
    if "password" not in body:
        return jsonify({"msg": "Password missing"})
    pw_hash = bcrypt.generate_password_hash(body['password']).decode('utf-8')
    new_user = User()
    new_user.email = body['email']
    new_user.password = pw_hash
    new_user.is_active = True
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'msg': 'User with email {} has been created'.format(body['email'])})

if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
