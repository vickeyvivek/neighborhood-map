//This creates a variable called map
var map;
var weather;
//This is the model
//This array of objects holds the location info
var locationInfo = [
        {name: 'Park Ave Penthouse', latlong: {lat: 40.7713024, lng: -73.9632393}},
        {name: 'Chelsea Loft', latlong: {lat: 40.7444883,lng: -73.9949465}},
        {name: 'Union Square open Floor Plan', latlong: {lat: 40.7347062, lng: -73.9895759}},
        {name: 'East Villge Hip Studio', latlong: {lat: 40.7281777,lng: -73.984377}},
        {name: 'TriBeCa Artsy Bacelor Pad', latlong: {lat: 40.7195264, lng: -74.0089934}},
        {name: 'Chinatown Homey Space', latlong: {lat: 40.7180628, lng: -73.9961237}}
        ];

//this function initializes the map
function initMap() {
    // This constructor creates the new map at the chosen location
    map = new google.maps.Map(document.getElementById('map'), {
    });
    //The creates the info window
    var infowindow = new google.maps.InfoWindow({
    });
    //This creates the lat long boundries
    var bounds = new google.maps.LatLngBounds();
    //This for loop is used to create new marker properties and push them into each object in the locationInfo array, making them properties of all of the location objects
    for( i = 0; i<locationInfo.length; i++){
      //Creates each marker as a property of an object in the locationInfo array
      locationInfo[i].marker = new google.maps.Marker({
      position: locationInfo[i].latlong,
      map: map,
      title: locationInfo[i].name,
      //address: locationInfo[i].address,
      animation: google.maps.Animation.DROP
    });
    //This adds a click event to the marker properties that causes the infoWindow to open upon clicking. It doesn't contain the content yet though.
    locationInfo[i].marker.addListener('click', function(){
      //Now we are calling the populateInfoWindow function that we set up later
      populateInfoWindow(this, infowindow);
    });
    //This adds the click event that calls the function in control of the animation of the marker
    locationInfo[i].marker.addListener('click', function(){
      toggleBounce(this);
    });
    bounds.extend(locationInfo[i].marker.position);
    }
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);
    //center the map to the geometric center of all markers.
    map.setCenter(bounds.getCenter());
}

//This function toggles the marker between bouncing and not bouncing
function toggleBounce(marker) {
  //This makes sure that all markers have stopped bouncing first
  for(var i=0; i<locationInfo.length; i++){
      locationInfo[i].marker.setAnimation(null);
  };
  //If the marker is already animated, stop animation
  if (marker.getAnimation() !== null) {
    marker.setAnimation(null);
  } else {
    //Otherwise, set animation on this marker
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

//This function makes sure that the infowindow appears and sets the content to the correct information, it also clears the window content if the info window is closed
function populateInfoWindow(marker, infowindow) {
  // This just makes sure the window is not already open
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    var streetviewUrl='https://maps.googleapis.com/maps/api/streetview?size=220x120&location='+marker.lat+','+marker.lng;
             //OpenWeatherMap api
             var weatherUrl='http://api.openweathermap.org/data/2.5/weather?q='+marker.title+'&lat='+marker.lat+'&lon='+marker.lng+'&APPID=302e5c9ce22283a076002344330d532b'
            $.get(weatherUrl,function(data){
              var temp_min=parseFloat(data.main.temp_min-273).toFixed(2);
              var temp_max=parseFloat(data.main.temp_max-273).toFixed(2);
             var weather='<p> Min Temprature: '+temp_min+'&deg;C</p><p> Max Temperature: '+temp_max+'&deg;C</p>'
             infowindow.setContent('<div>' + marker.title + '</div>'+ '<div>' +'<img src='+streetviewUrl+'>'+'</div>'+'<div>' + marker.position + '</div>'+ weather);
            });
    //This sets the content ofthe info window
    //infowindow.setContent('<p>'+marker.title+'</p>');//+'<img src='+streetviewUrl+'>'+weather);
    //infowindow.setContent('<div>' + marker.title + '</div>'+ '<div>' + marker.position + '</div>'+ weather);
    infowindow.open(map, marker);
    // Make sure the infoWindow is cleared if the close button is clicked
    infowindow.addListener('closeclick', function() {
      infowindow.marker = null;
      //Makes sure the animation of the marker is stopped if the infoWindow close button is clicked
      marker.setAnimation(null);
    });
  }
}

//This is a the viewmodel for the KO code
function appViewModel() {
  var self = this;
  //This is creating a reference to the filter data-bind in the HTML
  self.filter = ko.observable();
  //Adding as a property a KO observable array
  self.myObservableArray = ko.observableArray();
  //This for loop is what actually pushes the locationInfo objects into the observable array
  for(var i=0; i<locationInfo.length; i++){
    self.myObservableArray.push(locationInfo[i]);
  }
  //Here is where I connect the list to the markers. I've added a click event on the DOM element that connects to this. whenever a list item is clicked, this function is run
  //It basically triggers all of the click events on the marker
  self.listClicker = function(locationInfo){
    google.maps.event.trigger(locationInfo.marker, 'click')
  };
  //This is a method that is being added to the function. Its a KO computed observable
  self.filteredItems = ko.computed(function() { console.log(self);
  //if no value has been entered, just return the observable array and set the marker to visable
  if (!self.filter()) {
    // loop through locations
    self.myObservableArray().forEach( function (location) {
    // if marker poperty exists its sets the visibility to true. It won't exist on load, but it WILL exist after the page has loaded and you have typed in the filter box and then cleared it
      if (location.marker) {
        location.marker.setVisible(true);
      }
    });
      return self.myObservableArray();
  }
  else {
    //the variable filter is holding the results of the user input into filter and then converting it to all lower case
    var filter = self.filter().toLowerCase();
      //returns an array that contains only those items in the array that is being filtered that pass the true/false test inside the filter
      return ko.utils.arrayFilter(self.myObservableArray(), function(item) {
      //Holds the result of the filter in a variable that is converted to a number based on how .indexOf works
      //indexOf returns the index of the first occurance of a query value. If there is no query value in the string, indexOf returns a -1.
      var result = item.name.toLowerCase().indexOf(filter);
      //If there were no matches between the filter and the list, hide the marker
        if (result < 0) {
          item.marker.setVisible(false);
          //If there were matches, show the marker
        }
        else {
          item.marker.setVisible(true);
        }
        //Based on how indexOf works, if you have a match at all, the result must be 0 or greater becuase 0 is the lowest index number.
        //So if you have any result, it will be greater than -1 and so returns true. Otherwise it returns false
        return item.name.toLowerCase().indexOf(filter) > -1;
      });
    }
  });
};


// Activates knockout.js
ko.applyBindings(new appViewModel());

$( '.menuButton' ).click(function(){
  $('.responsive-menu').toggleClass('expand');
});

function googleError(){
  alert("Google maps is not loading. Please check your internet connection");
}





