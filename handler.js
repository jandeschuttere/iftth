'use strict'

var request = require('request')
var config = require('config')

module.exports.startTimer = (event, context, callback) => {
  // var body = JSON.parse(event.body)
  dailyListAPICall(function (error, response) {
    if (error !== null) {
      // Some Error!
      httpCallback('error', 500, callback)
    } else {
      // Find stopped timer
      var dayEntries = response.day_entries
      var todayTimer = null

      for (var index = 0; index < dayEntries.length; ++index) {
        var dayEntry = dayEntries[index]
        if (dayEntry.hasOwnProperty('timer_started_at') === false && dayEntry.project_id === config.get('harvest.credentials.project_id') && dayEntry.task_id === config.get('harvest.credentials.task_id')) {
          todayTimer = dayEntry
        }
      }

      
      if (todayTimer !== null && todayTimer.id > 0) {
        // Found a running timer, stop it!
        toggleTimerAPICall(todayTimer.id, function (error, response) {
          if (error !== null) {
            httpCallback('error', 500, callback)
          } else {
            httpCallback(response, 200, callback)
          }
        })
      } else {
        startTimerAPICall(function (error, response) {
          if (error !== null) {
            // Some Error!
            httpCallback('error', 500, callback)
          } else {
            // Ok: Started!
            httpCallback({'message': 'no timers found, starting a new one', 'response': response }, 200, callback)
          }
        })
      }
    }
  })
}

function startTimerAPICall (callback) {
  var options = { method: 'POST',
    url: 'https://' + config.get('harvest.credentials.subdomain') + '.harvestapp.com/daily/add',
    headers: { 'postman-token': 'f2f7f539-ab31-ed96-d613-38d7dc8f4d6f',
      'cache-control': 'no-cache',
      authorization: generateBasicAuth(config.get('harvest.credentials.username'), config.get('harvest.credentials.password')),
      'content-type': 'application/json',
      accept: 'application/json'
    },
    body: { notes: 'Started Using IFTTH',
      project_id: config.get('harvest.credentials.project_id'),
      task_id: config.get('harvest.credentials.task_id')
    },
    json: true
  }

  // Send your request to harvest
  request(options, function (error, response, body) {
    console.log('error:', error) // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode) // Print the response status code if a response was received
    console.log('body:', body) // Print the HTML for the Google homepage.
    callback(error, body)
  })
}

function dailyListAPICall (callback) {
  var options = {
    method: 'GET',
    url: 'https://' + config.get('harvest.credentials.subdomain') + '.harvestapp.com/daily/',
    headers: {
      'cache-control': 'no-cache',
      authorization: generateBasicAuth(config.get('harvest.credentials.username'), config.get('harvest.credentials.password')),
      'content-type': 'application/json',
      accept: 'application/json'
    },
    json: true
  }

  // Send your request to harvest
  request(options, function (error, response, body) {
    console.log('error:', error) // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode) // Print the response status code if a response was received
    console.log('body:', body) // Print the HTML for the Google homepage.
    callback(error, body)
  })
}

function toggleTimerAPICall (id, callback) {
  var options = {
    method: 'GET',
    url: 'https://' + config.get('harvest.credentials.subdomain') + '.harvestapp.com/daily/timer/' + id,
    headers: {
      'cache-control': 'no-cache',
      authorization: generateBasicAuth(config.get('harvest.credentials.username'), config.get('harvest.credentials.password')),
      'content-type': 'application/json',
      accept: 'application/json'
    },
    json: true
  }

  // Send your request to harvest
  request(options, function (error, response, body) {
    console.log('error:', error) // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode) // Print the response status code if a response was received
    console.log('body:', body) // Print the HTML for the Google homepage.
    callback(error, body)
  })
}

module.exports.stopRunningTimer = (event, context, callback) => {
  // var body = JSON.parse(event.body)
  dailyListAPICall(function (error, response) {
    if (error !== null) {
      // Some Error!
      httpCallback('error', 500, callback)
    } else {
      // Find running timer (on project and task)
      var dayEntries = response.day_entries
      var runningTimer = null

      for (var index = 0; index < dayEntries.length; ++index) {
        var dayEntry = dayEntries[index]
        if (dayEntry.hasOwnProperty('timer_started_at') === true && dayEntry.project_id === config.get('harvest.credentials.project_id') && dayEntry.task_id === config.get('harvest.credentials.task_id')) {
          runningTimer = dayEntry
        }
      }

      
      if (runningTimer !== null && runningTimer.id > 0) {
        // Found a running timer, stop it!
        toggleTimerAPICall(runningTimer.id, function (error, response) {
          if (error !== null) {
            httpCallback('error', 500, callback)
          } else {
            httpCallback(response, 200, callback)
          }
        })
      } else {
        httpCallback({'message': 'no running timers found', 'response': response }, 404, callback)
      }
    }
  })
}

function generateBasicAuth (username, password) {
  return 'Basic ' + new Buffer(username + ':' + password).toString('base64')
}

function httpCallback (message, code, callback) {
  const response = {
    statusCode: code,
    body: JSON.stringify({
      message: message
    })
  }
  callback(null, response)
}
