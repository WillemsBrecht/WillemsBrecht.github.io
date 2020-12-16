const client = {};
var closestValues = [];
let asc_name = false;
let asc_mass = false;
let asc_dist = true;


const getData = async function(){
    try{
        let url = `https://data.nasa.gov/resource/gh4g-9sfh.geojson?fall=Found&$order=year%20DESC&$where=year%20is%20not%20null%20AND%20year%20%3C=%20%222020-01-01%22%20and%20reclat%20!=%20%220.000000%22`;	
        
        // Met de fetch API proberen we de data op te halen.
        const response = await fetch(url);
        const data = await response.json();
        // Als dat gelukt is, gaan we naar onze show_marker_on_map functie.
        show_marker_on_map(data);
    }catch (e){
        console.error("A problem has occured", e);
    }
}

const numericToRadians = function(numericValue){
    radianValue = numericValue * Math.PI / 180;
    return radianValue;
}

const calculateDistanceBetweenPoints = function(clientLocation, meteoriteLocation){
    const radiusOfEarth = 6371;
    const distanceBetweenLatitudes =  numericToRadians(meteoriteLocation.geometry.coordinates[1] - clientLocation.lat);
    const distanceBetweenLongtitudes =  numericToRadians(meteoriteLocation.geometry.coordinates[0] - clientLocation.long);

    const a = Math.pow(Math.sin(distanceBetweenLatitudes/2), 2) + Math.pow(Math.sin(distanceBetweenLongtitudes/2), 2)* Math.cos(numericToRadians(clientLocation.lat)) * Math.cos(numericToRadians(meteoriteLocation.geometry.coordinates[1]));
    const c = 2 * Math.atan(Math.sqrt(a), Math.sqrt(1-a));
    const d = radiusOfEarth * c;
    meteoriteLocation.properties.distance = Math.round(d);
}

const fillTableWithData = function(data){
    let parent = document.querySelector(".content-body");
    parent.innerHTML = parent.innerHTML + `<div class='content-body__item'><div id="${data.properties.name}" class='content-body_data'><span` + ">Name: </span><p>" + data.properties.name + "</p></div>"+
                                                       "<div class='content-body_data'><span>Mass (grams): </span><p>" + (Math.round(data.properties.mass*100)/100) + "</p></div>"+ 
                                                       "<div class='content-body_data'><span>Composition: </span><p>" + data.properties.recclass + "</p></div>"+
                                                       "<div class='content-body_data'><span>Latitude: </span><p>" + (Math.round(data.properties.reclat*100)/100) + "°</p></div>"+
                                                       "<div class='content-body_data'><span>Longtitude: </span><p>" + (Math.round(data.properties.reclong*100)/100) + "°</p></div>"+
                                                       "<div class='content-body_data'><span>Distance (KM): </span><p>" + data.properties.distance + "</p></div></div>";
};

const show_marker_on_map = function(geojson){

    locationiqKey = 'pk.ab7902d031c45e3919ec875e454e9a9d';

    geojson.features.forEach(function(marker) {
        calculateDistanceBetweenPoints(client, marker);
    });

    var filtered = geojson.features.sort(function(positionA, positionB){
        return positionA.properties.distance - positionB.properties.distance;
    });

    for(var i = 0; i < 75; i++){
        closestValues[i] = filtered[i];
        fillTableWithData(filtered[i]);
    }

    var map = new mapboxgl.Map({
        container: 'map',
        attributionControl: false, //need this to show a compact attribution icon (i) instead of the whole text
        style: 'https://tiles.locationiq.com/v2/streets/vector.json?key='+locationiqKey,
        zoom: 3,
        center: [client.long, client.lat]
    });

    closestValues.forEach(function(marker) {
        // create a DOM element for the marker
        var popup = new mapboxgl.Popup()
        .setHTML(`<b id="${marker.properties.id}">Name: </b>${marker.properties.name}</br><b>Lat: </b>${marker.properties.reclat}</br><b>Long: </b>${marker.properties.reclong}</br><b>Year: </b>${marker.properties.year.split("T")[0]}</br><a class="marker_link" href="#${marker.properties.name}">Show more details</>`);

        // add marker to map
        new mapboxgl.Marker()
            .setLngLat(marker.geometry.coordinates)
            .setPopup(popup)
            .addTo(map);
    });
}

function initializeClient(latitude, longitude) {
    client.lat = latitude;
    client.long = longitude;
    getData();
}


