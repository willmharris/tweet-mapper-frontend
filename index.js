document.addEventListener("DOMContentLoaded", () => {
  addSearchFunctions()
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
