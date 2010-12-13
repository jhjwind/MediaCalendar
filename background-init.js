$(init);

function init(){
  chrome.cookies.get({ url: 'https://www.google.com/calendar', name: 'secid' }, onCookie);
  
  $.ajax({
    type: 'POST',
    url: 'http://on-my.tv',
    data: {
      timezone: 'US/Eastern',
      style: '5',
      s_sortbyname: '0',
      s_numbers: '1',
      s_sundayfirst: '0',
      s_epnames: '0',
      s_airtimes: '0',
      s_networks: '0',
      s_popups: '1',
      s_wunwatched: '1',
      s_24hour: '1',
      settings: 'Save Settings'
    },
    success: getTVCookie
  });
}

function getTVCookie(data){
  chrome.cookies.get({ url: 'http://on-my.tv', name: '101_UID'}, onTVCookie);
}

function onTVCookie(c){
  console.log('tv cookie: ', c);
}

// this is the google calendar cookie
function onCookie(c){
  window.cal_secid = c.value;
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
    if(request.value == "secid"){
      sendResponse({ secid: window.cal_secid });
    }
  });
}