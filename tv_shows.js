// define addEvent() or something, work out background<->content_script communication / calls

$(function(){ setTimeout(init, 500) });
var secid;

/*
  Gets secid value from background.html
*/
function init(){
  chrome.extension.sendRequest({ value: 'secid' }, init2);
  $('.nb_0_last').after('<br /><div style="margin-left: 10px;"><h3>Schedule TV</h3><input id="addShow" placeholder="Enter show name" type="text" /></div>');
  $('#addShow').after('<input type="button" value="Add Episodes" id="addShowButton" />');
  $('#addShowButton').click(requestEpisodes);
  
  $('#addShowButton').before('<form><input type="radio" checked name="privacy" id="publicOption" value="public" />Public<br /><input type="radio" name="privacy" value="private" />Private</form>');
  
  chrome.extension.sendRequest({ call: 'getShows' }, onShowList);
  
  // appearance changes
  $('.onegpad').hide();
  $('#mainlogo').attr('src', 'http://temp.reclipse.net/crummyLogo.png');
  if(document.title == 'Google Calendar') document.title = 'MediaCalendar';
  $('.logoparent').css('height', '31px');
  //$('#mainnav').css('background', '#f3c3d5');
  //$('#chrome_main1').css('background', '#f3c3d5');
  //#9e0039
}

// store secid in a variable so it's accessible through this file's scope
function init2(cookieResponse){
  secid = cookieResponse.secid;
  createInterface();
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

function formatYTDate(ep){
  var zeroes = '00';
  var date = ep.year + (zeroes.substring(ep.month.length) + ep.month);
  date += zeroes.substring(ep.day.length) + ep.day;
  var hm = ep.time.split(':');
  var h = parseInt(hm[0]);
  var m = parseInt(hm[1]);
  var time1 = 'T' + ep.time.split(':').join('') + '00';
  /*if(m + 30 >= 60){
    h += 1;
    m = (m + 30) % 60;
  }*/
  if(h >= 24) h = 0;
  var hs = h.toString();
  var ms = m.toString();
  var time2 = 'T' + (zeroes.substring(hs.length) + hs) + (zeroes.substring(ms.length) + ms) + '00';
  return date + time2 + '/' + date + time2;
}

function addEvent(params, onResult){
  var names = ['sf', 'output', 'action', 'crm', 'icc', 'erem', 'text', 'location', 'details', 
               'src', 'dates', 'scp', 'secid'];
  
  console.log('Add event: ', localStorage['MediaCalendar.calendarID']);
  
  var defaults = {
    sf: 'true',
    output: 'js',
    action: 'CREATE', 
    crm: 'BUSY',
    icc: $('#publicOption')[0].checked ? 'PUBLIC' : 'PRIVATE',
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