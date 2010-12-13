init();

function schedule(name, onComplete){
  console.log('scheduling: ' + name);
  $.ajax({
    url: 'http://on-my.tv/',
    success: function(data, status, request){ onScheduleData(data, name, onComplete) },
    dataType: 'html'
  });
}

function init(){
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
    if(request.call == 'contentSchedule'){
      schedule(request.args[0], sendResponse);
    } else if(request.call == 'getShows'){
      getShowList(sendResponse);
    }
  });
}

function getShowList(onComplete){
  $.ajax({
    url: 'http://on-my.tv/',
    success: function(data, status, request){ onShowData(data, onComplete) },
    dataType: 'html'
  });
}

function onShowData(data, onComplete){
  var anchors = $(data).find('.eplink');
  var names = [];
  var namesObj = {};
  for(var i = 0; i < anchors.length; i++){
    var name = anchors[i].text
    if(!namesObj[name]) names.push(name);
    namesObj[name] = true;
  }
  if(onComplete) onComplete(names);
}

function onScheduleData(data, name, onComplete){
  var anchors = $(data).find('.eplink:contains(\'' + name + '\')');

  var episodes = [];
  episodes.finalLength = anchors.length;
  episodes.onComplete = onComplete;
  anchors.each(function(index, elem){
    contributeEpisodeInfo(episodes, elem);
  });
}

function contributeEpisodeInfo(episodes, elem){
  var epID = $(elem).attr('id');
  
  $.ajax({
    url: 'http://on-my.tv/query.php?q=' + epID,
    success: function(data, status, req){ parseEpisodeDetails(data, episodes, elem) },
    dataType: 'html'
  });
}

function parseEpisodeDetails(data, episodes, elem){
  var details = $(data);
  var title = $(details[0]).find('a')[0].text;
  var desc = details[2].innerHTML;
  var timeChannel = $(details[4]).find('strong')[0].innerHTML.split(' on ');
  var time = timeChannel[0]
  var channel = timeChannel[1];
  //console.log(title, desc, time, channel);
  var date = $(elem).attr('href').match(/http:\/\/([\d\.]+)\./)[1].split('.');
  var day = date[0];
  var month = date[1];
  var year = date[2];
  //console.log(day, month, year);
  var seasonEp = $(elem.parentElement).find('.seasep')[1].innerHTML.match(/.+?(\d+).+?(\d+)/);
  var season = seasonEp[1];
  var episode = seasonEp[2];
  //console.log(season, episode);
  episodes.push({
    title: '[tv] ' + title,
    description: desc,
    time: time,
    network: channel,
    day: day,
    month: month,
    year: year,
    season: season,
    episode: episode
  });
  
  if(episodes.length == episodes.finalLength){
    episodes.onComplete(episodes);
  }
}
