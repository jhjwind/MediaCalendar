// define addEvent() or something, work out background<->content_script communication / calls

$(init);

function init(){
  console.log(chrome.extension.getBackgroundPage().cal_secid);
  //addEvent({ text: 'kool Event' }, function(d){ console.log(d) });
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
    src: 'v51jeoda1vqo1jcr6hsf2t076s@group.calendar.google.com', // localStorage['MediaCalendar.calendarID'];
    dates: '20101213T203000/20101213T213000',
    scp: 'ONE',
    secid: 'iA8LQPSNHF4LzESYt_OUdTTDNKU'
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