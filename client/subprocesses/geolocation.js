// sub-processthat automatically acquires
// geolocation data for the user, so they don't have to manually
// input longitude/latitude coordinates.
// for this, we refer to the documentation below:
// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API

// function getUserLocation() {
//     navigator.geolocation.getCurrentPosition((position) => {
//     const coords = position.coords;

//     const json = coords.toJSON();
//     console.log(json); // A plain object
//     console.log(typeof json); // "object"
//     console.log(json.latitude); // Same value as coords.latitude
//     });
// }

// taken from Geolocation API JavaScript example, this function
// procures the user's latitude and longitude, which we can then use
// for FLYTE services that require the user's location
// https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API/Using_the_Geolocation_API#examples

function geoFindMe() {
  const status = document.querySelector("#status");
  const mapLink = document.querySelector("#map-link");

  mapLink.href = "";
  mapLink.textContent = "";

  function success(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    status.textContent = "";
    mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
    mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
  }

  function error() {
    status.textContent = "Unable to retrieve your location";
  }

  if (!navigator.geolocation) {
    status.textContent = "Geolocation is not supported by your browser";
  } else {
    status.textContent = "Locating…";
    navigator.geolocation.getCurrentPosition(success, error);
  }
}

document.querySelector("#find-me").addEventListener("click", geoFindMe);

geoFindMe();
// getUserLocation();