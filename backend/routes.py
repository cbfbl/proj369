from flask import Flask, render_template, session, redirect, url_for, flash,jsonify,request,abort
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin, LoginManager, login_user, logout_user, login_required , current_user
from backend import backend, db, login_manager
from backend.forms import RegisterForm,LoginForm
from backend.models import User,Follow,Post
from flask_jwt_extended import (create_access_token)

db.create_all()

@backend.route('/')
def index():
    return render_template('index.html', title="pigdz", user="Bos")


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    logout_user()
    print("Unauthorized")
    return "Unauthorized"


@backend.route('/login', methods=['GET','POST'])
def login():
    user_data = request.get_json()
    if not user_data or not 'password' in user_data or not 'email' in user_data:
        print("Missing data")
        abort(400)
    user_email = user_data['email']
    password = user_data['password']
    user = User.query.filter_by(email=user_email).first()
    if user is not None and user.verify_password(password):
        login_user(user,remember=True)
        access_token = create_access_token(identity={'id':user.id})
        return access_token
    abort(400)

@backend.route('/printusers',methods=['GET'])
def usersInfo():
    users = User.query.all()
    for user in users :
        print(user.username,user.email)
    return 'Printed users in server console'

@backend.route('/logout',methods=['GET'])
@login_required
def logout():
    logout_user()
    return 'logged out',201


@backend.route('/user/<int:user_id>',methods=['GET'])
def get_user(user_id):
    user = User.query.filter_by(id=user_id).first()
    if not user:
        abort(404)
    p=user.to_dict()
    return jsonify(user.to_dict())


@backend.route('/follow/<int:user_id>', methods=['POST'])
@login_required
def follow(user_id):
    new_follow = Follow(follower=current_user.id, followed=user_id)
    db.session.add(new_follow)
    db.session.commit()
    return jsonify({'sometext' : "Hello"})

@backend.route('/unfollow/<int:user_id>', methods=['POST'])
@login_required
def unfollow(user_id):
    Follow.query.filter_by(follower=current_user.id,followed=user_id).delete()
    db.session.commit()
    return jsonify({'sometext' : "Hello"})

@backend.route("/user/<string:name>", methods=['GET'])
def get_user_id(name):
    user = User.query.filter_by(username=name).first()
    if not user:
        abort(404)
    return jsonify({'id': user.id})

@backend.route('/users',methods=['GET'])
def get_users():
    users = User.query.all()
    ret_users = []
    for user in users : 
        ret_users.append(user.to_dict())
    return jsonify(ret_users)


@backend.route('/user/new',methods=['POST'])
def register():
    data = request.get_json()
    if not data or not 'password' in data or not 'username' in data or not 'first_name' in data \
            or not 'last_name' in data or not 'gender' in data or not 'birth_date' in data or not 'email' in data:
        abort(400)
    check_user = User.query.filter_by(email=data['email']).first()
    if check_user:
        return 'Email Taken'
    check_user = User.query.filter_by(username=data['username']).first()
    if check_user:
        return 'Username Taken'
    new_user = User(username=data['username'], email=data['email'], gender=data['gender'], first_name=data['first_name'],
                    last_name=data['last_name'], birth_date=data['birth_date'])
    new_user.password = data['password']
    db.session.add(new_user)
    db.session.commit()
    return 'Created'

@backend.route('/post/<int:post_user_id>',methods=['GET'])
def posts(post_user_id):
    #if user_id in db
    user_posts = Post.query.filter_by(user_id=post_user_id).all()
    following_users = Follow.query.filter_by(follower=post_user_id)
    ret_posts = []
    for user in following_users:
        current_posts = Post.query.filter_by(user_id=user.id).all()
        ret_posts.append(current_posts.to_dict())
    for post in user_posts:
        ret_posts.append(post.to_dict())
    return jsonify(ret_posts)

@backend.route('/post/new', methods=['POST'])
def new_post():
    data = request.get_json()
    new_post = Post(user_id=current_user.id, title=data['title'], body=data['body'], \
                    start_date=data['start_date'], end_date=data['end_date'], \
                    latitude=data['latitude'], longitude=data['longitude'])
    db.session.add(new_post)
    db.session.commit()
    return 'Created'

@backend.route('/printposts', methods=['GET'])
def print_posts():
    posts = Post.query.all()
    for post in posts:
        print(post.user_id, post.body)
    return 'printed posts in server console'