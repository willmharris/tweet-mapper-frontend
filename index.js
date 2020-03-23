document.addEventListener("DOMContentLoaded", () => {
  addSearchFunctions()
})

function addSearchFunctions() {
  let form = document.querySelector("form")
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    let startDate = event.target.children[1].value
    let endDate = event.target.children[3].value
    let hashtag = event.target.children[5].value
    fetch(`http://localhost:3000/tweets/?hashtag=${hashtag}&start=${startDate}&end=${endDate}`).then(
      resp => resp.json()
    ).then(
      data => renderSearchResults(data)
    )
  })
}

function renderSearchResults(data) {
  let chartArea = document.querySelector("#chart-area")
  let tweetDates = data.map(tweet => tweet.date)
  let countResult = {}
  tweetDates.forEach(date => getDateCount(date, countResult))
  renderChart(countResult)
}

function getDateCount(date, countResult) {
  if (Object.keys(countResult).includes(date)) {
    countResult[date] = countResult[date] + 1 
  } else {
    countResult[date] = 1
  }
}

function renderChart(countResult) {
  let ctx = document.getElementById('myChart').getContext('2d');
  let chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',
    // The data for our dataset
    data: {
        labels: putDatesInArray(countResult),
        datasets: [{
            label: 'My First dataset',
            fill: false,
            borderColor: 'rgb(255, 99, 132)',
            data: putUsesInArray(countResult)
        }]
    },
    // Configuration options go here
    options: {}
});
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
