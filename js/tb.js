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
 * Required Files: recorder.html, landing.html
 * Required Libraries: jQuery
 * Description: OpenTok API response to being called
 */
var subscribers = {};
var mySession;
var publisher;
var myArchive;
var archiveCreated = false;

var flag_widget;

// TB.setLogLevel(TB.ALL);
/*
TB.addEventListener(TB.EXCEPTION, exceptionHandler);
	*/		
// Called when the page is loaded. Initializes an OpenTok session.
function init(){
	if (API_KEY == "" || SESSION_ID == "") {
		var error_message = "This page cannot connect. Please edit the" +
		"API_KEY and SESSION_ID values in the source code.";
		window.document.write(error_message);
		return;
	}
	mySession = TB.initSession(SESSION_ID);
	mySession.addEventListener("sessionConnected", sessionConnectedHandler);
	mySession.addEventListener("sessionDisconnected", sessionDisconnectedHandler);
	mySession.addEventListener("streamCreated", streamCreatedHandler);
	mySession.addEventListener("streamDestroyed", streamDestroyedHandler);
	connect();
}

// Connects to the OpenTok session.
function connect(){
	mySession.connect(API_KEY, TOKEN);
}

// Disconnects from the OpenTok session.
function disconnect(){
	mySession.disconnect();
}

// Called when the user clicks the Publish link. Publishes the local webcam's stream to the session.
function publish(){
	if (!publisher) {
		var div = document.createElement('div');
		div.setAttribute('id', 'publisher');
		var publisherContainer = document.getElementById('tb_publisher_container');
		publisherContainer.appendChild(div);
		var publisherProps = {
			width: 320,
			height: 240,
			publishAudio: true
		};
		publisher = mySession.publish('publisher', publisherProps);
	}
}

// Called when the user clicks the Unpublish link.
function unpublish(){
	if (publisher) {
		mySession.unpublish(publisher);
	}
	publisher = null;
}

/* Called when the session connects. Subscribes existing streams. Adds links in
 * the page to publish and disconnect. For moderators, adds event listeners for
 * events related to archiving.
 */
function sessionConnectedHandler(event){
	if(flag_widget == true) {
		publish();
		
		if (mySession.capabilities.record) {
			mySession.addEventListener("sessionRecordingStarted", sessionRecordingStartedHandler);
			mySession.addEventListener("archiveCreated", archiveCreatedHandler);
			mySession.addEventListener("archiveClosed", archiveClosedHandler);
			mySession.addEventListener("sessionRecordingStopped", sessionRecordingStoppedHandler);
		}
	}
	
	if (mySession.capabilities.playback) {
		mySession.addEventListener("archiveLoaded", archiveLoadedHandler);
		mySession.addEventListener("playbackStarted", playbackStartedHandler);
		mySession.addEventListener("playbackStopped", playbackStoppedHandler);
	}
}

function sessionDisconnectedHandler(event){
	// Remove the publisher
	if (publisher) {
		unpublish();
	}
	// Remove all subscribers
	for (var streamId in subscribers) {
		removeStream(streamId);
	};
}

function streamCreatedHandler(event){
	for (var i = 0; i < event.streams.length; i++) {
		addStream(event.streams[i]);
	}
}

function streamDestroyedHandler(event){
	for (var i = 0; i < event.streams.length; i++) {
		removeStream(event.streams[i].streamId);
		
		if (mySession.getPublisherForStream(event.streams[i]) == publisher) {
			unpublish();
		}
	}
}

function removeStream(streamId){
	var subscriber = subscribers[streamId];
	if (subscriber) {
		var container = document.getElementById(subscriber.id).parentNode;
		
		mySession.unsubscribe(subscriber);
		delete subscribers[streamId];
	}
}

/* Subscribes to a stream and adds it to the page. The type of stream,
 *  "live" or "recorded", is added as a label below the stream display.
 */
function addStream(stream){
	// Do not subscribe to a stream the current user is publishing.
	if (stream.connection.connectionId == mySession.connection.connectionId) {
		
		if(flag_widget == true) {
			$("#phase_one_button_container").fadeIn("slow");
		}
		return;
	}
	
	// Create the container for the subscriber
	var container = document.createElement('div');
	var containerId = "container_" + stream.streamId;
	container.setAttribute('id', containerId);
	container.className = "swfContainer";
	document.body.appendChild(container);
	var playbackContainer = document.getElementById('tb_playback_container');
	
	// Create the div that will be replaced by the subscriber
	var div = document.createElement('div');
	var divId = stream.streamId;
	div.setAttribute('id', divId);
	playbackContainer.appendChild(container);
	container.appendChild(div);
	//if(flag_widget == true) {
		var playbackProps = {
			width: 320,
			height: 240,
			publishAudio: true
		};
	subscribers[stream.streamId] = mySession.subscribe(stream, divId, playbackProps);
}

