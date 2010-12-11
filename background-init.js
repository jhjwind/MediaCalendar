$(init);

function init(){
  chrome.cookies.get({ url: 'https://www.google.com/calendar', name: 'secid' }, onCookie)
}

function onCookie(c){
  window.cal_secid = c.value;
}