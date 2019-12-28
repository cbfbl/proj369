import React, {Component} from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";

class Profile extends Component {
  state = {
    username: "",
    email: ""
  };

  componentDidMount() {
    const token = localStorage.usertoken;
    let decoded = "";
    if (token) {
      decoded = jwt_decode(token);
      this.setState({
        current_email: decoded.identity.id
      });
    }
    axios
      .get("http://127.0.0.1:5000/user/" + decoded.identity.id)
      .then(response => {
        this.setState({
          username: response.data.username,
          email: response.data.email
        });
      })
      .catch(err => {
        console.log(err);
      });
  }
  render() {
    return (
      <div className="container">
        <div className="jumbotron mt-1">
          <p className="m-md-4" align="center"></p>
          <div className="col-md-6 mt-1 mx-auto">
            {this.state.username},{this.state.email}
          </div>
        </div>
      </div>
    );
  }
}

export default Profile;
