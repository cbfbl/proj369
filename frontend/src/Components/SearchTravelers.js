import React ,{createRef, Component} from 'react'
// import ReactDOM , { render } from 'react-dom';
import { Map, Marker, Popup, TileLayer, MapControl } from 'react-leaflet';
import ReactLeafletSearch from "react-leaflet-search";
import Search from "react-leaflet-search";
import axios from "axios";
import Button from 'react-bootstrap/Button';
import "./SearchTravelers.css"

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
        point: [[19.4100819, -99.1630388]],
      };
      constructor() {
        super()
        } 
      

    getDistance(origin, destination) {
      console.log('in get distance')
      console.log(origin);
      let o1 = origin[0]*1.0;
      let o2 = origin[1]*1.0;
      // Return distance in km
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

  leafletSearchRef = createRef();
  mapRef = createRef();

    showPostsInArea = (e) => {
      console.log('in show posts')
      // console.log(this.leafletSearchRef.current.SearchInfo.latLng);
      // console.log(this.leafletSearchRef.current.SearchInfo);
      var point;
      if (this.leafletSearchRef.current){
        point =  [this.state.point[0].lat,this.state.point[0].lng];
      }else {
        point=[this.leafletSearchRef.current.SearchInfo.latLng.lat,this.leafletSearchRef.current.SearchInfo.latLng.lng];
        this.leafletSearchRef.current.SearchInfo=null;
      }
      console.log(point);
      
      var radius = this.state.radius;
      var startD = this.state.start_date;
      var endD = this.state.end_date;
      var filteredLocations = this.state.locations;
      // filteredLocations.forEach(loc => console.log(loc[2]));
      filteredLocations = filteredLocations.filter(loc => ((this.getDistance(point, loc) <= radius) && (loc[2]>=startD && loc[3]<=endD)));
      this.setState({filteredLocations});
    }


    // addMarker = (e) => {
      
    //   let map = this.mapRef.current;
    //   console.log(map.leafletElement)
    //   // Marker.([50.5, 30.5]).addTo(this.mapRef.current);
    //   let point;
    //   console.log(reactLeafletSearch.SearchInfo);
    //   if (reactLeafletSearch.SearchInfo){
    //     let ee = reactLeafletSearch.SearchInfo.latLng;
    //     console.log(ee)
    //     point = reactLeafletSearch.SearchInfo.latLng;
    //     reactLeafletSearch.SearchInfo = null;
    //   }
    //   else {
    //     point = e.latlng;
    //   }
    //   // console.log(e.target)
    //   this.setState(
    //     {point});

    //     // console.log(this.refs.search.leafletElement);
    //     // const map = this.mapRef.current
    //     // if (map != null) {
    //       // console.log(map.leafletElement);
    //     // }
    // }

    

    addMarker = (e) => {
      let point = this.state.point;
      point.pop();
      point.push(e.latlng);
      this.setState(
        {point});
      // const {markers} = this.state
      // let reactLeafletSearch = this.leafletSearchRef.current;
      // while (markers.length > 0) markers.pop();
      // if (reactLeafletSearch.SearchInfo){
      //   console.log(reactLeafletSearch.SearchInfo)
      //   markers.push(reactLeafletSearch.SearchInfo.latLng);
      //   reactLeafletSearch.SearchInfo = null;
      // }
      // else {
      //   markers.push(e.latlng)
      // }
      // this.setState({markers})
      // console.log(this.state.markers)
    }

    setElementDates(e){
      // console.log(e);
      e[2] = new Date(e[2]);
      e[3] = new Date(e[3]);
      // console.log(e);
    }

   componentDidMount() {
     console.log(Map);
    axios.get("http://127.0.0.1:5000/locations")
      .then(response => {
        response.data.forEach(e => this.setElementDates(e));
        this.setState({
          locations: response.data,
          filteredLocations: response.data
        });
      })
      .catch(err => {
        console.error(err);
      });
  } 

  

  updateMarker = () => {
    console.log('in update marker')
    if (this.state.point) return this.state.point;
    return [0,0];
  }
  
  
  render() {
    const position = [32.776520,35.022610];
    return (
      <div className="map-container">
        <div id="travelers-row" className="row">
        <div className="form-group col-3">
          <div className="form-row row">
          <div className="col">
            <label>Enter radius:</label>
          </div>
          <div className="col">
            <input className="form-control" type="text" placeholder="Radius" onChange={(event) => {
							this.setState({ radius: event.target.value });
						}}></input>
          </div>
          </div>
          <div className="form-row row">
            <div className="col">
              <label>start date : </label>
            </div>
            <div className="col">
              <input
              className="form-control"
                type="date"
                onChange={(event) => {
                  this.setState({ start_date: new Date(event.target.value) });

                }}
              />
            </div>
            </div>
            <div className="form-row row">
              <div className="col">
                <label>end date : </label>
              </div>
              <div className="col">
                <input
                className="form-control"
                  type="date"
                  onChange={(event) => {
                    this.setState({ end_date: new Date(event.target.value) });
                  }}
                />
              </div>
            </div>
        <Button className="search-button" variant="success" onClick={this.showPostsInArea}> 
					Search Posts
				</Button>
				</div>
        <div className="col-8">
        <Map 
        className="map"
        ref={this.mapRef}
        center={position} 
        zoom={this.state.zoom} 
        onClick={this.addMarker}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.osm.org/{z}/{x}/{y}.png'
            />
            <ReactLeafletSearch
            closeResultsOnClick={true}
            openSearchOnLoad={true}
            ref={this.leafletSearchRef}
            // onClick={this.clickedSearch}
            // popUp={this.myPopup}
            />
            {this.state.point.map(position => 
            <Marker position={position}></Marker>
            )}
              // {/* <>
              // <Marker position={this.updateMarker}/>
              // </> */}
        

          {this.state.filteredLocations.map(loc =>( 
            <>
              <Marker  position={[loc[0],loc[1]]}/>
            </>
        ))}
        </Map>
          </div>
        </div>
        </div>
    );
  }
}


export default SearchTravelers;