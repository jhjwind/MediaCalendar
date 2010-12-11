function clickButton(id) {
	var fireOnThis = document.getElementById(id);
	console.log(fireOnThis);
	var evObj = document.createEvent('MouseEvents');
	evObj.initEvent('mousedown', true, false);
	fireOnThis.dispatchEvent(evObj);
	
	console.log("event fired");
}

function createEvent() {
	
	var btnContentAdd = $(".goog-inline-block.goog-imageless-button");
	// console.log(btnContentAdd);
	if (btnContentAdd)  {
		var btnID = "btnContentAdd";
		btnContentAdd[1].setAttribute("id", btnID);
		clickButton(btnID);
	}
	else{
		console.log("button not found");
	}
	
}

function addCalendar() {
	
	// Get Username
	var username = $('#guser .gb4').html().replace(/@.*/, '');
	console.log(username);
	
	// Send request for creating a calendar
	$.ajax({
	   type: "POST",
	   url: "https://www.google.com/calendar/editcaldetails",
		 data: "ncal=true&dtid=_new_calendar_id_0&cn="+ username +"%20MediaCalendar&details=My%20Media%20Calendar&location=&gl=US&ctz=America%2FNew_York&ap=X19wdWJsaWNfcHJpbmNpcGFsX19AcHVibGljLmNhbGVuZGFyLmdvb2dsZS5jb20&ap=20&secid=HpuHBWa7gWOI0b3T6CEDBHolm54",
	   dataType: "text",
		 success: function(msg) {
			var parts = msg.split(',');
			var calendarID = parts[17].substring(1, parts[17].length-1);
			console.log(calendarID);
			localStorage["MediaCalendar.calendarID"] =  parts[17];
		}
	 });
}

function supports_html5_storage() {
	 try { return 'localStorage' in window && window['localStorage'] !== null;
	 } catch (e) {
	 return false; 
	} 
}

$(document).ready(function(){	
  console.log("loaded");
	
	if(!supports_html5_storage())
	console.log("local storage is not supported");
	else
	console.log("local storage is supported");
	
	// window.localStorage.clear();
	
	if( ! (localStorage["MediaCalendar"] == "true")) {
		// Creat the Calendar
		addCalendar();
		localStorage["MediaCalendar"] = "true";
	}
	else{
		console.log("already exists");
	}
	
	// Select all the media calendar
	var mcId = "MC-sel";
	var mcNumber = $('#calendars_fav .calListLabel').length;
	for (var i= 0; i< mcNumber; i++){
		var mcId = "MC-sel" + i;
		$('#calendars_fav .calListLabel').attr("id", mcId);
		clickButton(mcId);
	}

});
