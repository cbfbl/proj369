import React, { Component } from 'react';
import axios from 'axios';
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
		user: {},
		image: 'https://i.pinimg.com/236x/cb/33/49/cb3349b86ca661ca61ae9a36d88d70d4--ash-pokemon-pokemon-games.jpg'
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
					user: res,
					image: res.image
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
			if (key !== 'image') {
				user_info.push(
					<li key={key}>
						{key} : {this.state.user[key]}
					</li>
				);
			}
		}
		//const pic_path = require('../images/default.png');

		//const check = this.state.image;
		//console.log(check);
		//const second_quire = require(check);

		return (
			<div className="User-properties">
				<br />
				picture :
				<img src={this.state.image} alt="No profile picture" width="128" height="128" />
				<br />
				user info : <ul>{user_info}</ul>
				<Button variant="success" onClick={() => this.followUser()}>
					Follow this user
				</Button>
				<Button variant="success" onClick={() => this.unfollowUser()}>
					Unfollow this user
				</Button>
			</div>
		);
	}
}

export default User;
