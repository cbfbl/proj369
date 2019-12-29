
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from flask_jwt_extended import JWTManager

backend = Flask(__name__)
CORS(backend, supports_credentials=True)
backend.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///'  # in-memory
#backend.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://python:12345678@localhost:5433/proj'
backend.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
backend.secret_key = "every day I am hbackendier because I know I am one day closer to my death"
backend.config['JWT_SECRET_KEY'] = 'secret'
db = SQLAlchemy(backend)
db.session.commit()
db.drop_all()
db.session.commit()
jwt = JWTManager(backend)
login_manager = LoginManager(backend)
login_manager.login_view = 'login'


from backend import routes, models