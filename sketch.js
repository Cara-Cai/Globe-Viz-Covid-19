// import * as THREE from 'three';

const startDate = new Date("2020-01-22");
const endDate = new Date("2023-03-09");


function dateToSliderValue(date) {
  return Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
}

function sliderValueToDate(value) {
  const newDate = new Date();
  newDate.setTime(startDate.getTime() + value * 1000 * 60 * 60 * 24);
  return newDate.toISOString().split('T')[0];
}

//slider
document.getElementById('dateSlider').max = dateToSliderValue(endDate);

const dateslider = document.getElementById('dateSlider');
const dateDisplay = document.getElementById('dateDisplay');

dateDisplay.textContent = '2020-01-22';

dateslider.addEventListener('input', (e) => {
  const date = sliderValueToDate(e.target.value);
  dateDisplay.textContent = date; 
  loadAndRenderData(date);
});

const getVal = (feat, date) => {
  return feat.properties.totalCases && feat.properties.totalCases[date] ? feat.properties.totalCases[date] : 0;
};


// Initialize the globe
const world = Globe()
// .cameraDistance(300) 
// .pointOfView({ lat: 100, lng: 0, altitude: 1000}, 0)
  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
  // .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
  .lineHoverPrecision(0)
  .polygonAltitude(0.03)
  .polygonSideColor(() => 'rgba(150, 100, 100, 0.06)')
  .polygonStrokeColor(() => 'rgba(200, 0, 0, 0.3)')
  .polygonCapColor(() => "rgba(255, 0, 0, 0.32)")
  .polygonsTransitionDuration(300)
  .polygonLabel(({ properties: d }) => {
      
    const totalCases = d.totalCases || 0; 
    const totalDeaths = d.totalDeaths || 0;

    return` 
      <b>${d.ADMIN} (${d.ISO_A2}):</b> <br />
      Total Cases: <i>${totalCases}</i><br/>
      Total Deaths: <i>${totalDeaths}</i>
    `});
// Add the globe to the DOM
const globeElement = world(document.getElementById('globeViz'));

// Load and render data for a specific date
function loadAndRenderData(date) {
  fetch(`output6/output_processed_${date}.json`)
    .then((res) => res.json())
    .then((countries) => {

      
      // Define a scale for the altitude that takes the total cases and maps it to a range of altitudes
      const altitudeScale = d3.scaleLinear()
      // .domain([0, d3.max(countries.features, feat => feat.properties.totalCases)]) // Replace with the correct max totalCases value
      .domain([0, 103802702]) 
      .range([0.03, 1]) // Min and max altitudes for the polygons
      // .clamp(true);

      world
        .polygonsData(countries.features.filter((d) => d.properties.ISO_A2 !== 'AQ'))
        // .polygonAltitude(altitudeScale(d.properties.totalCases))
        .onPolygonHover(hoverD => world
          .polygonAltitude(d => d === hoverD ? altitudeScale(d.properties.totalCases) +0.03 : altitudeScale(d.properties.totalCases)) // Slightly increase altitude when hovered
          .polygonCapColor(d => d === hoverD ? 'rgba(255, 0, 0,0.8)' : "rgba(255, 0, 0, 0.32)")
        )
      
  
    });
}


// Initial data load and rendering
const initialDate = '2020-01-22'; 
loadAndRenderData(initialDate);


// Controls
world.controls().autoRotate = true;
world.controls().minDistance = 100;
world.controls().maxDistance = 800;
world.controls().autoRotateSpeed = 0.2;






