from flask import Flask, render_template, session, redirect, url_for, flash,jsonify,request,abort
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin, LoginManager, login_user, logout_user, login_required , current_user
from backend import backend, db, login_manager
from backend.models import User, Post, Follow,Subscribe
from flask_jwt_extended import (create_access_token)
import datetime
import jsonpickle

db.create_all()


class InvalidUsage(Exception):
    status_code = 500

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


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
        raise InvalidUsage('You are Unauthorized Missing data', status_code=401)
    user_email = user_data['email']
    password = user_data['password']
    user = User.query.filter_by(email=user_email).first()
    if user is not None and user.verify_password(password):
        login_user(user,remember=True)
        access_token = create_access_token(identity={'id': user.id})
        return jsonify({'token' : access_token , 'result' : 'created' })
    raise InvalidUsage('You are Unauthorized Missing data', status_code=401)


@backend.route('/printusers',methods=['GET'])
def usersInfo():
    users = User.query.all()
    for user in users:
        print(user.username,user.email)
    return 'Printed users in server console'


@backend.route('/users',methods=['GET'])
def get_users():
    users = User.query.all()
    ret_users = []
    for user in users :
        ret_users.append(user.to_dict())
    return jsonify(ret_users)


@backend.route('/userslist',methods=['GET'])
def get_list_users():
    # if not current_user.is_authenticated:
    #     raise InvalidUsage('You are Unauthorized', status_code=401)
    users = User.query.all()
    list_users = []
    for user in users:
        list_users.append(user.username)
    return jsonify(list_users)


@backend.route('/locations',methods=['GET'])
def travel_locations():
    # if not current_user.is_authenticated:
    #     raise InvalidUsage('You are Unauthorized', status_code=401)
    locations_list = []
    posts = Post.query.all()
    for post in posts:
        start_date = post.start_date.strftime("%Y-%m-%d")
        end_date = post.end_date.strftime("%Y-%m-%d")
        locations_list.append([post.latitude, post.longitude,start_date,end_date])
    return jsonpickle.encode(locations_list)


@backend.route('/filteredlocations',methods=['GET'])
def filtered_locations():
    # if not current_user.is_authenticated:
    #     raise InvalidUsage('You are Unauthorized', status_code=401)
    relevant_posts = []
    locations_list = []
    users_followed = Follow.query.filter_by(follower=current_user.id).all()
    for user_id in users_followed:
        relevant_posts.extend(Post.query.filter_by(user_id=user_id.followed).all())
    for post in relevant_posts:
        start_date = post.start_date.strftime("%Y-%m-%d")
        end_date = post.end_date.strftime("%Y-%m-%d")
        locations_list.append([post.latitude, post.longitude,start_date,end_date])
    return jsonpickle.encode(locations_list)


@backend.route('/logout',methods=['GET'])
@login_required
def logout():
    logout_user()
    return 'logged out',201


@backend.route('/user/new',methods=['POST'])
def register():
    data = request.get_json()
    if not data or not 'password' in data or not 'username' in data or not 'first_name' in data \
            or not 'last_name' in data or not 'gender' in data or not 'birth_date' in data or not 'email' in data:
        raise InvalidUsage('You are Unauthorized', status_code=401)
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


@backend.route('/user/regipost', methods=['POST'])
def regipost():
    data = request.get_json()
    problem = False
    if not data or not 'password' in data or not 'username' in data or not 'first_name' in data \
            or not 'last_name' in data or not 'gender' in data or not 'birth_date' in data or not 'email' in data:
        raise InvalidUsage('Couldnt find this page', status_code=400)
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
    if new_user.id == None:
        db.session.rollback()
        problem = True
        raise InvalidUsage('Couldnt find this page', status_code=400)
    start_date_list = data['post_start_date'].split('-')
    end_date_list = data['post_end_date'].split('-')
    p_start_date = datetime.datetime(int(start_date_list[0]),int(start_date_list[1]),int(start_date_list[2]))
    p_end_date = datetime.datetime(int(end_date_list[0]),int(end_date_list[1]),int(end_date_list[2]))
    new_post = Post(user_id=new_user.id, title=data['post_title'], body=data['post_body'], \
                    start_date=p_start_date, end_date=p_end_date, \
                    latitude=data['post_latitude'], longitude=data['post_longitude'])
    db.session.add(new_post)
    if problem:
        db.session.rollback()
        raise InvalidUsage('Couldnt find this page', status_code=400)
    db.session.commit()
    return 'Created'


