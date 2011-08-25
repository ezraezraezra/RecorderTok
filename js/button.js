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
var TB_Recorder_Button = function(){
	/*
	 * Required Files: recorder.html
	 * 				   img/widget/widget_button.png
	 * 				   img/widget/close_button.png
	 * Description: Injects HTML with inline CSS onto user's website
	 *              Injects record button, record button counter (iFrame), modal view, and recorder widget (iFrame)
	 */
	var message_count = "123";
	var iframe;
	var modal;
	var t_out;
	var t_hover;
	var close_button;
	var button;
	var button_cover;
	var button_container_style;
	var button_normal_style;
	var cover_style;
	var logo_container_style;
	var logo_container;
	var logo_style;
	var container_style;
	var message_count_style;
	var message_count_div;
	var modal_timer;
	var browswer_name = navigator.appName;
	
	container_style = "width:249px; height: 85px; background-color: transparent; position: relative;";
	message_count_style = "width:50px; height: 20px; background: transparent; position: absolute; top: 5px; right: 1px; text-align: center; color: white; font-size:16px; font-family:'Lucida Grande'; opacity:1; filter: alpha(opacity=100);";
	button_cover_style = "width:249px; height:52px; background-color:transparent; position: absolute; z-index:50; top:0px; cursor:pointer;";
	
	button_container_style = "width:249px; height: 53px; background: url('img/widget/widget_button.png') no-repeat 0 -44px;";
	button_normal_style = "width:249px; height: 53px; background: url('img/widget/widget_button.png') no-repeat 0 -143px; z-index:0; position:absolute; opacity:0; filter: alpha(opacity=0);";
	logo_container_style = "width:130px; height:20px; background: url('img/widget/logo_button.png') no-repeat 0 0px; position: absolute; bottom:0px; right: 0px; cursor:pointer;";
	message_counter_container_style = "width: 54px; height: 34px; background: url('img/widget/widget_button.png') no-repeat -190px -108px; opacity:0; filter: alpha(opacity=0); position:absolute; right:8px;top:-36px;";
	
	/*
	 * load button & associated items
	 */
	document.write('<div id="tb_root_container" style="' + container_style + '">');
	document.write('<div id="tb_button_container" style="' + button_container_style + '">');
	document.write('<div id="tb_button_normal" style="' + button_normal_style + '"></div>');
	document.write('<div id="tb_button_cover" style="' + button_cover_style + '"></div>');
	document.write('<div id="tb_message_counter_container" style="' + message_counter_container_style + '">');
	document.write('<div id="tb_message_counter" style="' + message_count_style + '">' + message_count + '</div>');
	document.write('</div></div>');
	document.write('<div id="tb_logo_container" style="' + logo_container_style + '"></div>');
	document.write('</div>');
	
	button = document.getElementById("tb_button_normal");
	message_count_div = document.getElementById("tb_message_counter_container");
	button_cover = document.getElementById("tb_button_cover");
	logo_container = document.getElementById("tb_logo_container");
	
	button_cover.onclick = loadModal;
	button_cover.onmouseover = function(){
		opacityModifier(button, 1, 0.2, "increase", 10);
		opacityModifier(message_count_div, 1, 0.2, "increase", 10);
	};
	button_cover.onmouseout = function(){
		opacityModifier(button, 0, 0.2, "decrease", 10);
		opacityModifier(message_count_div, 0, 0.2, "decrease", 10);
	};

	logo_container.onclick = function(){
		window.open("http://www.tokbox.com/opentok/widgets", "_blank");
	};
	logo_container.onmouseover = function(){
		logo_container.style.backgroundPosition = "0px -20px";
	};
	logo_container.onmouseout = function(){
		logo_container.style.backgroundPosition = "0px 0px";
	};
	
	function loadModal(){
		if (modal || iframe || close_button) {
			return;
		}
		close_button = document.createElement("div");
		iframe = document.createElement("iframe");
		modal = document.createElement("div");
		
		close_button.style.background = "url('img/widget/close_button.png')";
		
		close_button.style.width = "27px";
		close_button.style.height = "28px";
		close_button.style.visibility = "hidden";
		close_button.style.opacity = "0";
		close_button.style.cursor = "pointer";
		close_button.style.zIndex = "999999999";
		close_button.style.position = "absolute";
		
		iframe.src = "recorder.html#" + location.href;
		
		iframe.width = 320;
		iframe.height = 297;
		iframe.setAttribute("name", "tb_iframe");
		iframe.setAttribute("id", "tb_iframe");
		iframe.style.position = "absolute";
		iframe.style.border = "none";
		iframe.style.background = "transparent";
		iframe.setAttribute("frameBorder", "0");
		iframe.setAttribute("scrolling", "none");
		iframe.scrolling = "no";
		iframe.style.visibility = "hidden";
		iframe.style.opacity = "0";
		iframe.style.zIndex = "999999995";
		
		if (iframe.onload) {
			iframe.onload = function(){
				close_button.style.visibility = "visible";
				iframe.style.visibility = "visible";
				if (window.message) {
					iframe.contentWindow.postMessage(" ", iframe.src);
				}
			};
		}
		else {
			close_button.style.visibility = "visible";
			iframe.style.visibility = "visible";
		}
		
		modal.setAttribute("id", "tb_modal_container");
		modal.style.backgroundColor = "#000000";
		modal.style.position = "absolute";
		modal.style.top = "0";
		modal.style.left = "0";
		modal.style.padding = "0";
		modal.style.margin = "0";
		modal.style.opacity = "0";
		modal.style.zIndex = "999999990";
		
		positionModal();
		
		document.body.appendChild(modal);
		document.body.appendChild(iframe);
		document.body.appendChild(close_button);
		
		displayModal();
		
		modal.onclick = function(){
			closeTBWidget();
		};
		
		close_button.onclick = function(){
			closeTBWidget();
		};
	}
	
	function displayModal(){
		opacityModifier(modal, 0.4, 0.05, "increase", 50);
		opacityModifier(iframe, 1, 0.05, "increase", 50);
		opacityModifier(close_button, 1, 0.05, "increase", 50);
	}
	
	function opacityModifier(object, goal_value, amount_value, direction, timer_amount) {
		var internal_timer = setTimeout(opacityMod, timer_amount);
		
		function opacityMod() {
			clearTimeout(internal_timer);
			if (browswer_name == 'Microsoft Internet Explorer') {
				temp_goal_value = parseInt(goal_value * 100, 10);
				object.style.filter = "alpha(opacity=" + temp_goal_value + ")";
			}
			else {
				switch(direction) {
					case "increase":
						opacityAlgorithm("<","+", object, amount_value, goal_value, opacityMod);
					break;
					case "decrease":
						opacityAlgorithm(">","-", object, amount_value, goal_value, opacityMod);
					break;
					default:
						console.log("issue?");
				}
			}
		}
		
		function opacityAlgorithm(comparison_expression, operator_sign, object, amount_value, goal_value, opacityMod) {
			if (eval(parseFloat(object.style.opacity) + comparison_expression + goal_value)) {
				object.style.opacity = (parseFloat(eval(object.style.opacity + operator_sign + amount_value)).toFixed(2)) + "";
				setTimeout(opacityMod, timer_amount);
			}
			else {
				object.style.opacity = goal_value;
			}
		}
	}
	
	function closeTBWidget(){
		if (iframe || modal) {
			modal.style.opacity = 0.0;
			iframe.style.opacity = 0.0;
			document.body.removeChild(modal);
			document.body.removeChild(iframe);
			document.body.removeChild(close_button);
			modal = null;
			iframe = null;
			close_button = null;
		}
	}
	
	function positionModal(){
		if(browswer_name == 'Microsoft Internet Explorer') {
			temp_object = document.documentElement.scrollTop;
		}
		else {
			temp_object = document.body.scrollTop;
		}
		
		if (modal) {
			modal.style.width = document.body.scrollWidth + "px";
			modal.style.height = document.body.scrollHeight + "px";
		}
		if (iframe) {
			iframe.style.left = ((document.body.scrollWidth / 2) - (320 / 2)) + "px";
			iframe.style.top = temp_object + ((document.body.clientHeight - 480) / 2) + "px";
		}
		if (close_button) {
			close_button.style.top = (temp_object + ((document.body.clientHeight - 480) / 2) - 14) + "px";
			close_button.style.left = ((document.body.scrollWidth / 2) + (320 / 2) - 16) + "px";
		}
	}
	
	function receiveMessage(event){
		if (iframe.src.indexOf(event.origin) !== 0) {
			return;
		}
		closeTBWidget();
	}
	if(window.message) {
		window.addEventListener("message", receiveMessage, false);
	}
	
	window.onresize = function(){
		positionModal();
	};
	
	
	window.onscroll = function(){
		positionModal();
	};
	
}();
