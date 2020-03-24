document.addEventListener("DOMContentLoaded", () => {
  addSearchFunctions()
  addModal()
})

function addSearchFunctions() {
  let form = document.querySelector("form")
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    let startDate = event.target.children[1].value
    let endDate = event.target.children[3].value
    let hashtag1 = event.target.children[5].value
    let hashtag2 = event.target.children[7].value
    fetch(`http://localhost:3000/tweets/?hashtag1=${hashtag1}&hashtag2=${hashtag2}&start=${startDate}&end=${endDate}`).then(
      resp => resp.json()
    ).then(
      data => renderSearchResults(data)
    )
  })
}

function renderSearchResults(data) {
  let chartArea = document.querySelector("#chart-area")
  let tweetDates1 = data[0].map(tweet => tweet.date)
  let tweetDates2 = data[1].map(tweet => tweet.date)
  let countResult1 = {}
  let countResult2 = {}
  tweetDates1.forEach(date => getDateCount(date, countResult1))
  tweetDates2.forEach(date => getDateCount(date, countResult2))
  renderChart(countResult1, countResult2)
  renderSearch(data)
}

function getDateCount(date, countResult) {
  if (Object.keys(countResult).includes(date)) {
    countResult[date] = countResult[date] + 1 
  } else {
    countResult[date] = 1
  }
}

function renderChart(countResult1, countResult2) {
  let ctx = document.getElementById('myChart').getContext('2d');
  let chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',
    // The data for our dataset
    data: {
        labels: putDatesInArray(countResult1),
        datasets: [{
            label: 'Hashtag1',
            fill: false,
            borderColor: 'red',
            data: putUsesInArray(countResult1)
        },
        {
          label: 'Hashtag2',
          fill: false,
          borderColor: 'blue',
          data: putUsesInArray(countResult2)
        }]
    },
    // Configuration options go here
    options: {}
  })  
}

function putDatesInArray(countResult) {
  let datesArray = []
  for (const date in countResult) {
    datesArray.push(date)
  }
  return datesArray 
}

function putUsesInArray(countResult) {
  let usesArray = []
  for (const date in countResult) {
    usesArray.push(countResult[date])
  }
  return usesArray
}

function addModal() {
  const modal = document.getElementById("myModal");
  modal.style.display = "block"
  document.querySelector('#username').addEventListener('submit', (event) => {
    event.preventDefault()
    modal.style.display = "none" 
    fetch(`http://localhost:3000/users/?name=${event.target.children[1].value}`).then(
      resp => resp.json()
    ).then(data => renderFavorites(data))
  })
}

function renderFavorites(userData) {
  document.querySelector('h1').id = userData.id 
  favoritesArea = document.querySelector('#past-search-area')
  let searches = userData.searches
  searches.forEach(search => {
    listItem = document.createElement('li')
    listItem.innerText = search.hashtags
    listItem.dataset.searchId = search.id
    listItem.addEventListener("click", displaySearch)

    deleteBtn = document.createElement('button')
    deleteBtn.addEventListener('click', deleteSearch)
    
    listItem.append(deleteBtn)
    favoritesArea.append(listItem)
  })
}

function displaySearch(event) {
  form = document.querySelector('#chart_form')
  searches = event.target.innerText.split(' ')
  form.children[5].value = searches[0]
  form.children[7].value = searches[1]
  form.children[8].click()
}

function deleteSearch(event) {
  searchId = event.target.parentElement.dataset.searchId 
  fetch(`http://localhost:3000/searches/${searchId}`, {
    method: "DELETE"
  }).then(event.target.parentElement.remove())
}

function renderSearch(data) {
  hashtag1 = data[0][0].hashtag
  hashtag2 = data[1][0].hashtag
  search = `${hashtag1} ${hashtag2}`
  
  listItem = document.createElement('li')
  listItem.innerText = search 

  saveBtn = document.createElement('button')
  saveBtn.addEventListener("click", saveSearch)

  listItem.append(saveBtn)
  searchArea = document.querySelector("#current-search-area")
  searchArea.append(listItem)
}

function saveSearch(event) {
  hashtags = event.target.parentElement.innerText
  userId = document.querySelector('h1').id
  fetch("http://localhost:3000/searches", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
      "Accept": "application/json"
    },
    body: JSON.stringify({ 
      user_id: userId, 
      hashtags: hashtags
    })
  })
}

