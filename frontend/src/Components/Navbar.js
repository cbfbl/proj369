import React, {Component} from "react";
import {Link, withRouter} from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";
import "./Navbar.css"
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Autocomplete from "./AutoComplete";
// import Post from "./Post";
// import SearchTravelers from "./SearchTravelers";
import Users from "./users";


class Navbar extends Component {
  state = {
    current_user: 0,
    username: "",
    search_msg: "Search for a user"
  };
  get_user() {
    this.setState({search_msg: "Search for a user"});
    axios.defaults.withCredentials = true;
    axios
      .get("http://127.0.0.1:5000/user/" + this.state.username)
      .then(response => {
        this.setState({username: ""});
        this.props.history.push(`/users/` + response.data.id);
      })
      .catch(err => {
        this.setState({username: "", search_msg: "User not found"});
      });
  }

  onChange(e) {
    this.setState({username: e.target.value, search_msg: "Search for a user"});
  }

  logOut(e) {
    e.preventDefault();
    axios.defaults.withCredentials = true;
    axios
      .get("http://127.0.0.1:5000/logout")
      .then(response => {
        localStorage.removeItem("usertoken");
        this.props.history.push(`/`);
      })
      .catch(err => {
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
    const home = (
      <Link to="/" className="nav-link" >
      Home
    </Link>
    );

    const register = (
      <Link to="/register" className="nav-link">
              Register
      </Link>
    );
    const login = (
      <Link to="/login" className="nav-link">
             Login
      </Link>
    );
    const userLink= (
    <> 
      <Col>
        <Link to="/" className="nav-link" onClick={this.logOut.bind(this)}>
          Logout
        </Link>
      </Col>
      <Col>
        <Link to="/profile" className="nav-link" >
          Profile
        </Link>
      </Col>
      <Col>
      <Link to="/SearchTravelers" className="nav-link">
      Post-Search</Link>
      </Col>
      <Col>
      <Link to="/Post" className="nav-link">
      Post-Feed</Link>
      </Col>
      <Col><Autocomplete/></Col>
    </>
    );
    const loginRegLink = (
      <>
      <Col>{login}</Col>
      <Col>{register}</Col>
      </>
		);
    return (
      <>
        <Row>
          <Col>{home}</Col>
          {localStorage.usertoken ? userLink : loginRegLink}
        </Row>
        <div>
          <Users/>
        </div>
      </>
    );
  }
}

export default withRouter(Navbar);
