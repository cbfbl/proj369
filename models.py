from backend import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime


class Follow(db.Model):
    __tablename__ = 'follows'
    follower = db.Column(db.Integer, db.ForeignKey(
        'users.id'), primary_key=True)
    followed = db.Column(db.Integer, db.ForeignKey(
        'users.id'), primary_key=True)



class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120))
    gender = db.Column(db.String(20), nullable=False)
    first_name = db.Column(db.String(80))
    last_name = db.Column(db.String(80))
    birth_date = db.Column(db.String(80))
    profile_picture = db.Column(db.String(20), nullable=False, default='default.jpg')
    posts = db.relationship('Post', backref='author', lazy='dynamic')
    followed = db.relationship('Follow', foreign_keys=[Follow.follower], backref=db.backref('followed_after', lazy='joined'),
                               lazy='dynamic', cascade='all, delete-orphan')
    followers = db.relationship('Follow',
                                foreign_keys=[Follow.followed],
                                backref=db.backref('follower_of', lazy='joined'),
                                lazy='dynamic',
                                cascade='all, delete-orphan')

    @property
    def password(self):
        raise("Not a readable object")

    @password.setter
    def password(self, password):
        self.password_hash=generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)

    def get_id(self):
        return self.username

    def __repr__(self):
        return '<User %r>' % self.username


class Post(db.Model):
    __tablename__ = 'posts'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    title = db.Column(db.Text, nullable=False)
    body = db.Column(db.String)
    Timestamp = db.Column(db.DateTime, index=True, default=datetime.utcnow)
    latitude = db.Column(db.Integer, nullable=False)
    longitude = db.Column(db.Integer, nullable=False)
    country = db.Column(db.String)
    city = db.Column(db.String)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    subscribes = db.relationship('User', backref='subscribed')


db.create_all()