@backend.route("/user/<string:name>", methods=['GET'])
def get_user_id(name):

    # if not current_user.is_authenticated:
        # raise InvalidUsage('You are Unauthorized', status_code=401)
    user = User.query.filter_by(username=name).first()
    if not user:
        raise InvalidUsage('This page don\'t exists', status_code=404)
    return jsonify({'id': user.id})


@backend.route('/user/<int:user_id>',methods=['GET'])
def get_user(user_id):
    # if not current_user.is_authenticated:
    #     raise InvalidUsage('You are Unauthorized', status_code=401)
    user = User.query.filter_by(id=user_id).first()
    is_follower = Follow.query.filter_by(follower=current_user.id, followed=user_id).first()
    if not (current_user.id == user_id):
        if not is_follower:
            return jsonify(username=user.username,id=user.id)
    if not user:
        raise InvalidUsage('This page dont exists', status_code=404)
    p = user.to_dict()
    return jsonify(user.to_dict())


@backend.route('/user/edit', methods=['PUT'])
def edit_user():
    # if not current_user.is_authenticated:
    #     raise InvalidUsage('You are Unauthorized', status_code=401)
    data = request.get_json()
    if data['current_user_id'] != current_user.id :
        raise InvalidUsage('You are Unauthorized', status_code=401)
    user = User.query.filter_by(id=current_user.id).first()
    if user == None:
        return "no user"
    user.first_name = data['first_name']
    user.last_name = data['last_name']
    user.birth_date = data['birthdate']
    user.gender = data['gender']
    db.session.commit()
    return "edited"

@backend.route('/user/delete',methods=['POST'])
def delete_user():
    # if not current_user.is_authenticated:
    #     raise InvalidUsage('You are Unauthorized', status_code=401)
    data = request.get_json()
    if data['current_user_id'] != current_user.id :
        raise InvalidUsage('You are Unauthorized', status_code=401)
    user = User.query.filter_by(id=current_user.id).first()
    db.session.delete(user)
    db.session.commit()
    logout_user()
    return "deleted"

@backend.route('/follow/<int:user_id>', methods=['POST'])
@login_required
def follow(user_id):
    # user = User.query.filter_by(id=user_id).first()
    # if not user:
    #     abort(404)
    new_follow = Follow(follower=current_user.id, followed=user_id)
    db.session.add(new_follow)
    db.session.commit()
    return jsonify({'sometext' : "Hello"})


@backend.route('/unfollow/<int:user_id>', methods=['POST'])
@login_required
def unfollow(user_id):
    # user = User.query.filter_by(id=user_id).first()
    # if not user:
    #     abort(404)
    # fol = Follow.query.filter_by(follower=current_user.id,followed=user_id)
    # if not fol:
    #     return abort(404)
    Follow.query.filter_by(follower=current_user.id, followed=user_id).delete()
    db.session.commit()
    return jsonify({'sometext' : "Hello"})



@backend.route('/post/posts/<int:post_user_id>',methods=['GET'])
def posts(post_user_id):
    #if user_id in db
    user_posts = Post.query.filter_by(user_id=post_user_id).all()
    following_users = Follow.query.filter_by(follower=post_user_id)
    ret_posts = []
    for user_follower in following_users:
        current_posts = Post.query.filter_by(user_id=user_follower.followed).all()
        for post in current_posts:
            ret_posts.append(post.to_dict())
    for post in user_posts:
        ret_posts.append(post.to_dict())
    return jsonify(ret_posts)


@backend.route('/post/<int:post_id>', methods=['GET'])
def get_post(post_id):
    post = Post.query.filter_by(id=post_id).first()
    return jsonify(post.to_dict())


