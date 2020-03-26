document.addEventListener("DOMContentLoaded", () => {
  // Allows the search form to accept input, transmit data to the server, and render a chart in response
  document.querySelector("#search-form").addEventListener("submit", addSearchFunction)
  // Allows the user to add additional hashtag inputs 
  document.querySelector("#add-hashtag").addEventListener("click", addHashtagInput)
  // Adds login screen 
  addLogin()
})

// Search form functions // 

function addSearchFunction(event) {
  event.preventDefault()
  // Get start and end dates from the form values 
  let startDate = document.querySelector("#start-date").value
  let endDate = document.querySelector("#end-date").value
  // Get hashtags from the form values 
  let hashtagInputArray = document.querySelectorAll(".hashtag-input")
  let hashtagValueArray = Array.from(hashtagInputArray).map(hashtagInput => hashtagInput.value)
  // Put hashtags into a JSON format 
  let payload = {start: startDate, end: endDate}
  let counter = 1 
  hashtagValueArray.forEach(hashtag => {
    payload[`hashtag${counter}`] = hashtag 
    counter ++ 
  })
  // Indicate this is a new search
  let searchSaved = false 
  // Render the chart 
  getChartDataFromDatabase(payload, searchSaved)
  
}

function getChartDataFromDatabase(payload, searchSaved) {
  // Requests the server for the search parameters and render a chart based on the returned information and adds the search to the current searches bar 
  fetch("http://localhost:3000/tweets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
      "Accept": "application/json"
    },
    body: JSON.stringify({
      payload
    })
  }).then(
    resp => resp.json()
  ).then(
    data => {
      renderChart(data)
      if (searchSaved === false) {
        renderSearchInRecentSearchesBar(data)
      }
    }
  )
}

function renderChart(data) {
  // Get chart element
  let ctx = document.getElementById('myChart').getContext('2d')
  // Make the chart, using the formatDataForChart function
  let chart = new Chart(ctx, {
    type: 'line',
    data: formatAggregateDataForChart(data),
    options: {}
  })  
}

function formatAggregateDataForChart(data) {
  // Put hashtag data in an array 
  let hashtagDataArray = Object.entries(data)
  // Get date labels from the data array 
  let dates = Object.keys(hashtagDataArray[0][1])
  // Set up a color array to iterate through: the first element is the counter, the second element is the list of possible colors
  let colorArray = [0, ["black", "red", "blue", "green", "purple", "orange"]]
  // Iterate through each hashtag and format the data to be read by the chart
  let datasetArray = []
  hashtagDataArray.forEach(hashtagData => {
    formatHashtagDataForChart(hashtagData, datasetArray, colorArray)
  })
  return {
    labels: dates,
    datasets: datasetArray
  }
}

function formatHashtagDataForChart(hashtagData, datasetArray, colorArray) {
  // Set up information from the hashtag data passed in
  let currentHashtag = hashtagData[0]
  let currentHashtagDateInfo = hashtagData[1]
  // Set up an object to be passed into the dataset array
  let chartObject = {}
  // Assign label 
  chartObject["label"] = currentHashtag 
  // Assign fill information 
  chartObject["fill"] = false 
  // Get current color, and loop around if at the end of the array
  let currentColor = colorArray[0]
  if (currentColor === 7) {
    currentColor = 0
  }
  // Assign line color 
  chartObject["borderColor"] = colorArray[1][currentColor]
  colorArray[0] += 1
  // Assign data 
  let useByDateArray = Object.values(currentHashtagDateInfo)
  chartObject["data"] = useByDateArray
  // Add the working object to the dataset array 
  datasetArray.push(chartObject)
}

function renderSearchInRecentSearchesBar(data) {
  // Get recent search area 
  recentSearchArea = document.querySelector("#recent-searches")
  // Get list of hashtags 
  let hashtagsArray = Object.keys(data)
  // Get start date and end date 
  let dates = Object.keys(data[hashtagsArray[0]])
  let startDate = dates[0]
  let endDate = dates[dates.length -1]
  // Create search 
  let search = `Start Date: ${startDate} End Date: ${endDate} Hashtags: ${hashtagsArray}`
  // Create list item for the search
  let searchListItem = document.createElement('li')
  searchListItem.innerText = search 
  // Add search information to that list item's dataset
  searchListItem.dataset.startDate = startDate
  searchListItem.dataset.endDate = endDate
  searchListItem.dataset.hashtags = hashtagsArray
  // Create save button 
  let saveButton = document.createElement('button')
  saveButton.innerText = "Save"
  saveButton.addEventListener("click", saveSearch)
  // Append elements 
  searchListItem.append(saveButton)
  recentSearchArea.append(searchListItem)
}

