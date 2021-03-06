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
		this.changeSmart = this.changeSmart.bind(this);
	}
	state = {
		username: '',
		email: '',
		firstname: '',
		lastname: '',
		birthdate: '',
		gender: '',
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
				gender: '',
				image: '',
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
					birthdate: response.data.birthdate,
					gender: response.data.gender,
					image: '',
					editable: 'false'
				});
			})
			.catch((err) => {
				alert(err);
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
						alert(err);
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
			.put(
				flask_server_adress + '/user/edit',
				{
					current_user_id: user_id,
					username: this.state.username,
					first_name: this.state.firstname,
					last_name: this.state.lastname,
					birthdate: this.state.birthdate,
					gender: this.state.gender
				},
				{ crossDomain: true }
			)
			.then((response) => {
				if (response.data === 'edited') {
					this.setState({
						editable: 'false'
					});
					this.componentDidMount();
				}
			})
			.catch((err) => {
				alert(err);
				console.log(err);
			});
	}
	changeFirstName(ev) {
		ev.preventDefault();
		this.setState({
			firstname: ev.target.value
		});
	}
	changeLastName(ev) {
		ev.preventDefault();
		this.setState({
			lastname: ev.target.value
		});
	}
	toggleEditable() {
		this.setState({
			editable: this.state.editable === 'false' ? 'true' : 'false'
		});
		if (this.state.editable === 'true') {
			this.componentDidMount();
		}
	}
	changeSmart(ev) {
		const key_field = ev.target.name;
		if (key_field === 'birthdate') {
			this.setState({
				birthdate: ev.target.value
			});
		} else if (key_field === 'gender') {
			this.setState({
				gender: ev.target.value
			});
		}
	}
	render() {
		const editting = (
			<div>
				<button className="btn-success" onClick={this.editProfile}>
					Submit change
				</button>
				<button className="btn-success" onClick={this.toggleEditable}>
					Cancel changes
				</button>
			</div>
		);
		const not_editting = (
			<div>
				<button className="btn-success" onClick={this.deleteUser}>
					Delete account
				</button>
				<button className="btn-success" onClick={this.toggleEditable}>
					Edit Info
				</button>
			</div>
		);
		const ret_editable = (
			<div>
				<label>First name:</label>
				<input type="text" value={this.state.firstname} onChange={this.changeFirstName} />
				<br />
				<label>Last name:</label>
				<input type="text" value={this.state.lastname} onChange={this.changeLastName} />
				<br />
				<label>Birthday:</label>
				<input type="date" name="birthdate" value={this.state.birthdate} onChange={this.changeSmart} />
				<br />
				<label>Gender</label>
				<br />
				<input type="radio" name="gender" value="Male" onChange={this.changeSmart} /> Male<br />
				<input type="radio" name="gender" value="Female" onChange={this.changeSmart} /> Female<br />
			</div>
		);
		const ret = (
			<div>
				<label>First name:</label>
				{this.state.firstname}
				<br />
				<label>Last name:</label>
				{this.state.lastname}
				<br />
				<label>Birthday:</label>
				{this.state.birthdate}
				<br />
				<label>Gender:</label>
				{this.state.gender}
			</div>
		);
		return (
			<div style={{ color: this.state.editable === 'true' ? 'black' : 'white' }}>
				<label>Username: </label>
				{this.state.username}
				<br />
				<label>Email:</label>
				{this.state.email}
				<br />
				{this.state.editable === 'true' ? ret_editable : ret}
				{this.state.editable === 'true' ? editting : not_editting}
			</div>
		);
	}
}

export default Profile;
