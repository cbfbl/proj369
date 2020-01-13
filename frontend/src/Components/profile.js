import React, { Component } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const flask_server_adress = 'http://127.0.0.1:5000';

class Profile extends Component {
	constructor() {
		super();
		this.deleteUser = this.deleteUser.bind(this);
		this.editProfile = this.editProfile.bind(this);
		this.changeFirstName = this.changeFirstName.bind(this);
		this.changeLastName = this.changeLastName.bind(this);
		this.toggleEditable = this.toggleEditable.bind(this);
	}
	state = {
		username: '',
		email: '',
		firstname: '',
		lastname: '',
		editable: 'false'
	};

	componentDidMount() {
		const token = localStorage.usertoken;
		let decoded = '';
		if (token) {
			decoded = jwt_decode(token);
			this.setState({
				current_email: decoded.identity.id
			});
		} else {
			this.setState({
				username: '',
				email: '',
				firstname: '',
				lastname: '',
				editable: 'false'
			});
		}
		axios
			.get('http://127.0.0.1:5000/user/' + decoded.identity.id)
			.then((response) => {
				this.setState({
					username: response.data.username,
					email: response.data.email,
					firstname: response.data.first_name,
					lastname: response.data.last_name,
					editable: 'false'
				});
			})
			.catch((err) => {
				console.log(err);
			});
	}
	componentDidUpdate(prevProps) {
		if (prevProps.location.pathname !== this.props.location.pathname) {
			this.componentDidMount();
		}
	}
	deleteUser() {
		const prom_text = prompt('Write DELETE in order to delete your account');
		if (prom_text === 'DELETE') {
			console.log('Delete');
			const token = localStorage.usertoken;
			let decoded = '';
			if (token) {
				decoded = jwt_decode(token);
				const user_id = decoded.identity.id;
				axios.defaults.withCredentials = true;
				axios
					.post(flask_server_adress + '/user/delete', {
						current_user_id: user_id
					})
					.then((response) => {
						if (response.data === 'deleted') {
							localStorage.removeItem('usertoken');
							this.props.history.push('/');
						}
					})
					.catch((err) => {
						console.log(err);
					});
			}

			return;
		}
		console.log('No delete');
	}
	editProfile() {
		const token = localStorage.usertoken;
		let decoded = '';
		if (!token) {
			return;
		}
		decoded = jwt_decode(token);
		const user_id = decoded.identity.id;
		axios.defaults.withCredentials = true;
		axios
			.put(flask_server_adress + '/user/edit', {
				current_user_id: user_id,
				username: this.state.username,
				first_name: this.state.firstname,
				last_name: this.state.lastname
			})
			.then(this.componentDidMount())
			.catch((err) => {
				console.log(err);
			});
	}
	changeFirstName(ev) {
		//ev.preventDefault();
		console.log(ev);
		this.setState({
			firstname: ev.target.value
		});
	}
	changeLastName(ev) {
		//ev.preventDefault();
		console.log(ev);
		this.setState({
			lastname: ev.target.value
		});
	}
	toggleEditable() {
		this.setState({
			editable: this.state.editable === 'false' ? 'true' : 'false'
		});
	}
	render() {
		const editting = (
			<div>
				<button onClick={this.editProfile}>Submit change</button>
				<button onClick={this.toggleEditable}>Cancel changes</button>
			</div>
		);
		const not_editting = (
			<div>
				<button onClick={this.deleteUser}>Delete account</button>
				<button onClick={this.toggleEditable}>Edit Info</button>
			</div>
		);
		console.log(this.state);
		return (
			<div style={{ color: 'black' }}>
				<label>Username: </label>
				{this.state.username}
				<br />
				<label>Email:</label>
				{this.state.email}
				<br />
				<label>First name:</label>
				<p style={{ display: 'inline' }} contentEditable={this.state.editable}>
					{this.state.firstname}
				</p>
				<br />
				<label>Last name:</label>
				<p style={{ display: 'inline' }} contentEditable={this.state.editable}>
					{this.state.lastname}
				</p>

				{this.state.editable === 'true' ? editting : not_editting}
			</div>
		);
	}
}

export default Profile;