@backend.route('/post/new', methods=['POST'])
def new_post():
    if not current_user.is_authenticated:
        raise InvalidUsage('You are Unauthorized', status_code=401)
    data = request.get_json()
    # if not data or not 'title' in data or not 'body' in data or not 'latitude' in data \
    #         or not 'longitude' in data or not 'start_date' in data or not 'end_date' in data:
    #     abort(401)
    if data['current_user_id'] != current_user.id:
        raise InvalidUsage('You are Unauthorized', status_code=401)
    start_date_list = data['start_date'].split('-')
    end_date_list = data['end_date'].split('-')
    p_start_date = datetime.datetime(int(start_date_list[0]),int(start_date_list[1]),int(start_date_list[2]))
    p_end_date = datetime.datetime(int(end_date_list[0]),int(end_date_list[1]),int(end_date_list[2]))
    new_post = Post(user_id=current_user.id, title=data['title'], body=data['body'], \
                    start_date=p_start_date, end_date=p_end_date, \
                    latitude=data['latitude'], longitude=data['longitude'])
    db.session.add(new_post)
    db.session.commit()
    return 'Created'


@backend.route('/post/delete',methods=['POST'])
def delete_post():
    # if current_user.is_authenticated:
    #     raise InvalidUsage('You are Unauthorized', status_code=401)
    data = request.get_json()
    if data['current_user_id']!=current_user.id:
        raise InvalidUsage('You are Unauthorized', status_code=401)
    post = Post.query.filter_by(id=data['deleted_post_id']).first()
    db.session.delete(post)
    db.session.commit()
    return "deleted"


@backend.route('/post/edit', methods=['PUT'])
def edit_post():
    # if not current_user.is_autenticated:
    #     raise InvalidUsage('You are Unauthorized', status_code=401)
    data = request.get_json()
    if data['current_user_id']!=current_user.id :
        raise InvalidUsage('You are Unauthorized', status_code=401)
    post = Post.query.filter_by(id=data['post_id']).first()
    post.body = data['body']
    post.title = data['title']
    post.latitude = data['latitude']
    post.longitude = data['longitude']
    post.start_date = data['start_date']
    post.end_date = data['end_date']
    db.session.commit()
    subscribes = Subscribe.query.filter_by(post_id=data['post_id'])
    for subscribe in subscribes:
        subscribe.edited = True
    db.session.commit()
    return 'edited'				

@backend.route('/post/subscribe', methods=['POST'])
def subscribe_post():
    data = request.get_json()
    if not data or 'current_user_id' not in data or 'subscribed_post_id' not in data:
        abort(400)
    if data['current_user_id']!=current_user.id :
        abort(403)
    # if post id exist
    if Subscribe.query.filter_by(user_id=data['current_user_id'], post_id=data['subscribed_post_id']):
        return 'already subscribed'
    sub = Subscribe(user_id=data['current_user_id'], post_id=data['subscribed_post_id'],edited=False)
    db.session.add(sub)
    db.session.commit()
    return 'subscribed'		

@backend.route('/printsubscribes',methods=['GET'])
def print_subscribes():
    subscribes = Subscribe.query.all()
    for subscribe in subscribes:
        print(subscribe.user_id,subscribe.post_id,subscribe.edited)
    return "printed subscriptions in server console"

@backend.route('/notifications/<int:logged_user_id>',methods=['GET'])
def get_edited_posts(logged_user_id):
    if logged_user_id != current_user.id:
        abort(403)
    subscribes = Subscribe.query.filter_by(user_id=logged_user_id)
    post_list = []
    for subscribe in subscribes:
        if subscribe.edited == True:
            post_list.append(subscribe.post_id)

    return jsonify({'id_array': post_list,'result':'success'})

@backend.route('/notification/delete', methods=['POST'])
def remove_notification():
    data = request.get_json()
    if not data or 'user_id' not in data or 'post_id' not in data:
        abort(400)
    if data['user_id'] != current_user.id:
        abort(403)
    subscribe = Subscribe.query.filter_by(user_id=data['user_id'], post_id=data['post_id']).first()
    subscribe.edited = False
    db.session.commit()
    return 'deleted'

@backend.route('/printposts', methods=['GET'])
def print_posts():
    posts = Post.query.all()
    for post in posts:
        print(post.to_dict())
    return 'Printed posts to server console'

@backend.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response
