if(typeof RecordRTC_Extension === 'undefined') {
    alert('RecordRTC chrome extension is either disabled or not installed.');
}

// first step
var recorder = new RecordRTC_Extension();
var video = document.querySelector('.shareScreen');      // 녹화할 영상

function processRecording(){
    // 선택 설정 값
    var selectedIdx = document.getElementById("selectedIdx");
    var str = document.querySelectorAll('div.dropup-content a');
    var string = str.item(selectedIdx.value).innerHTML;

    selectedIdx.setAttribute('value', string);

    // 화면 공유 옵션 선택
    var options = recorder.getSupoortedFormats()[selectedIdx.value];

    if(document.getElementById('recordBtn').innerHTML == "녹화 중지"){
        console.log("녹화 중지");
        recorder.stopRecording(stopRecordingCallback);

        var string = document.getElementById('recordBtn').innerHTML;
        var replacedString = string.replace("녹화 중지", "녹화");
        document.getElementById('recordBtn').innerHTML = replacedString;

        return false;
    }
    console.log("녹화 시작");
    recorder.startRecording(options, function() {
        var string = document.getElementById('recordBtn').innerHTML;
        var replacedString = string.replace("녹화", "녹화 중지");
        document.getElementById('recordBtn').innerHTML = replacedString;
    });

    return false;
}

function stopRecordingCallback(blob) {
    video.src = video.srcObject = null;
    video.src = URL.createObjectURL(blob);
    downloadRecording(blob);
    recorder = null;
}

function downloadRecording(blob){
    // const blob = new Blob(recordedBlobs, {type: 'video/webm'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'test.webm';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
}

function setRecordSet(idx){
    var temp = document.getElementById("selectedIdx");

    alert("변경 전 : "+temp.value);
    temp.setAttribute('value', idx);
    alert("변경 후 : "+temp.value);

    return false;
}