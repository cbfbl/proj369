import React, { Component } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { flask_server_adress } from '../utils';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { withRouter } from 'react-router-dom';
//const flask_server_adress = 'http://127.0.0.1:5000';

class NewPost extends Component {
	constructor() {
		super();
		this.onSubmit = this.onSubmit.bind(this);
		this.state = {
			title: '',
			body: '',
			start_date: '',
			end_date: '',
			latitude: '',
			longitude: ''
		};
	}
	render() {
		return (
			<form className="form-horizontal" onSubmit={this.onSubmit}>
				<div>
					<label className="col-sm-2">Title : </label>
					<input
						type="text"
						onChange={(event) => {
							this.setState({ title: event.target.value });
						}}
					/>
					<div>
						<label className="col-sm-2">Message : </label>
						<input
							type="textarea"
							onChange={(event) => {
								this.setState({ body: event.target.value });
							}}
						/>
					</div>
				</div>
				<div>
					<label className="col-sm-2">start date : </label>
					<input
						type="date"
						onChange={(event) => {
							this.setState({ start_date: event.target.value });
						}}
					/>
					<div>
						<label className="col-sm-2">end date : </label>
						<input
							type="date"
							onChange={(event) => {
								this.setState({ end_date: event.target.value });
							}}
						/>
					</div>
				</div>
				<div>
					<label className="col-sm-2">latitude : </label>
					<input
						type="number"
						step="any"
						onChange={(event) => {
							this.setState({ latitude: event.target.value });
						}}
					/>
					<div>
						<label className="col-sm-2">longitude : </label>
						<input
							type="number"
							step="any"
							onChange={(event) => {
								this.setState({ longitude: event.target.value });
							}}
						/>
					</div>
				</div>
				<div className="col-sm-2">
					<input type="submit" className="btn-success" value="Submit" />
				</div>
			</form>
		);
	}
	onSubmit(e) {
		const user_token = localStorage.usertoken;
		let decoded = '';
		if (user_token) {
			decoded = jwt_decode(user_token);
			const logged_user_id = decoded.identity.id;
			e.preventDefault();
			axios.defaults.withCredentials = true;
			axios
				.post(flask_server_adress + '/post/new', {
					current_user_id: logged_user_id,
					title: this.state.title,
					body: this.state.body,
					start_date: this.state.start_date,
					end_date: this.state.end_date,
					latitude: this.state.latitude,
					longitude: this.state.longitude
				})
				.then((response) => {
					if (response.data === 'Created') {
						this.props.history.push('/Post');
					}
				})
				.catch((err) => {
					alert(err);
					console.log(err);
				});
		}
	}
}

class Post extends Component {
	constructor() {
		super();
		this.subscribe = this.subscribe.bind(this);
		this.deletePost = this.deletePost.bind(this);
		this.editPost = this.editPost.bind(this);
		this.toggleEdit = this.toggleEdit.bind(this);
	}
	state = {
		id: '',
		uploader_id: '',
		contents: '',
		is_current_user_subscribed: false,
		title: '',
		latitude: '',
		longitude: '',
		start_date: '',
		end_date: '',
		editable: 'false',
		changed: false
	};
	componentDidMount() {
		if (!this.state.changed) {
			this.setState({
				id: this.props.post_id,
				uploader_id: this.props.uploader_id,
				contents: this.props.contents,
				title: this.props.title,
				latitude: this.props.latitude,
				longitude: this.props.longitude,
				start_date: this.props.start_date,
				end_date: this.props.end_date,
				editable: 'false'
			});
		} else {
			axios.defaults.withCredentials = true;
			axios
				.get(flask_server_adress + '/post/' + this.state.id)
				.then((response) => {
					const post_data = response.data;

					this.setState({
						contents: post_data.body,
						title: post_data.title,
						latitude: post_data.latitude,
						longitude: post_data.longitude,
						start_date: post_data.start_date,
						end_date: post_data.end_date,
						editable: 'false',
						changed: false
					});
				})
				.catch((err) => {
					alert(err);
					console.log(err);
				});
		}
	}

