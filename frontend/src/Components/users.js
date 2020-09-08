import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

class Users extends Component {
	state = {
		users: []
	};

	componentDidMount() {
		axios
			.get('http://127.0.0.1:5000/users')
			.then((response) => {
				this.setState({
					users: response.data
				});
			})
			.catch((err) => {
				console.log(err);
			});
	}

	componentDidUpdate() {
		axios
			.get('http://127.0.0.1:5000/users')
			.then((reponse) => {
				if (this.state.users === reponse.data) {
					this.componentDidMount();
				}
			})
			.catch((err) => {
				console.log(err);
			});
	}
	render() {
		let users_list = [];
		for (const user of this.state.users) {
			const username = user.username;
			const url = '/user/' + username;
			users_list.push(
				<li key={user.username}>
					<Link to={url}>{user.username}</Link>
				</li>
			);
		}
		return (
			<div>
				users:
				<ul>{users_list}</ul>
			</div>
		);
	}
}

export default Users;
