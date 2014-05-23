$(function() {
$("#cta").on('click', function() {
    $(".banner").toggleClass('bannerClicked');
    document.getElementById("ctaUP").style.display="";
    document.getElementById("cta").style.display="none";
});

$("#ctaUP").on('click', function(){
    $(".banner").toggleClass('bannerClicked');
    document.getElementById("cta").style.display="";
    document.getElementById("ctaUP").style.display="none";
});
});