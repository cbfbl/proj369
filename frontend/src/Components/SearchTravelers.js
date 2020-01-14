import React ,{createRef, Component} from 'react'
// import ReactDOM , { render } from 'react-dom';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import Search from "react-leaflet-search";
import axios from "axios";
import Button from 'react-bootstrap/Button';


// var greenIcon = L.icon({
//   iconUrl: 'leaf-green.png',
//   shadowUrl: 'leaf-shadow.png',

//   iconSize:     [38, 95], // size of the icon
//   shadowSize:   [50, 64], // size of the shadow
//   iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
//   shadowAnchor: [4, 62],  // the same for the shadow
//   popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
// });

class SearchTravelers extends Component { 
  state = {
        locations: [],
        filteredLocations: [],
        zoom: 10,
        radius: 0,
        start_date: '',
        end_date: '',
        point: [[35.6892, 51.3890]],
      };
      constructor() {
        super()
        } 
        //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
      //:::                                                                         :::
      //:::  This routine calculates the distance between two points (given the     :::
      //:::  latitude/longitude of those points). It is being used to calculate     :::
      //:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
      //:::                                                                         :::
      //:::  Definitions:                                                           :::
      //:::    South latitudes are negative, east longitudes are positive           :::
      //:::                                                                         :::
      //:::  Passed to function:                                                    :::
      //:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
      //:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
      //:::    unit = the unit you desire for results                               :::
      //:::           where: 'M' is statute miles (default)                         :::
      //:::                  'K' is kilometers                                      :::
      //:::                  'N' is nautical miles                                  :::
      //:::                                                                         :::
      //:::  Worldwide cities and other features databases with latitude longitude  :::
      //:::  are available at https://www.geodatasource.com                         :::
      //:::                                                                         :::
      //:::  For enquiries, please contact sales@geodatasource.com                  :::
      //:::                                                                         :::
      //:::  Official Web site: https://www.geodatasource.com                       :::
      //:::                                                                         :::
      //:::               GeoDataSource.com (C) All Rights Reserved 2018            :::
      //:::                                                                         :::
      //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    distance(lat1, lon1, lat2, lon2) {
      if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
      }
      else {
        var radlat1 = Math.PI * lat1/180;
        var radlat2 = Math.PI * lat2/180;
        var theta = lon1-lon2;
        var radtheta = Math.PI * theta/180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
          dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180/Math.PI;
        dist = dist * 60 * 1.1515;
        // console.log(`dist: ${dist}`);
        return dist;
      }
    } 

    getDistance(origin, destination) {
      // Return distance in km
      let o1 = origin[0].lat*1.0;
      let o2 = origin[0].lng*1.0;
      let d1 = destination[0]*1.0;
      let d2 = destination[1]*1.0;

      let lat1 = this.toRadian(o1);
      let lon1 = this.toRadian(o2);
      let lat2 = this.toRadian(d1);
      let lon2 = this.toRadian(d2);
  
      var deltaLat = lat2-lat1;
      var deltaLon = lon2-lon1;

  
      var a = Math.pow(Math.sin(deltaLat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon/2), 2);
      var c = 2 * Math.asin(Math.sqrt(a));
      var EARTH_RADIUS = 6371;
      return c * EARTH_RADIUS;
  }

  toRadian(degree) {
    return degree*Math.PI/180;
  }

    // mapRef = React.createRef();

    // handleClick = (e) => {
    //   console.log(e.latlng)
    //   this.mapRef.current.addTo(e.latlang)
    //   const map = this.mapRef.current
    //   if (map != null) {
    //     map.leafletElement.locate()
    //   }
    // }
    showPostsInArea = (e) => {
      // console.log(this)
      var point = this.state.point;
      var radius = this.state.radius;
      var filteredLocations = this.state.locations;
      filteredLocations.forEach(loc => console.log(this.getDistance(point, loc)));
      filteredLocations = filteredLocations.filter(loc => this.getDistance(point, loc) <= radius);
      // console.log(filteredLocations)
      this.setState({filteredLocations});
    }


    addMarker = (e) => {
      let point = this.state.point;
      // console.log(point)
        point.pop();
        point.push(e.latlng);
        this.setState(
          {point});
        // console.log(this.state);
    }

   componentDidMount() {
    axios.get("http://127.0.0.1:5000/locations")
      .then(response => {
        this.setState({
          locations: response.data,
          filteredLocations: response.data
        });
      })
      .catch(err => {
        console.error(err);
      });
  } 
  
  render() {
    const position = [32.776520,35.022610];
    return (
      <div className="map-container">
        <input type="text" placeholder="Enter Radius" onChange={(event) => {
							this.setState({ radius: event.target.value });
						}}></input>
        <div>
					<label>start date : </label>
					<input
						type="date"
						onChange={(event) => {
							this.setState({ start_date: event.target.value });
						}}
					/>
					<label>end date : </label>
					<input
						type="date"
						onChange={(event) => {
							this.setState({ end_date: event.target.value });
						}}
					/>
				</div>
        <Button variant="success" onClick={this.showPostsInArea}> 
					Search Posts
				</Button>
      <div className="map">
        <Map 
        center={position} 
        zoom={this.state.zoom} 
        onClick={this.addMarker}
        // onClick={this.handleClick}
        // ref={this.mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
            />
            <Search
            closeResultsOnClick={true}
            />
            {this.state.point.map((position) =>(
              <>
              <Marker position={position}/>
              </>
            ))}

          {this.state.filteredLocations.map(loc =>(
            <>
              <Marker  position={[loc[0],loc[1]]}/>
            </>
          ))}
        </Map>
      </div>
      </div>
    );
  }
}


export default SearchTravelers;