import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Login from './Components/Login';
import Navbar from './Components/Navbar';
import Register from './Components/Register';
import Profile from './Components/Profile';
import User from './Components/User';
import Postpage from './Components/Post';

import { Redirect } from 'react-router-dom';

function isLoggedIn() {
	if (localStorage.usertoken) {
		return true;
	}
	return false;
}

class App extends Component {
	render() {
		return (
			<Router>
				<div className="App">
					<Navbar />
					<Postpage />
					<Route exact path="/" />
					<div className="container">
						<Route
							exact
							path="/login"
							render={(props) => (!isLoggedIn() ? <Login {...props} /> : <Redirect to="/profile" />)}
						/>
						<Route
							exact
							path="/register"
							render={(props) => (!isLoggedIn() ? <Register {...props} /> : <Redirect to="/profile" />)}
						/>
						<Route
							exact
							path="/profile"
							render={(props) => (isLoggedIn() ? <Profile {...props} /> : <Redirect to="/login" />)}
						/>
						<Route path="/:user(user/[a-zA-z]+)" render={(props) => <User {...props} />} />
					</div>
				</div>
			</Router>
		);
	}
}

export default App;
