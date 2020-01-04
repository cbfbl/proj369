import React, { Component } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const flask_server_adress = 'http://127.0.0.1:5000';

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
			<form onSubmit={this.onSubmit}>
				<div>
					<label>Title : </label>
					<input
						type="text"
						onChange={(event) => {
							this.setState({ title: event.target.value });
						}}
					/>
					<label>Message : </label>
					<input
						type="textarea"
						onChange={(event) => {
							this.setState({ body: event.target.value });
						}}
					/>
				</div>
				<div>
					<label>start date : </label>
					<input
						type="date"
						onChange={(event) => {
							this.setState({ start_date: event.target.value });
						}}
					/>
					<label>end date : </label>
					<input
						type="date"
						onChange={(event) => {
							this.setState({ end_date: event.target.value });
						}}
					/>
				</div>
				<div>
					<label>latitude : </label>
					<input
						type="number"
						onChange={(event) => {
							this.setState({ latitude: event.target.value });
						}}
					/>
					<label>longitude : </label>
					<input
						type="number"
						onChange={(event) => {
							this.setState({ longitude: event.target.value });
						}}
					/>
				</div>
				<div>
					<input type="submit" value="Submit" />
				</div>
			</form>
		);
	}
	onSubmit(e) {
		e.preventDefault();
		axios.defaults.withCredentials = true;
		axios
			.post(flask_server_adress + '/post/new', {
				title: this.state.title,
				body: this.state.body,
				start_date: this.state.start_date,
				end_date: this.state.end_date,
				latitude: this.state.latitude,
				longitude: this.state.longitude
			})
			.catch((err) => {
				console.log(err);
			});
	}
}

class Post extends Component {
	constructor() {
		super();
		this.subscribe = this.subscribe.bind(this);
	}
	state = {
		uploader_id: '',
		contents: '',
		is_current_user_subscribed: false,
		title: '',
		latitude: '',
		longitude: '',
		start_date: '',
		end_date: ''
	};
	render() {
		return (
			<div>
				<h6>{this.state.title}</h6>
				<p>{this.state.contents}</p>
				<div>
					<p>{this.state.latitude}</p>
					<p>{this.state.longitude}</p>
				</div>
				<div>
					<p>{this.state.start_date}</p>
					<p>{this.state.end_date}</p>
				</div>
				<div>
					<button onClick={this.subscribe}>Subscribe</button>
				</div>
			</div>
		);
	}
	componentDidMount() {
		this.setState({
			uploader_id: 0,
			contents: this.props.contents,
			title: this.props.title,
			latitude: this.props.latitude,
			longitude: this.props.longitude,
			start_date: this.props.start_date,
			end_date: this.props.end_date
		});
	}
	subscribe() {
		console.log(this.state.title);
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
			axios.get(flask_server_adress + '/post/' + user_posts_id).then((response) => {
				this.setState({ posts: response.data });
			});
		}
	}
	render() {
		let posts = [];
		for (const post of this.state.posts) {
			posts.push(
				<Post
					key={post.id}
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
		axios.post(flask_server_adress + '/post/new', {});
	}

	render() {
		return (
			<div>
				<NewPost onSubmit={this.onSubmit} />
				<PostFeed />
			</div>
		);
	}
}

export default Postpage;
