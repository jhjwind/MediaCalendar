// define addEvent() or something, work out background<->content_script communication / calls

$(init);
var secid;

/*
  Gets secid value from background.html
*/
function init(){
  chrome.extension.sendRequest({ value: 'secid' }, init2);
  $('#maininput').after('<input id="addShow" type="text" />');
  $('#addShow').after('<input type="button" value="Add Episodes" id="addShowButton" />');
  $('#addShowButton').click(requestEpisodes);
  chrome.extension.sendRequest({ call: 'getShows' }, onShowList);
  
  // appearance changes
  $('.onegpad').hide();
  $('#mainlogo').attr('src', 'http://temp.reclipse.net/crummyLogo.png');
  document.title = 'MediaCalendar';
  $('.logoparent').css('height', '31px');
  //$('#mainnav').css('background', '#f3c3d5');
  //$('#chrome_main1').css('background', '#f3c3d5');
  //#9e0039
}

// store secid in a variable so it's accessible through this file's scope
function init2(cookieResponse){
  secid = cookieResponse.secid;
}

function onShowList(shows){
  $('#addShow').autocomplete({ source: shows });
}

function requestEpisodes(){
  chrome.extension.sendRequest({ call: 'contentSchedule', args: [$('#addShow')[0].value] }, addEpisodes);
}

/*
  Add the TV shows to the appropriate MediaCalendar
*/
function addEpisodes(scheduleResponse){
  console.log('addEpisodes', scheduleResponse);
  for(var i = 0; i < scheduleResponse.length; i++){
    var episode = scheduleResponse[i];
    addEvent({
      text: episode.title,
      location: episode.network,
      details: episode.description,
      dates: formatEpisodeDate(episode)
    }, null);
  }
}

function formatEpisodeDate(ep){
  var zeroes = '00';
  var date = ep.year + (zeroes.substring(ep.month.length) + ep.month);
  date += zeroes.substring(ep.day.length) + ep.day;
  var hm = ep.time.split(':');
  var h = parseInt(hm[0]);
  var m = parseInt(hm[1]);
  var time1 = 'T' + ep.time.split(':').join('') + '00';
  if(m + 30 >= 60){
    h += 1;
    m = (m + 30) % 60;
  }
  if(h >= 24) h = 0;
  var hs = h.toString();
  var ms = m.toString();
  var time2 = 'T' + (zeroes.substring(hs.length) + hs) + (zeroes.substring(ms.length) + ms) + '00';
  return date + time1 + '/' + date + time2;
}

function addEvent(params, onResult){
  var names = ['sf', 'output', 'action', 'crm', 'erem', 'text', 'location', 'details', 
               'src', 'dates', 'scp', 'secid'];
  
  var defaults = {
    sf: 'true',
    output: 'js',
    action: 'CREATE', 
    crm: 'BUSY',
    icc: 'PUBLIC',
    text: 'Event Title',
    location: 'Television',
    details: 'Some Description',
    src: localStorage['MediaCalendar.calendarID'],
    dates: '20101213T203000/20101213T213000',
    scp: 'ONE',
    secid: secid
  }
  
  var uri = 'https://www.google.com/calendar/event';
  var post = '';
  for(var i = 0; i < names.length; i++){
    if(i != 0) post += '&';
    if(params.hasOwnProperty(names[i])){
      post += names[i] + '=' + encodeURIComponent(params[names[i]]);
    } else {
      post += names[i] + '=' + encodeURIComponent(defaults[names[i]]);
    }
    
    if(names[i] == 'crm'){
      post += '&sprop=goo.allowModify%3Afalse&sprop=goo.allowInvitesOther%3Atrue&sprop=goo.showInvitees%3Atrue';
    }
    
    if(names[i] == 'dates'){
      post += '&gdoc-attachment';
    }
  }
  
  $.ajax({
    url: uri,
    success: function(s){ onEventAdded(s, onResult) },
    dataType: 'text',
    cache: false,
    type: 'POST',
    data: post
  });
}

function onEventAdded(str, onResult){
  var arr = eval(str.split('while(1);').join(''));
  
  var customEvent = document.createEvent('Event');
  customEvent.initEvent('click', true, true);
  $('.mg-refresh')[0].dispatchEvent(customEvent);
  
  if(onResult) onResult(arr);
}