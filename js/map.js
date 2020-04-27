let pos;
let map;
let bounds;
let infoWindow;
let currentInfoWindow;
let service;
let infoPane;
var myLatLng;
var directionsService;
var directionsDisplay;
function initMap() {
  // Initialize variables
  directionsDisplay = new google.maps.DirectionsRenderer(); 
    directionsService = new google.maps.DirectionsService();




  bounds = new google.maps.LatLngBounds();
  infoWindow = new google.maps.InfoWindow;
  currentInfoWindow = infoWindow;
  /* TODO: Step 4A3: Add a generic sidebar */
  infoPane = document.getElementById('panel');

  // Try HTML5 geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      myLatLng = pos;// Storing the personal location for further use
      map = new google.maps.Map(document.getElementById('map'), {
        center: pos,
        zoom: 15
      });
      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        icon: 'http://maps.google.com/mapfiles/kml/paddle/blu-stars.png',
        title: 'Your Current Location',
        });

      bounds.extend(pos);
      map.setCenter(pos);

      // Call Places Nearby Search on user's location
      getNearbyPlaces(pos);
    }, () => {
      // Browser supports geolocation, but user has denied permission
      handleLocationError(true, infoWindow);
    });
  } else {
    // Browser doesn't support geolocation
    handleLocationError(false, infoWindow);
    // Take input from the user about his current location and perform the thing here
    ///////////////// here ////////////////////////////////////

  }
}

// Handle a geolocation error
function handleLocationError(browserHasGeolocation, infoWindow) {
  // Set default location to Sydney, Australia
  pos = { lat: -33.856, lng: 151.215 };
  map = new google.maps.Map(document.getElementById('map'), {
    center: pos,
    zoom: 15
  });

  // Display an InfoWindow at the map center
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Geolocation permissions denied. Using default location.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
  currentInfoWindow = infoWindow;

  // Call Places Nearby Search on the default location
  
  getNearbyPlaces(pos);
}

// Perform a Places Nearby Search Request
function getNearbyPlaces(position) {
      var request;
      // Filter the type of the request
      if(document.getElementById('phar').checked) {
        //Hospital radio button is checked
         request = {
          location: position,
          rankBy: google.maps.places.RankBy.DISTANCE,
          keyword: 'Pharmacy'
          };

      }
      else
      {
         request = {
          location: position,
          rankBy: google.maps.places.RankBy.DISTANCE,
          keyword: 'Hospital'
          };

      }
          service = new google.maps.places.PlacesService(map);
          service.nearbySearch(request, nearbyCallback);
    }

// Handle the results (up to 20) of the Nearby Search
function nearbyCallback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    createMarkers(results);
  }
}

// Set markers at the location of each place result
function createMarkers(places) {
  //console.log("Places here. We need to differentiate here somehow",places);
  // Changing the icon type based on the pharmacy/hospital selection
  var imgToDisplay = document.getElementById('hos').checked?'http://maps.google.com/mapfiles/kml/pal3/icon46.png':'http://maps.google.com/mapfiles/kml/pal3/icon18.png';
  //console.log("This is the image to display", imgToDisplay);
  places.forEach(place => {
    //var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
    let marker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      title: place.name,
      icon: imgToDisplay,
    });

    /* TODO: Step 4B: Add click listeners to the markers */
    // Add click listener to each marker
    google.maps.event.addListener(marker, 'click', () => {
      let request = {
        placeId: place.place_id,
        fields: ['name', 'formatted_address', 'place_id', 'geometry']
      };

      /* Only fetch the details of a place when the user clicks on a marker.
       * If we fetch the details for all place results as soon as we get
       * the search response, we will hit API rate limits. */
      service.getDetails(request, (placeResult, status) => {
        showDetails(placeResult, marker, status)
      });
    });

    // Adjust the map bounds to include the location of this marker
    bounds.extend(place.geometry.location);
  });
  /* Once all the markers have been placed, adjust the bounds of the map to
   * show all the markers within the visible area. */
  map.fitBounds(bounds);
}

/* TODO: Step 4C: Show place details in an info window */
// Builds an InfoWindow to display details above the marker
function showDetails(placeResult, marker, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    let placeInfowindow = new google.maps.InfoWindow();
    let rating = "None";
    //console.log("this is the place result",placeResult);
    placeInfowindow.setContent('<div><strong>' + placeResult.name +
      '</strong><br>' + 'Address: ' + placeResult.formatted_address + '</div>');
    placeInfowindow.open(marker.map, marker);
    currentInfoWindow.close();
    currentInfoWindow = placeInfowindow;


        // Clear past Routes before setting new ones
        /////////////////////////////////////////
        directionsDisplay.setMap(null);
        directionsDisplay.setDirections(null);

        directionsDisplay.setMap(map);
        directionsService.route({
          origin: new google.maps.LatLng(myLatLng.lat, myLatLng.lng),
          destination: new google.maps.LatLng(placeResult.geometry.location.lat(),placeResult.geometry.location.lng()),
          travelMode: 'DRIVING'
      }, function (response, status) {
          if (status == 'OK') {
            directionsDisplay.setDirections(response);
              // Adding text instructions to the div panel
               // Everytime we need to remove the older routes by clearing them
            // so setting the panel to be erase all content. Now we can do further
            document.getElementById('directionsPanel').innerHTML = "";
            directionsDisplay.setPanel(document.getElementById('directionsPanel'));
          } else {
              window.alert('Directions request failed due to ' + status);
          }
      });

    //////////////////////////////////////////////////
  }
}

// /* TODO: Step 4D: Load place details in a sidebar */
// // Displays place details in a sidebar
// function showPanel(placeResult) {
//   // Add the values of placeResult onto the screen
//   //console.log(placeResult);
//   if(placeResult.photos === 'undefined')
//   {
//     console.log("no pohtos");
//   }
//   if(placeResult.photos && placeResult.photos.length > 0)
//   {
//     console.log("YES PHOTOS");
//   }
  
//}