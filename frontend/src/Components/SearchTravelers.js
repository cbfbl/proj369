import React ,{Component} from 'react'
// import ReactDOM , { render } from 'react-dom';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import axios from "axios";

class SearchTravelers extends Component {
    state = {
        locations: [],
        zoom: 13
      };
    constructor() {
    super()
    }
   componentDidMount() {
    axios.get("http://127.0.0.1:5000/locations")
      .then(response => {
        this.setState({
          locations: response.data,
        });
      })
      .catch(err => {
        console.error(err);
      });
  } 
  
  render() {
    const position = [32.776520,35.022610];
    return (
      <Map center={position} zoom={this.state.zoom}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
        />
        {this.state.locations.map(loc =>(
            <>
            <Marker position={[loc[0],loc[1]]}/>
            <Popup> Location:{[loc[0],loc[1]]}</Popup>
            </>
        ))}
      </Map>
    );
  }
}


export default SearchTravelers;