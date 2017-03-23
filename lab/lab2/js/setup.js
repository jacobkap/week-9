var deciphered; // deciphered results from the mapzen weird route response
var geo_obj; // geoJson object to be added. Made here for easy removal
var cipher; // for deciphering and directions

// Setting up our map
var map = L.map('map', {
  center: [38.553746, -97.009345],
  zoom: 4
});

var custom = L.tileLayer('https://api.mapbox.com/styles/v1/jkkaplan/cizutwown001d2ss1hcixcpj0/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamtrYXBsYW4iLCJhIjoiY2lnOXAyaWZyMHNjZ3V5bHg4YTZieDczaSJ9.vSjaF4o2xaDFhNAv9Z2y7A', {

  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(map);


// Make the geoJson from the array of coordinate arrays
var make_route = function(deciphered) {
  // Using format from geojson.io
  route_geo = {  "type":"FeatureCollection",
  "features":[{
    "type":"Feature",
    "properties": {},
    "geometry":{
      "type":"LineString",
      "coordinates":[]
    }
  }]
};
_.each(deciphered, function(coords) {
  route_geo.features[0].geometry.coordinates.push([coords[1], coords[0]]);
});

return route_geo;

};

// Adds the routing line to the map
var add_line_to_map = function(route_geo) {
  geo_obj = L.geoJSON(route_geo, {
    "color": "#e41a1c",
    "weight": 3.5,
    "opacity": 1
  });
  geo_obj.addTo(map);
};

// Gets the ciphered data from mapzen mobility
var get_ciphered_route = function(data) {

  // Trying to arrange it orderly with all the quotes. Still looks messy
  cipher_url = 'https://matrix.mapzen.com/optimized_route?json={"locations":' +
  '[{"lat":' + state.position.marker._latlng.lat + ',' +
  '"lon":' + state.position.marker._latlng.lng + '},' +
  '{"lat":' +  data.features[0].geometry.coordinates[1] + ',' +
  '"lon":' + data.features[0].geometry.coordinates[0] +
  '}],"costing":"pedestrian","directions_options":{"units":"miles"}}&api_key=mapzen-3CzaEbE';

  $.ajax(cipher_url).done(function(data) {
    // Decodes the route response
    cipher = data;
    deciphered = decode(data.trip.legs[0].shape);
    route_geo = make_route(deciphered);

    if (typeof geo_obj !== "undefined") {
      geo_obj.remove();
    }
    add_line_to_map(route_geo);
    add_directions();

    // Set bounds to fit both locations
    map.fitBounds([
      [cipher.trip.locations[0].lat,
      cipher.trip.locations[0].lon],
      [cipher.trip.locations[1].lat,
      cipher.trip.locations[1].lon],
      {maxZoom: 6}
    ]);

  });
};

add_directions = function() {
  $('.directions').empty();// remove any previous directions
  $('.sidebar').append('<div class = directions><h1>' + results.features[0].properties.name +
    '</h1></div>');
  _.each(cipher.trip.legs[0].maneuvers, function(directions) {
    length = directions.verbal_post_transition_instruction;
    if (typeof length === "undefined") {
      length = "";
    }
    $('.sidebar').append('<div class = directions><p>' + directions.instruction + ' ' +
     length + '</p></div>');
  });
};
