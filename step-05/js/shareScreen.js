'use strict';

// Polyfill in Firefox.
// See https://blog.mozilla.org/webrtc/getdisplaymedia-now-available-in-adapter-js/
if (adapter.browserDetails.browser == 'firefox') {
    adapter.browserShim.shimGetDisplayMedia(window, 'screen');
}

function handleSuccess(stream) {
    var video = document.querySelector('.shareScreen');
    video.srcObject = stream;
    // var temp;
    // var localVideo = document.querySelector('.camera');

    // temp.srcObject = localVideo.srcObject;
    // localVideo.srcObject = video.srcObject;
    // video.srcObject = temp.srcObject;

    // demonstrates how to detect that the user has stopped
    // sharing the screen via the browser UI.
    stream.getVideoTracks()[0].addEventListener('ended', () => {
        errorMsg('The user has ended sharing the screen');
    });
}

function handleError(error) {
    errorMsg(`getDisplayMedia error: ${error.name}`, error);
}

function errorMsg(msg, error) {

    if (typeof error !== 'undefined') {
        console.error(error);
    }
}

function sharingScreen(){
    navigator.mediaDevices.getDisplayMedia({video: true})
        .then(handleSuccess, handleError)

    return false;
}

if ((navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices)) {
    console.log("shareBtn disabled");
} else {
    errorMsg('getDisplayMedia is not supported');
}
