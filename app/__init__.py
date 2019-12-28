
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from flask_jwt_extended import JWTManager

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///'  # in-memory
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://python:12345678@localhost:5433/proj'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key = "every day I am happier because I know I am one day closer to my death"
app.config['JWT_SECRET_KEY'] = 'secret'
db = SQLAlchemy(app)
db.session.commit()
db.drop_all()
db.session.commit()
jwt = JWTManager(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'


from app import routes, models