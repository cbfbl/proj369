import React, { Component } from 'react';
import { flask_server_adress } from '../utils';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

class Notification extends Component {
	constructor() {
		super();
		this.state = {
			updated_posts: []
		};
	}
	componentDidMount() {
		const user_token = localStorage.usertoken;
		let decoded = '';
		if (user_token) {
			decoded = jwt_decode(user_token);
			const logged_user_id = decoded.identity.id;

			axios.defaults.withCredentials = true;
			axios
				.get(flask_server_adress + '/notifications/' + logged_user_id)
				.then((response) => {
					console.log(response);
					if (response.data.id_array) {
						console.log(response);
						this.setState({
							updated_posts: response.data.id_array
						});
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}
	render() {
		const pre_notify = 'post with id : ';
		let notify_div = [];
		for (const post of this.state.updated_posts) {
			const notify = pre_notify + post + 'was edited';
			notify_div.push('<div>' + notify + '</div>');
		}
		return <div>{notify_div}</div>;
	}
}

export default Notification;
