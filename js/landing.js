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
 * Required Files: landing.html
 * Description: Modifies UI based on user's actions
 * 				Only alloys playback feature of OpenTok API
 */

	flag_widget = false;
	
	$(document).ready(function() {
		init();
		$("#play_button").click(function() {
				$("#static_screen").fadeOut('slow', function() {
					$("#tb_playback_container").css("visibility", "visible");
					$("#static_screen").css("z-index", 50);
					$("#tb_playback_container").css("z-index", 100);
					loadArchive();
				});
		});
		$("#teardrop_logo").click(function() {
			window.open('http://www.tokbox.com');
		});
		
		window.onresize = function(){
			$("#teardrop_logo").css("bottom", "10px");
		};
	});