import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import jwt_decode from 'jwt-decode';

export const getUser = (user) => {
	axios.defaults.withCredentials = true;
	return axios
		.get('http://127.0.0.1:5000/' + user)
		.then((response1) => {
			return axios
				.get('http://127.0.0.1:5000/user/' + response1.data.id)
				.then((response2) => {
					return response2.data;
				})
				.catch((err) => {
					console.log(err);
				});
		})
		.catch((err) => {
			console.log(err);
		});
};

class User extends Component {
	state = {
		user: {}
	};
	followUser = () => {
		const user_token = localStorage.usertoken;
		let decoded = '';
		if (user_token) {
			decoded = jwt_decode(user_token);
			const follower_id = decoded.identity.id;
			const followed_id = this.state.user.id;
			if (follower_id === followed_id) {
				return;
			}
			axios.post('http://127.0.0.1:5000/follow/' + followed_id).then(() => {}).catch((err) => {
				console.log(err);
			});
		}
	};
	unfollowUser = () => {
		const user_token = localStorage.usertoken;
		let decoded = '';
		if (user_token) {
			decoded = jwt_decode(user_token);
			const follower_id = decoded.identity.id;
			const followed_id = this.state.user.id;
			if (follower_id === followed_id) {
				return;
			}
			axios.post('http://127.0.0.1:5000/unfollow/' + followed_id).then(() => {}).catch((err) => {
				console.log(err);
			});
		}
	};
	componentDidMount() {
		getUser(this.props.match.params.user)
			.then((res) => {
				this.setState({
					user: res
				});
			})
			.catch((err) => {
				console.log(err);
			});
	}
	componentDidUpdate() {
		if (this.props.match.params.user.split('/')[1] !== this.state.user.username) {
			this.componentDidMount();
		}
	}
	render() {
		let user_info = [];
		for (const key of Object.keys(this.state.user)) {
			user_info.push(
				<li key={key}>
					{key} : {this.state.user[key]}
				</li>
			);
		}
		return (
			<div>
				user info : <ul>{user_info}</ul>
				<Button variant="primary" onClick={() => this.followUser()}>
					Follow this user
				</Button>
				<Button variant="primary" onClick={() => this.unfollowUser()}>
					Unfollow this user
				</Button>
			</div>
		);
	}
}

export default User;