/* Called in response to the moderator clicking the "Create archive" link.
 * Creates an archive and creates a unique name for it (based on a timestamp).
 */
function createArchive(){
	var uniqueTitle = "archive" + new Date().getTime();
	mySession.createArchive(API_KEY, "perSession", uniqueTitle);
}
			
// Called in response to the archiveCreated event. The moderator can now record the session.
function archiveCreatedHandler(event){
	myArchive = event.archives[0];
	archiveCreated = true;
	//console.log("This is the archive id on archive created: "+ myArchive.archiveId);
	recordSession();
}

function recordSession(){
	mySession.startRecording(myArchive);
}
			
// Called in response to the sessionRecordingStarted event. The moderator can now stop recording.
function sessionRecordingStartedHandler(event){
	//console.log("Session Recording Started Handler");
	
	$("#pre_record_countdown_container").css("display", "block");
	pre_record_countdown_timer(2);
}

/* Called in response to the moderator clicking the "Stop recording" link.
 * Stops the recording.
 */
function stopRecordingSession(){
	mySession.stopRecording(myArchive);
}
			
// Called in response to the sessionRecordingStopped event. The moderator can now close the archive.
function sessionRecordingStoppedHandler(event){
	closeArchive();
}

/* Called in response to the moderator clicking the "Close archive" link.
 * Closes the archive.
 */
function closeArchive(){
	mySession.closeArchive(myArchive);
}

// Called in response to the archiveClosed event. The moderator can now load the archive (and play it back).
function archiveClosedHandler(event){
	loadArchive();
}

/* Called in response to the moderator clicking the "Load archive" link.
 * Loads the archive that was just recorded.
 */
function loadArchive(){
	if(flag_widget == true) {
		mySession.loadArchive(myArchive.archiveId);
		//console.log("This is the archive id on loadArchive: "+ myArchive.archiveId);
	}
	else {
		mySession.loadArchive(playback_archiveId);
		//console.log("This is the archive id on loadArchive: "+ playback_archiveId);
	}
}

// Called in response to the archiveLoaded event. The moderator can now start playing back the archive.
function archiveLoadedHandler(event){
	myArchive = event.archives[0];
	if(flag_widget == false) {
		startPlayback();
	}
}

/* Called in response to the moderator clicking the "Start playback" link.
 * Starts playing back the archive.
 */
function startPlayback(){
	myArchive.startPlayback();
	//console.log("This is the archive id on startPlayback: "+ myArchive.archiveId);
}
			
// Called in response to the playbackStarted event. The moderator can now (optionally) stop playing back the archive.
function playbackStartedHandler(event){
	//console.log("playbackStartedHandler");
	if (flag_widget == true) {
		//console.log("inside flag_widget");
		$("#tb_publisher_container").css("visibility", "hidden");
		$("#tb_publisher_container").css("z-index", 0);
		$("#tb_playback_container").css("visibility", "visible");
		$("#tb_playback_container").css("z-index", 50);
		//$("#stop_playback_button_container").fadeIn("slow");
	}
}

/* Called in response to the moderator clicking the "Stop playback" link.
 * Stops playing back the archive.
 */
function stopPlayback(){
	myArchive.stopPlayback();
}
			
// Called in response to the playbackStopped event. The moderator can now (optionally) play back the archive again.
function playbackStoppedHandler(event){
	if (flag_widget == true) {
		$("#tb_playback_container").css("visibility", "hidden");
		$("#tb_playback_container").css("z-index", 0);
		$("#tb_publisher_container").css("visibility", "visible");
		$("#tb_publisher_container").css("z-index", 50);
		
		$("#phase_one_button_container").css("display", "none");
		$("#phase_two_button_container").css("display", "block");
		$("#pop_up_container").fadeIn('slow');
		$("#user_name_input").focus();
	}
	else {
		$("#static_screen").css("z-index", 100);
		$("#tb_playback_container").css("z-index", 50);
		$("#static_screen").fadeIn('slow');
	}
}

function show(id){
	document.getElementById(id).style.display = "block";
}

function hide(id){
	document.getElementById(id).style.display = "none";
}

function exceptionHandler(event){
	alert("Exception! msg: " + event.message + " title: " + event.title + " code: " + event.code);
}

function reRecordSession() {$("#tb_playback_container").css("visibility","hidden");
	$("#tb_playback_container").css("z-index", 0);
	$("#tb_publisher_container").css("visibility","visible");
	$("#tb_publisher_container").css("z-index", 50);
	
	createArchive();
}
