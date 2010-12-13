function doMousedown(id) {
	var fireOnThis = document.getElementById(id);
	console.log(fireOnThis);
	var evObj = document.createEvent('MouseEvents');
	evObj.initEvent('mousedown', true, false);
	fireOnThis.dispatchEvent(evObj);
	
	console.log("event fired");
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

chrome.extension.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(msg) {
		if(msg.act == "get description") {
		  var desc = $('#eow-description').attr('textContent');
		  port.postMessage({ description: desc });
		}
	});
});

$(document).ready(function(){	
  console.log("loaded");

	setTimeout(function(){
		
		// uncheck all the calendars
		// var mcNumber_sel = $(".calListLabel-sel").length;
		// console.log("mcNumber_sel:   "+ mcNumber_sel);
		// for (var i= 0; i< mcNumber_sel; i++){
		// 	var mcId = "MC" + i;
		// 	$(".calListLabel-sel").attr("id", mcId);
		// 	doMousedown(mcId);
		// }
		
		// hide the calendar view in nav
		$("#dp_0").hide();
		$("#dp_0_t1").hide();
		$("#dp_0_t2").hide();
		
		// remove add/setting in My calendars
		$('#calendars_my_links').hide();
			
		// remove irrelevant calendars
		$('.calListRow .calListChip').each(function () {
				if (!$(this).attr("title").match("MediaCalendar")){
						$(this).parent().remove();
				}
				else{
					console.log($(this).children()[1]);
				}
		});
	},500);

	
	if(!supports_html5_storage())
	console.log("local storage is not supported");
	else
	console.log("local storage is supported");
	
	//window.localStorage.clear();
	
	if( ! (localStorage["MediaCalendar"] == "true")) {
		// Creat the Calendar
		addCalendar();
		localStorage["MediaCalendar"] = "true";
	}
	else{
		console.log("already exists");
	}
});
