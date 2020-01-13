import React, {Component} from "react";
import {BrowserRouter as Router, Route} from "react-router-dom";
import "./App.css";

import Login from "./Components/Login";
import Navbar from "./Components/Navbar";
import Register from "./Components/Register";
import Profile from "./Components/profile";
import User from './Components/User';
import { NewPost ,Postpage} from './Components/Post';
import SearchTravelers from "./Components/SearchTravelers";



import {Redirect} from "react-router-dom";

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
          <div className="banner">
            <h1>Welcome To Travelers</h1>
          </div>
          <div className="search">
            <Navbar />
          </div> 
          
            <Route exact path="/" />
              <div className="container">
              <div className="login">
                <Route exact path="/login" render={props =>
                    !isLoggedIn() ? (
                      <Login {...props} /> ) : (<Redirect to="/profile" />
                    )
                  }
                />
                </div>
                <div className="Register">
                <Route exact path="/register" render={props =>
                    !isLoggedIn() ? (
                      <Register {...props} />) : (<Redirect to="/profile" />
                    )
                  }
                />
                </div>
                <Route exact path="/profile" render={props =>
                    isLoggedIn() ? 
                    <Profile {...props} /> : <Redirect to="/login" />
                  }
                />
                <Route path="/:user(user/[a-zA-z]+)" render={(props) => <User {...props} />} />
                <Route exact path="/SearchTravelers" render={(props) => <SearchTravelers {...props} />}/>
                <Route exact path="/Post" render={(props) => <Postpage {...props} />}/>
              </div>
            </div>
          {/* <footer>hellooooooooooooooooooooooooooooo</footer> */}
      </Router>
    );
  }
}

export default App;
