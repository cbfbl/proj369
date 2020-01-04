import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import Autosuggest from 'react-bootstrap-autosuggest';
import Form from 'react-bootstrap/Form';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import Users from './users';

class Navbar extends Component {
	state = {
		current_user: 0,
		username: '',
		search_msg: 'Search for a user'
	};
	get_user() {
		this.setState({ search_msg: 'Search for a user' });
		axios.defaults.withCredentials = true;
		axios
			.get('http://127.0.0.1:5000/user/' + this.state.username)
			.then((response) => {
				this.setState({ username: '' });
				this.props.history.push(`/users/` + response.data.id);
			})
			.catch((err) => {
				this.setState({ username: '', search_msg: 'User not found' });
			});
	}

	onChange(e) {
		this.setState({ username: e.target.value, search_msg: 'Search for a user' });
	}

	logOut(e) {
		e.preventDefault();
		axios.defaults.withCredentials = true;
		axios
			.get('http://127.0.0.1:5000/logout')
			.then((response) => {
				localStorage.removeItem('usertoken');
				this.props.history.push(`/`);
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
	componentDidMount() {
		const token = localStorage.usertoken;
		if (token) {
			const decoded = jwt_decode(token);
			this.setState({
				current_user: decoded.identity.id
			});
		}
	}

	render() {
		const loginRegLink = (
			<ul>
				<li>
					<Link to="/login">Login</Link>
				</li>
				<li>
					<Link to="/register">Register</Link>
				</li>
			</ul>
		);

		const userLink = (
			<ul>
				<li>
					<a href="" onClick={this.logOut.bind(this)}>
						Logout
					</a>
				</li>
				<li>
					<a href="/profile">Profile</a>
				</li>
			</ul>
		);

		return (
			<div>
				<nav>
					<div>
						<ul>
							<li>
								<Link to="/">Home</Link>
							</li>
							<li>
								<Users />
							</li>
						</ul>
						{localStorage.usertoken ? userLink : loginRegLink}
					</div>
				</nav>
			</div>
		);
	}
}

export default withRouter(Navbar);
