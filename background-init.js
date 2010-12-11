$(init);

function init(){
  chrome.cookies.get({ url: 'https://www.google.com/calendar', name: 'secid' }, onCookie)
}

function onCookie(c){
  window.cal_secid = c.value;
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
    if(request.value == "secid"){
      sendResponse({ secid: window.cal_secid });
    }
  });
}