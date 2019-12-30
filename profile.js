import React, {Component} from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";

class Profile extends Component {
  state = {
    username: "",
    email: "",
    firstname: "",
    lastname: "",
    birthday: ""
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
          email: response.data.email,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          birth_date: response.data.birth_date
        });
        console.log(response);
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
            <p>Username: {this.state.username}</p>
            <p>Email: {this.state.email}</p>
            <p>Firstname: {this.state.first_name} </p>
            <p>Lastname:  {this.state.last_name}</p>
            <p>Birthday: {this.state.birth_date} </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Profile;