from flask import Flask, render_template, session, redirect, url_for, flash,jsonify,request,abort
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin, LoginManager, login_user, logout_user, login_required , current_user
from backend import backend, db, login_manager
from backend.forms import RegisterForm,LoginForm
from backend.models import User
from flask_jwt_extended import (create_access_token)

db.create_all()

@backend.route('/')
def index():
    return render_template('index.html', title="pigdz", user="Bos")


@login_manager.user_loader
def load_user(username):
    return User.query.get(username)


@backend.route('/login', methods=['GET','POST'])
def login():
    # form = LoginForm()
    # if form.validate_on_submit():
    #     username = form.username.data
    #     password = form.password.data
    #     user = User.query.filter_by(username=username).first()
    #     if user is not None and user.verify_password(password):
    #         login_user(user)
    #         return redirect(url_for('profile'))
    #     else :
    #         flash("Invalid username or password")
    # return render_template('login.html',form=form)
    user_data = request.get_json()
    if not user_data or not 'password' in user_data or not 'email' in user_data:
        print("Missing data")
        abort(400)
    user_email = user_data['email']
    password = user_data['password']
    user = User.query.filter_by(email=user_email).first()
    if user is not None and user.verify_password(password):
        login_user(user)
        access_token = create_access_token(identity={'id':user_email})
        return access_token
    abort(400)

@backend.route('/printusers',methods=['GET'])
def usersInfo():
    users = User.query.all()
    for user in users :
        print(user.username,user.email)
    return 'Printed users in server console'

@backend.route('/logout',methods=['GET'])
def logout():
    logout_user()
    return 'logged out',201


@backend.route('/user/<name>',methods=['GET'])
def get_user(name):
    user = User.query.filter_by(email=name).first()
    if not user:
        abort(404)
    return jsonify({'username':user.username, 'email':user.email,
                    'first_name':user.first_name, 'last_name':user.last_name})


@backend.route('/user/new',methods=['POST'])
def register():
    # form = RegisterForm()
    # if form.validate_on_submit():
    #     username = form.username.data
    #     email = form.email.data
    #     password = form.password.data
    #     new_user = User(username=username,email=email)
    #     new_user.password = password
    #     if User.query.filter_by(username=username).first() != None:
    #         return render_template('register.html', form=form)
    #     db.session.add(new_user)
    #     db.session.commit()
    #     flash('Successfuly Registered')
    #     print(User.query.all())
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