function saveSearch(event) {
  // Get information from the list item dataset
  let hashtags = event.target.parentElement.dataset.hashtags
  let startDate = event.target.parentElement.dataset.startDate
  let endDate = event.target.parentElement.dataset.endDate
  // Get user id from the header id, which was set on login
  userId = document.querySelector('h1').id
  // Post the search information to the database and render the search in the favorites bar
  fetch("http://localhost:3000/searches", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
      "Accept": "application/json"
    },
    body: JSON.stringify({ 
      user_id: userId, 
      hashtags: hashtags,
      start_date: startDate,
      end_date: endDate
    })
  }).then(
    resp => resp.json()
  ).then(data => {
    // Modify hashtag spacing to work with the method below 
    let newHashtagSpacing = data.hashtags.split(",").join(' ')
    data.hashtags = newHashtagSpacing
    // Add the saved search to the favorites bar 
    renderSavedSearchInFavoritesBar(data)
  })
  
}

function addHashtagInput(event) {
  event.preventDefault() 
  // Get the search form 
  searchForm = document.querySelector("#search-form")
  // Find the current location in the form I should append the input to
  searchFormLength = searchForm.children.length 
  currentNumberOfHashtags = (searchFormLength - 6)/2
  currentHashtagNumber = currentNumberOfHashtags + 1 
  // Make the new label
  newHashtagLabel = document.createElement('label')
  newHashtagLabel.innerText = `Hashtag ${currentHashtagNumber}:`
  // Make the new input area
  newHashtagInput = document.createElement("input")
  newHashtagInput.type = "text"
  newHashtagInput.classList.add("hashtag-input")
  // Append the input 
  searchForm.insertBefore(newHashtagInput, searchForm.children[searchFormLength - 2])
  searchForm.insertBefore(newHashtagLabel, searchForm.children[searchFormLength - 2])
}

// User info functions // 

function addLogin() {
  // Grab and display login screen
  const modal = document.getElementById("myModal");
  modal.style.display = "block"
  // Allow the user to submit a username and leads to the mainpage while displaying the user's favorite seraches 
  document.querySelector('#username').addEventListener('submit', (event) => {
    event.preventDefault()
    modal.style.display = "none" 
    fetch(`http://localhost:3000/users/?name=${event.target.children[1].value}`).then(
      resp => resp.json()
    ).then(data => renderFavoritesBar(data))
  })
}

function renderFavoritesBar(userData) {
  // Set user id in the header to be used by other functions 
  document.querySelector('h1').id = userData.id 
  // Get the favorites bar
  let favoritesArea = document.querySelector('#favorite-searches')
  // Get all the user's searches 
  let searches = userData.searches
  // Display each search in the favorites bar with execute and delete functions 
  searches.forEach(search => {
    renderSavedSearchInFavoritesBar(search)
  })
}

function renderSavedSearchInFavoritesBar(search) {
  // Get information from the passed in search 
  let startDate = search.start_date
  let endDate = search.end_date
  let hashtags = search.hashtags
  // Get the favorites bar 
  let favoritesBar = document.querySelector("#favorite-searches")
  // Make list item for the search 
  let searchListItem = document.createElement('li')
  // Set the list item text to the search information 
  searchListItem.innerText = `Start Date: ${startDate} End Date: ${endDate} Hashtags: ${hashtags}`
  // Assign search information to the list item dataset
  searchListItem.dataset.startDate = startDate
  searchListItem.dataset.endDate = endDate
  searchListItem.dataset.hashtags = hashtags
  // Set the search id in the list item dataset to be found if deleted
  searchListItem.dataset.searchId = search.id
  // Add search execution functionality
  searchListItem.addEventListener("click", executeSearch)
  // Add delete functionality
  let deleteButton = document.createElement('button')
  deleteButton.innerText = "Remove"
  deleteButton.addEventListener('click', deleteSearch)
  // Append the delete button and list item
  searchListItem.append(deleteButton)
  favoritesBar.append(searchListItem)
}

function executeSearch(event) {
  // Get search form 
  let searchForm = document.querySelector('#search-form')
  // Get search input information from dataset 
  let startDate = event.target.dataset.startDate 
  let endDate = event.target.dataset.endDate
  let hashtags = event.target.dataset.hashtags
  let hashtagsArray = hashtags.split(' ')
  // Prepare payload 
  let payload = {start: startDate, end: endDate}
  let counter = 1 
  hashtagsArray.forEach(hashtag => {
    payload[`hashtag${counter}`] = hashtag 
    counter ++ 
  })
  // Indicate the search has been previously saved
  let searchSaved = true 
  // Render the chart 
  getChartDataFromDatabase(payload, searchSaved)
}

function deleteSearch(event) {
  // Get search id from the parent element
  searchId = event.target.parentElement.dataset.searchId 
  // Send the delete request to the database for that idea and remove the parent element from the DOM
  fetch(`http://localhost:3000/searches/${searchId}`, {
    method: "DELETE"
  }).then(event.target.parentElement.remove())
}