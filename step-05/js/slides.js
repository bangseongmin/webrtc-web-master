var slides = document.querySelector('.slides'),
    slide = document.querySelectorAll('.slides li'),
    currentIdx = 0,
    slideCount = slide.length,
    slideWidth = 200,
    slideMargin = 30,
    attendCount = document.getElementById("attendCount"),
    prevBtn = document.querySelector('.prev'),
    nextBtn = document.querySelector('.next');


slides.style.width = (slideWidth+slideMargin)*slideCount - slideMargin +'px';

function moveSlide(num){
    slides.style.left = -num*230+'px';
    currentIdx = num;
}

nextBtn.addEventListener('click', function(){
    attendCount = document.getElementById("attendCount");
    if(currentIdx<= slideCount){
        if(currentIdx+3 < attendCount.value){
            alert("attendCount"+attendCount.value);
            alert("currentIdx"+currentIdx);
            moveSlide(currentIdx+1);
            alert("이동 성공");
        }else {
            alert("인원 미달");
        }
    }else{
        moveSlide(0);
    }

})

prevBtn.addEventListener('click', function(){
    if(currentIdx > 0){
        moveSlide(currentIdx-1);
    }else{
        if(currentIdx-1 >0)
            moveSlide(slideCount-2);
    }
})

// 메인 화면 전환
function swapScreen(selectedIdx){
    const videos = document.querySelectorAll('.camera');
    const Screen = document.querySelector('.shareScreen');

    Screen.srcObject = videos.item(selectedIdx).srcObject;
}

// 랜덤 값
function rand(min, max) { return Math.floor(Math.random() * (max - min)) + min;}

// attendBtn.addEventListener('click', function(){
//     attendCount++;
//
//     const videos = document.querySelectorAll('.camera');
//
//     // 현재 카메라를 넣으면 됨
//     for(var i=0; i<=attendCount; i++){
//         const item = videos.item(i);
//         let temp  = rand(1, 999999);
//         item.style.backgroundColor = "#"+temp;
//     }
// })