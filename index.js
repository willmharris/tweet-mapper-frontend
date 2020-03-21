document.addEventListener("DOMContentLoaded", () => {
  addSearchFunctions()
})

function addSearchFunctions() {
  let form = document.querySelector("form")
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    // let startDate = event.target.children[1].value
    // let endDate = event.target.children[3].value
    // let hashtag = event.target.children[5].value
    fetch("http://localhost:3000/tweets").then(
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
  chartArea.innerText = JSON.stringify(countResult)
}

function getDateCount(date, countResult) {
  if (Object.keys(countResult).includes(date)) {
    countResult[date] = countResult[date] + 1 
  } else {
    countResult[date] = 1
  }
}