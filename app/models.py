from app import db
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash

class User(UserMixin,db.Model):
    __tablename__ = 'users'
    username = db.Column(db.String(80),primary_key=True, unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120))

    @property
    def password(self):
        raise("Not a readable object")

    @password.setter
    def password(self,password):
        self.password_hash=generate_password_hash(password)

    def verify_password(self,password):
        return check_password_hash(self.password_hash,password)

    def get_id(self):
        return self.username

    def __repr__(self):
        return '<User %r>' % self.username


class Follow(db.Model):
    __tablename__ = 'follows'
    follower = db.Column(db.String(80), db.ForeignKey(
        'users.username'), primary_key=True)
    followed = db.Column(db.String(80), db.ForeignKey(
        'users.username'), primary_key=True)
    following = db.relationship("User", foreign_keys=[follower])
    beingfollowed = db.relationship("User", foreign_keys=[followed])


# class Post(db.Model):
#     __tablename__ = 'posts'
#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('users.username'))
#     location = db.Column(db.String(80))

db.create_all()