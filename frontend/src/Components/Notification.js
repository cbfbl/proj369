import React, { Component } from 'react';
import { flask_server_adress } from '../utils';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { withRouter } from 'react-router-dom';

class Alert extends Component {
	constructor() {
		super();
		this.removeAlert = this.removeAlert.bind(this);
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
		return (
			<div>
				post with id :{this.state.post_id} was edited
				<input type="submit" onClick={this.removeAlert} value="Clear notification" />
			</div>
		);
	}
	removeAlert() {
		const user_token = localStorage.usertoken;
		let decoded = '';
		if (user_token) {
			decoded = jwt_decode(user_token);
			const logged_user_id = decoded.identity.id;
			axios.defaults.withCredentials = true;
			axios
				.post(flask_server_adress + '/notification/delete', {
					user_id: logged_user_id,
					post_id: this.state.post_id
				})
				.then((response) => {
					if (response.data === 'deleted') {
						this.props.history.push('/');
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}
}

class Notification extends Component {
	constructor() {
		super();
		this.removeAlert = this.removeAlert.bind(this);
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
			const tmp = (
				<div>
					post with id :{post} was edited
					<input type="submit" name={post} onClick={this.removeAlert} value="Clear notification" />
				</div>
			);
			notify_div.push(tmp);
		}
		return <div>{notify_div}</div>;
	}

	removeAlert(ev) {
		const user_token = localStorage.usertoken;
		let decoded = '';
		if (user_token) {
			decoded = jwt_decode(user_token);
			const logged_user_id = decoded.identity.id;
			axios.defaults.withCredentials = true;
			axios
				.post(flask_server_adress + '/notification/delete', {
					user_id: logged_user_id,
					post_id: ev.target.name
				})
				.then((response) => {
					if (response.data === 'deleted') {
						this.componentDidMount();
					}
				})
				.catch((err) => {
					console.log(err);
				});
		}
	}
}

export default Notification;