	subscribe() {
		const user_token = localStorage.usertoken;
		let decoded = '';
		if (user_token) {
			decoded = jwt_decode(user_token);
			const logged_user_id = decoded.identity.id;
			if (logged_user_id !== this.state.uploader_id) {
				axios.defaults.withCredentials = true;
				axios
					.post(flask_server_adress + '/post/subscribe', {
						subscribed_post_id: this.state.id,
						current_user_id: logged_user_id
					})
					.then((response) => {
						if (response.data === 'subscribed') {
							this.props.history.push('/Post');
						}
					})
					.catch((err) => {
						console.log(err);
					});
			}
		}
	}
	deletePost() {
		const user_token = localStorage.usertoken;
		let decoded = '';
		if (user_token) {
			decoded = jwt_decode(user_token);
			const logged_user_id = decoded.identity.id;
			if (logged_user_id === this.state.uploader_id) {
				axios.defaults.withCredentials = true;
				axios
					.post(flask_server_adress + '/post/delete', {
						deleted_post_id: this.state.id,
						current_user_id: logged_user_id
					})
					.then((response) => {
						if (response.data === 'deleted') {
							this.props.history.push('/Post');
						}
					})
					.catch((err) => {
						alert(err);
						console.log(err);
					});
			}
		}
	}
	editPost() {
		const user_token = localStorage.usertoken;
		let decoded = '';
		if (user_token) {
			decoded = jwt_decode(user_token);
			const logged_user_id = decoded.identity.id;
			if (logged_user_id === this.state.uploader_id) {
				axios.defaults.withCredentials = true;
				axios
					.put(flask_server_adress + '/post/edit', {
						current_user_id: logged_user_id,
						post_id: this.state.id,
						body: this.state.contents,
						title: this.state.title,
						latitude: this.state.latitude,
						longitude: this.state.longitude,
						start_date: this.state.start_date,
						end_date: this.state.end_date
					})
					.then((response) => {
						if (response.data === 'edited') {
							this.setState({
								changed: true
							});
							this.componentDidMount();
						}
					})
					.catch((err) => {
						alert(err);
						console.log(err);
					});
			}
		}
	}
	toggleEdit() {
		this.setState({
			editable: this.state.editable === 'false' ? 'true' : 'false'
		});
		if (this.state.editable === 'true') {
			this.componentDidMount();
		}
	}
	isCurrentUserMaker() {
		const user_token = localStorage.usertoken;
		let decoded = '';
		if (user_token) {
			decoded = jwt_decode(user_token);
			const logged_user_id = decoded.identity.id;
			if (logged_user_id === this.state.uploader_id) {
				return true;
			}
		}
		return false;
	}
	render() {
		const edit_post = (
			<div>
				<form onSubmit={this.editPost}>
					<input
						type="text"
						value={this.state.title}
						onChange={(event) => {
							this.setState({ title: event.target.value });
						}}
					/>
					<br />
					<input
						type="text"
						value={this.state.contents}
						onChange={(event) => {
							this.setState({ contents: event.target.value });
						}}
					/>
					<p>{this.state.uploader_id}</p>
					<div>
						<input
							type="number"
							step="any"
							value={this.state.latitude}
							onChange={(event) => {
								this.setState({ latitude: event.target.value });
							}}
						/>
						<br />
						<input
							type="number"
							step="any"
							value={this.state.longitude}
							onChange={(event) => {
								this.setState({ longitude: event.target.value });
							}}
						/>
					</div>
					<div>
						<input
							type="date"
							value={this.state.start_date}
							onChange={(event) => {
								this.setState({ start_date: event.target.value });
							}}
						/>
						<br />
						<input
							type="date"
							value={this.state.end_date}
							onChange={(event) => {
								this.setState({ end_date: event.target.value });
							}}
						/>
					</div>
				</form>
			</div>
		);
		const edit_buttons = (
			<div>
				<button onClick={this.editPost}>Submit changes</button>
				<button onClick={this.toggleEdit}>Cancel changes</button>
			</div>
		);
		const post_maker_buttons = (
			<div>
				<button onClick={this.deletePost}>Delete</button>
				<button onClick={this.toggleEdit}>Edit</button>
			</div>
		);
		const maker_buttons = this.state.editable === 'true' ? edit_buttons : post_maker_buttons;
		const not_post_maker_buttons = <button onClick={this.subscribe}>Subscribe</button>;
		const not_edit = (
			<div>
				<h6>{this.state.title}</h6>
				<p>{this.state.contents}</p>
				<p>{this.state.uploader_id}</p>
				<div>
					<p>{this.state.latitude}</p>
					<p>{this.state.longitude}</p>
				</div>
				<div>
					<p>{this.state.start_date}</p>
					<p>{this.state.end_date}</p>
				</div>
			</div>
		);
		return (
			<div>
				{this.state.editable === 'false' ? not_edit : edit_post}
				{this.isCurrentUserMaker() ? maker_buttons : not_post_maker_buttons}
			</div>
		);
	}
}

class PostFeed extends Component {
	state = {
		posts: []
	};
	componentDidMount() {
		const user_token = localStorage.usertoken;
		let decoded = '';
		if (user_token) {
			decoded = jwt_decode(user_token);
			const user_posts_id = decoded.identity.id;
			axios.defaults.withCredentials = true;
			axios
				.get(flask_server_adress + '/post/posts/' + user_posts_id)
				.then((response) => {
					this.setState({ posts: response.data });
				})
				.catch((err) => {
					alert(err);
					console.log(err);
				});
		}
	}
	render() {
		let posts = [];
		let PostRouter = withRouter(Post);
		for (const post of this.state.posts) {
			posts.push(
				<PostRouter
					key={post.id}
					post_id={post.id}
					uploader_id={post.user_id}
					contents={post.body}
					title={post.title}
					latitude={post.latitude}
					longitude={post.longitude}
					start_date={post.start_date}
					end_date={post.end_date}
				/>
			);
		}
		return <div>{posts}</div>;
	}
}

class Postpage extends Component {
	constructor() {
		super();
		this.onSubmit = this.onSubmit.bind(this);
	}
	onSubmit(e) {
		e.preventDefault();
		this.props.history.push('/Post');
	}
	render() {
		const PostFeedRouter = withRouter(PostFeed);
		const NewPostRouter = withRouter(NewPost);
		return (
			<div className="postfeed">
				<Row>
					<Col>
						<h3>Create New Post</h3>
						<NewPostRouter />
					</Col>
					<Col>
						<PostFeedRouter />
					</Col>
				</Row>
			</div>
		);
	}
}

export { Postpage, NewPost };
