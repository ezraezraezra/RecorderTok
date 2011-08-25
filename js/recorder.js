/*
 * Project:     Recorder Embed Widget
 * Description: Initial prototype of the recorder embed widget for
 *              TokBox using the beta Archive API. User inserts one
 *              line of HTML into their document, which loads a JS
 *              file that injects the widget into the page.          
 * Website:     http://recorder.opentok.com
 * 
 * Author:      Ezra Velazquez
 * Website:     http://ezraezraezra.com
 * Date:        August 2011
 * 
 */

/*
 * Required Files: recorder.html, tb.js
 * Required Libraries: jQuery
 * Required PlugIns: jQuery Validation
 * Description: Modify widget's UI based on user's actions
 *              Call OpenTok API functions based on user's actions
 *              Record timer & validation functions
 */
var timer_countdown;
var origin_object;
	flag_widget = true;
	
	var API = function() {
		
		function sendSuccess (data) {
			// body...
		}

		function sendFailed (data) {
			// body...
		}
		
		return {
			
			sendMessage: function(archiveId, fromName, fromEmail){
				var jsonUrl = RECORDER_ID + "/archive/" + archiveId + "/send?fromName=" + fromName + "&fromEmail=" + fromEmail;
				$.ajax({
					type: "GET", 
					url: jsonUrl,
					dataType: 'json',
					success: sendSuccess,
					error : sendFailed
				});
			}
			
		};
	}();
	
	$(document).ready(function() {
		init();
		
		/*
		 * Hide the controller flash object, which looks like a dead pixel
		 */
		$("#controller_"+ SESSION_ID).css("position", "absolute");
		$("#controller_" + SESSION_ID).css("right", "2px");
		$("#controller_" + SESSION_ID).css("top", "0px");
		
		$("#opentok_link").click(function() {
			window.open("http://www.tokbox.com/opentok/widgets", "_blank");
		});
		
		$("#record_button").click(function() {
			$("#record_button").fadeOut('slow');
			$("#phase_one_button_container").css("background", "transparent");
			createArchive();
		});
		
		$("#stop_record_button").click(function() {
			stop_record();
		});
		
		$("#stop_playback_button").click(function() {
			stopPlayback();
		});
		
		$("#start_over_button").click(function() {
			$("#stop_record_button_container").css("display", "none");
			$("#stop_playback_button_container").css("display", "none");
			$("#phase_one_button_container").css("background", "url('img/footer/footer_rec_button.png')");
			$("#record_button").css("display", "block");
			$("#phase_two_button_container").css("display", "none");
			$("#phase_one_button_container").css("display", "block");
			
			$("#tb_playback_container").css("visibility","hidden");
			$("#tb_playback_container").css("z-index", 0);
			$("#tb_publisher_container").css("visibility","visible");
			$("#tb_publisher_container").css("z-index", 50);
			
			$("#pop_up_container").fadeOut('slow');
		});
		
		$("#play_button").click(function() {
			$("#countdown_timer_container").css("display", "none");
			$("#stop_record_button_container").css("display", "none");
			$("#phase_two_button_container").css("display", "none");
			$("#phase_one_button_container").css("display", "block");
			$("#pop_up_container").fadeOut('slow');
			startPlayback();
		});
		
		$("#user_email_input").keyup(function(event) {
			if(event.keyCode == 13) {
				$("#send_button").click();
			}
		});
		$("#user_name_input").keyup(function(event) {
			if(event.keyCode == 13) {
				$("#send_button").click();
			}
		});
		$("#send_button").click(function() {
			
			//Check validity of input fields
			$("#user_info_form").validate({
				rules: {
					user_name_input : {
						required: true
					},
					user_email_input : {
						required : true,
						email : true
					}
				},
				messages: {
					user_name_input : {
						required: function(){
							formError(1);
						}
					},
					user_email_input : {
						required: function(){
							formError(2);
						},
						email: function(){
							formError(2);
						}
					}
				}
			});
			
			value_email = $("#user_info_form").validate().element("#user_email_input");
			value_name = $("#user_info_form").validate().element("#user_name_input");
			
			if(value_name && value_email) {
				//console.log("valid");
				API.sendMessage(myArchive.archiveId, document.getElementById('user_name_input').value, document.getElementById('user_email_input').value);
				
				$("#thank_you_screen").css("visibility","visible");
				$("#user_email_input").blur();
				$("#user_name_input").blur();
				$("#thank_you_screen").slideDown('800', function() {
					if (window.message) {
						setTimeout(function(){
							origin_object.source.postMessage("close widget", origin_object.origin);
						}, 2000);
					}
				});
				
			}
			else {
				if(value_name) {
					//$("#error_user_name_input").css("visibility", "hidden");
					$("#user_name_label").css("color", "#ffffff")
				}
				if(value_email) {
					//$("#error_user_email_input").css("visibility", "hidden");
					$("#user_email_label").css("color", "#ffffff");
				}
			} 
		});

	});

	function formError(error_number) {
		switch(error_number) {
			case 1:
				//Name missing
				//$("#error_user_name_input").css("visibility", "visible");
				$("#user_name_label").css("color", "#e89e0f");
				$("#user_name_input").focus();
				break;
			case 2:
				//Email wrong or missing
				//$("#error_user_email_input").css("visibility", "visible");
				$("#user_email_label").css("color", "#e89e0f");
				$("#user_email_input").focus();
				break;
			default:
				//console.log("Validation Error Number: "+error_number);
		}
	}
	
	function start_timer_countdown(curr_time) {
		// Timer still valid
		if(curr_time >= 0) {
			// Get seconds
			curr_time_seconds = curr_time/1000;
			// Get minutes
			curr_time_minutes = parseInt(curr_time_seconds/60, 10);
			curr_time_seconds = curr_time_seconds - (curr_time_minutes * 60);
			curr_time_seconds_tens = parseInt(curr_time_seconds/10, 10);
			curr_time_seconds_ones = curr_time_seconds - (curr_time_seconds_tens * 10);
			
			$("#countdown_timer_container").html(curr_time_minutes+":"+curr_time_seconds_tens+""+curr_time_seconds_ones);

			curr_time -= 1000;
			timer_countdown = setTimeout(function() {start_timer_countdown(curr_time);},1000);
		}
		else {
			stop_record();
		}
	}
	
	function stop_record() {
		stopRecordingSession();
		$("#phase_one_button_container").css("display", "none");
		$("#phase_two_button_container").css("display", "block");
		clearTimeout(timer_countdown);
		$("#countdown_timer_container").html("10:00");
		$("#countdown_timer_container").css("display", "none");
		$("#pop_up_container").fadeIn('slow', function() {
			$("#user_name_input").focus();
		});
	}
	
	function pre_record_countdown_timer(display_number) {
		if (display_number > 0) {
			$("#pre_record_display_number").fadeOut(1400, function(){
				$("#pre_record_display_number").html(display_number);
				$("#pre_record_display_number").css("display", "block");
				pre_record_countdown_timer(display_number - 1);
			});
		}
		else {
			$("#pre_record_display_number").fadeOut(1400, function() {
				$("#pre_record_countdown_container").css("display", "none");
				$("#pre_record_display_number").html('3');
				$("#pre_record_display_number").css("display", "block");
				
				$("#stop_record_button_container").css("display", "block");
				$("#countdown_timer_container").css("display", "block");
				start_timer_countdown(600000);
			});
		}
	}	
	
	function receiveMessage(event) {
		origin_object = event;
	}
	
	if(window.message) {
		window.addEventListener("message", receiveMessage, false);
	}
