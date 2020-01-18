import React, { Component } from 'react';
import { flask_server_adress } from '../utils';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

class Alert extends Component {
	constructor() {
		super();
		this.state = {
			post_id: ''
		};
	}
	componentDidMount() {
		this.setState({
			post_id: this.props.post_id
		});
	}
	render() {
		return <div>post with id :{this.state.post_id} was edited</div>;
	}
}

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
		let notify_div = [];
		for (const post of this.state.updated_posts) {
			notify_div.push(<Alert post_id={post} />);
		}
		return <div>{notify_div}</div>;
	}
}

export default Notification;
