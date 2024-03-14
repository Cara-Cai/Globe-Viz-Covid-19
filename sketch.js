// import * as THREE from 'three';
import { fetchData } from './dataFetcher.js';
import { updateTable } from './tableHandler.js';



//slider and Date////////////////////////////////////////////////////////////////////////////////////////////////
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

document.getElementById('dateSlider').max = dateToSliderValue(endDate);

const dateslider = document.getElementById('dateSlider');
const dateDisplay = document.getElementById('dateDisplay');

dateDisplay.textContent = '2020-01-22';

dateslider.addEventListener('input', async(e) => {
  const date = sliderValueToDate(e.target.value);
  dateDisplay.textContent = date; 
  // Keep the currently selected region from the dropdown
  const selectedRegion = document.getElementById('continent').value;
  
  // Load the data for the new date
  await loadAndRenderData(date);
  
  // Re-apply highlighting based on the current region selection
  highlightRegion(selectedRegion, date);
});

// const getVal = (feat, date) => {
//   return feat.properties.totalCases && feat.properties.totalCases[date] ? feat.properties.totalCases[date] : 0;
// };


// Initialize the globe///////////////////////////////////////////////////////////////////////////////////
const world = Globe()

  .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
  .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
  // .backgroundImageUrl('//unpkg.com/three-globe/example/img/earth-day.png')
  .atmosphereColor(() => 'rgba(0,0,0,0.9)')
  .lineHoverPrecision(2)
  .polygonAltitude(0.03)
  // .polygonSideColor(() => 'rgba(250, 100, 100, 0.06)')
  .polygonSideColor(() => 'rgba(229, 56, 59, 0.06)')
  // .polygonStrokeColor(() => 'rgba(200, 0, 0, 0.3)')
  .polygonStrokeColor(() => 'rgba(255,0,0,0.3)')
  .polygonCapColor(() => "rgba(255, 0, 0, 0.32)")
  .polygonsTransitionDuration(300)
  .polygonLabel(({ properties: d }) => {

    const dailyCases = d.dailyCases || 0; 
    const dailyDeaths = d.dailyDeaths || 0;
    const totalCases = d.totalCases || 0; 
    const totalDeaths = d.totalDeaths || 0;

    return` 
      <b>${d.ADMIN} (${d.ISO_A2}):</b> <br />
      Daily Cases: <i>${dailyCases}</i><br/>
      Daily Deaths: <i>${dailyDeaths}</i><br/>
      Total Cases: <i>${totalCases}</i><br/>
      Total Deaths: <i>${totalDeaths}</i>
    `});





// Add the globe to the DOM//////////////////////////////////////////////////////////////////////
const globeElement = world(document.getElementById('globeViz'));


//filters////////////////////////////////////////////////////////////////////// - date is not passed in
document.getElementById('continent').addEventListener('change', function(e) {
  const selectedRegion = e.target.value;
  const currentDate = dateDisplay.textContent; // Get the current date from the date display
  highlightRegion(selectedRegion, currentDate);
});



async function loadAndRenderData(date) {
  const globeDataURL = `output6/output_processed_${date}.json`;
  const tableDataURL = `processed_covid_daily_data/processed_${date}.json`;

  // try {
      // Fetch globe data
      const globeData = await fetchData(globeDataURL);
      if (globeData) {
          // Process and update globe visualization
          const altitudeScale = d3.scaleLinear()
              .domain([0, 103802702]) // Adjust based on your data
              .range([0.03, 1]);

          world.polygonsData(globeData.features.filter(d => d.properties.ISO_A2 !== 'AQ'))
              .onPolygonHover(hoverD => world
                  .polygonAltitude(d => d === hoverD ? altitudeScale(d.properties.totalCases) + 0.03 : altitudeScale(d.properties.totalCases))
                  .polygonCapColor(d => d === hoverD ? 'rgba(255, 0, 0, 0.9)' : "rgba(255, 0, 0, 0.32)"));
      }

      // Fetch table data
      const tableData = await fetchData(tableDataURL);
      if (tableData) {
          // Update table
          updateTable(tableData);
      }

  // } catch (error) {
  //     console.error('Error in loadAndRenderData:', error);
  // }
}


async function highlightRegion(selectedRegion, date) {
  const globeDataURL = `output6/output_processed_${date}.json`;
  const globeData = await fetchData(globeDataURL);

  if (!globeData) {
    console.error('Globe data not loaded');
    return;
  }

  // Define altitude scaling based on total cases
  const altitudeScale = d3.scaleLinear()
      .domain([0, d3.max(globeData.features, d => d.properties.totalCases)])
      .range([0.03, 0.12]); // Adjust this range based on your visualization needs

  world.polygonsData(globeData.features)
      .polygonCapColor(d => {
        if (selectedRegion === "All Regions" || d.properties.CONTINENT === selectedRegion) {
          return "rgba(255, 0, 0, 0.32)"; // Default color for all
        // } else if (d.properties.CONTINENT === selectedRegion) {
        //   return "rgba(255, 0, 0, 0.32)"; // Highlight selected region
        } else {
          return "rgba(100, 100, 100, 0.5)"; // Dim non-selected regions
        }
      })
      .onPolygonHover(hoverD => {
        // Apply a dynamic altitude based on the total cases, as previously defined
        const defaultAltitude = d => altitudeScale(d.properties.totalCases);
        
        if (hoverD) {
          // Highlight only the hovered polygon if it's within the selected region
          world.polygonAltitude(d => d === hoverD ? 0.12 : defaultAltitude(d))
              .polygonCapColor(d => {
                if (selectedRegion === "All Regions") {
                  // When "All Regions" is selected, highlight the hovered region with a distinct color
                  return d === hoverD ? "rgba(255, 0, 0, 0.9)" : "rgba(255, 0, 0, 0.32)";
                } else if (d === hoverD && d.properties.CONTINENT === selectedRegion) {
                  return "rgba(255, 0, 0, 0.9)"; // Highlight color for hovered polygon in selected region
                } else if (d.properties.CONTINENT === selectedRegion) {
                  return "rgba(255, 0, 0, 0.32)"; // Selected region color
                } else {
                  return "rgba(100, 100, 100, 0.5)"; // Non-selected regions color
                }
              });
        } else {
          // Reset all polygons to their default appearance when no polygon is hovered
          world.polygonAltitude(defaultAltitude)
              .polygonCapColor(d => d.properties.CONTINENT === selectedRegion || selectedRegion === "All Regions" ?
                "rgba(255, 0, 0, 0.32)" : "rgba(100, 100, 100, 0.5)");
        }
      });
      

  // Ensure non-selected regions remain grey, even when hovering over selected regions
  world.polygonsData().forEach(d => {
    if (d.properties.CONTINENT !== selectedRegion && selectedRegion !== "All Regions") {
      d.polygonCapColor = "rgba(100, 100, 100, 0.5)";
    }
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






