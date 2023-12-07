// tableHandler.js
// export function updateTable(countryFeatures) {
//     const tableRows = document.querySelectorAll('#unshownData-container table tr:not(:first-child)');
    
//     tableRows.forEach(row => {
//         // Make sure that each row has enough cells before trying to access them
//         if (row.cells.length >= 3) {
//             const countryNameCell = row.cells[0];
//             const countryName = countryNameCell.textContent.trim();

//             // console.log(row.cells[1])
            
//             // Find the corresponding feature for the country
//             const countryFeature = countryFeatures.find(feature => feature.properties.ADMIN === countryName);

//             console.log(countryFeature)
//             console.log("JSON country names:", countryFeatures.map(feature => feature.properties.ADMIN));


//             if (countryFeature) {
//                 row.cells[1].textContent = countryFeature.properties.totalCases || '0';
//                 row.cells[2].textContent = countryFeature.properties.totalDeaths || '0';
//             } else {
//                 // If the country is not found in the JSON data, set the values to 0
//                 row.cells[1].textContent = '0';
//                 row.cells[2].textContent = '0';
//             }
//         }
//     });
// }

export function updateTable(countryData) {
    const tableRows = document.querySelectorAll('#unshownData-container table tr:not(:first-child)');
    
    tableRows.forEach(row => {
        if (row.cells.length >= 3) {
            const countryNameCell = row.cells[0];
            const countryName = countryNameCell.textContent.trim();

            // console.log(roll.cells[0])

            // Find the corresponding data for the country
            const countryInfo = countryData.find(data => data.c_ref === countryName);

            if (countryInfo) {
                row.cells[1].textContent = countryInfo.totalCases || '0';
                row.cells[2].textContent = countryInfo.totalDeaths || '0';
            } else {
                // If the country is not found in the JSON data, set the values to 0
                row.cells[1].textContent = '0';
                row.cells[2].textContent = '0';
            }
        }
    });
}