const sortOnName = function(){
    document.querySelector(".content-body").innerHTML = "";
    if(asc_name){
        filtered = closestValues.sort((a,b) => (a.properties.name > b.properties.name) ? 1 : ((b.properties.name > a.properties.name) ? -1 : 0));
        document.querySelector(".content-body").innerHTML = "";
        for(let i = 0; i < 75; i++){
            fillTableWithData(filtered[i]);
        }
        document.querySelector(".js-filter_name").innerHTML = "Name &#8595;";
        document.querySelector(".js-filter_name_div").innerHTML = "Name &#8595;";
        asc_name = false;
    } else {
        filtered = closestValues.sort((a,b) => (a.properties.name < b.properties.name) ? 1 : ((b.properties.name < a.properties.name) ? -1 : 0));
        document.querySelector(".content-body").innerHTML = "";
        for(let i = 0; i < 75; i++){
            fillTableWithData(filtered[i]);
        }
        document.querySelector(".js-filter_name").innerHTML = "Name &#8593;";
        document.querySelector(".js-filter_name_div").innerHTML = "Name &#8593;";
        asc_name = true;
    }
    document.querySelector(".js-filter_mass").innerHTML = "Mass -";
    document.querySelector(".js-filter_distance").innerHTML = "Distance -";
    document.querySelector(".js-filter_mass_div").innerHTML = "Mass (grams) -";
    document.querySelector(".js-filter_distance_div").innerHTML = "Distance - ";
};

const sortOnMass = function(){
    document.querySelector(".content-body").innerHTML = "";
    if(asc_mass){
        filtered = closestValues.sort(function(massA, massB){
            return massB.properties.mass - massA.properties.mass;
        });
        document.querySelector(".content-body").innerHTML = "";
        for(let i = 0; i < 75; i++){
            fillTableWithData(filtered[i]);
        }
        document.querySelector(".js-filter_mass").innerHTML = "Mass &#8593;";
        document.querySelector(".js-filter_mass_div").innerHTML = "Mass (grams) &#8593;";
        asc_mass = false;
    } else {
        filtered = closestValues.sort(function(massA, massB){
            return massA.properties.mass - massB.properties.mass;
        });
        document.querySelector(".content-body").innerHTML = "";
        for(let i = 0; i < 75; i++){
            fillTableWithData(filtered[i]);
        }
        document.querySelector(".js-filter_mass").innerHTML = "Mass &#8595;";
        document.querySelector(".js-filter_mass_div").innerHTML = "Mass (grams) &#8595;";
        asc_mass = true;
    }
    document.querySelector(".js-filter_name").innerHTML = "Name -";
    document.querySelector(".js-filter_distance").innerHTML = "Distance -";
    document.querySelector(".js-filter_name_div").innerHTML = "Name -";
    document.querySelector(".js-filter_distance_div").innerHTML = "Distance - ";
};

const sortOnDistance = function(){
    document.querySelector(".content-body").innerHTML = "";
    if(asc_dist){
        filtered = closestValues.sort(function(distanceA, distanceB){
            return distanceB.properties.distance - distanceA.properties.distance;
        });
        for(let i = 0; i < 75; i++){
            fillTableWithData(filtered[i]);
        }
        document.querySelector(".js-filter_distance").innerHTML = "Distance &#8593;";
        document.querySelector(".js-filter_distance_div").innerHTML = "Distance &#8593;";
        asc_dist = false;
    } else {
        filtered = closestValues.sort(function(distanceA, distanceB){
            return distanceA.properties.distance - distanceB.properties.distance;
        });
        for(let i = 0; i < 75; i++){
            fillTableWithData(filtered[i]);
        }
        document.querySelector(".js-filter_distance").innerHTML = "Distance &#8595;";
        document.querySelector(".js-filter_distance_div").innerHTML = "Distance &#8595;";
        asc_dist = true;
    }
    document.querySelector(".js-filter_mass").innerHTML = "Mass - ";
    document.querySelector(".js-filter_mass_div").innerHTML = "Mass (grams) -";
    document.querySelector(".js-filter_name").innerHTML = "Name -";
    document.querySelector(".js-filter_name_div").innerHTML = "Name -";
}

const checkForPreferredScheme = function(){
    if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
        document.querySelector("html").classList.add("night_mode");
        document.getElementById("modeCheckbox").checked = true;
    }
};

const enableListeners = function(){
    document.querySelector(".js-day-night-toggle").addEventListener("change", function(){
        let htmlTag = document.querySelector("html");
        if(htmlTag.classList.contains("night_mode")){
            htmlTag.classList.remove("night_mode");
        }
        else{
            htmlTag.classList.add("night_mode");
        }
    });

    document.querySelector(".js-filter_name_div").addEventListener("click", function(){
        sortOnName();
    });

    document.querySelector(".js-filter_name").addEventListener("click", function(){
        sortOnName();
    });

    document.querySelector(".js-filter_mass").addEventListener("click", function(){
        sortOnMass();
    });

    document.querySelector(".js-filter_mass_div").addEventListener("click", function(){
        sortOnMass();
    });

    document.querySelector(".js-filter_distance").addEventListener("click", function(){
        sortOnDistance();
    });

    document.querySelector(".js-filter_distance_div").addEventListener("click", function(){
        sortOnDistance();
    });
};

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM is loaded!");
    document.getElementById("modeCheckbox").checked = false;
    // Checks if the user prefers dark mode or light mode and changes site accordingly.
    checkForPreferredScheme();
    // Adds an eventlistener on the toggleswitch for day and night mode
    enableListeners();

    /*initializeClient(55.676098, 12.568337);
    navigator.geolocation.getCurrentPosition(function(position) {
        document.querySelector(".content-body").innerHTML = "";
        initializeClient(position.coords.latitude, position.coords.longitude);
    });*/
});
