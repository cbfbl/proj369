import React, { Component } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

const flask_server_adress = 'http://127.0.0.1:5000';

class Profile extends Component {
	constructor(){
		super();
		this.deleteUser=this.deleteUser.bind(this)
	}
	state = {
		username: '',
		email: '',
		firstname: '',
		lastname: ''
	};

	componentDidMount() {
		const token = localStorage.usertoken;
		let decoded = '';
		if (token) {
			decoded = jwt_decode(token);
			this.setState({
				current_email: decoded.identity.id
			});
		}
		axios
			.get('http://127.0.0.1:5000/user/' + decoded.identity.id)
			.then((response) => {
				this.setState({
					username: response.data.username,
					email: response.data.email,
					first_name: response.data.first_name,
					last_name: response.data.last_name
				});
			})
			.catch((err) => {
				console.log(err);
			});
	}
	deleteUser(){
		const prom_text = prompt("Write DELETE in order to delete your account")
		if (prom_text==="DELETE"){
			console.log("Delete")
			const token = localStorage.usertoken;
			let decoded = '';
			if (token) {
				decoded = jwt_decode(token);
				const user_id = decoded.identity.id
				axios.defaults.withCredentials = true;
				axios.post(flask_server_adress+"/user/delete",{
					current_user_id : user_id
				}).then(response => {
					if (response.data==="deleted"){
						localStorage.removeItem('usertoken');
						this.props.history.push('/')
					}
				}).catch(err => {
					console.log(err);
				})
			}

			return;
		}
		console.log("No delete")
	}
	editProfile(){
		axios.defaults.withCredentials = true;
		axios.post(flask_server_adress+"/user/edit", {
			username : this.state.username,
			first_name : this.state.firstname,
			last_name : this.state.last_name
		}).then(this.componentDidMount()).catch(err => {
			console.log(err);
		})
	}
	render() {
		return (
			<div className="container">
				<div className="jumbotron mt-1">
					<p className="m-md-4" align="center" />
					<div>
						<p>Username: {this.state.username}</p>
						<p>Email: {this.state.email}</p>
						<p>Firstname: {this.state.first_name} </p>
						<p>Lastname: {this.state.last_name}</p>
						<button onClick={this.deleteUser}>Delete account</button>
					</div>
				</div>
			</div>
		);
	}

}

export default Profile;
