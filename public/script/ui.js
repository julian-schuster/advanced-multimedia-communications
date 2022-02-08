sOpen = true;
camOpen = true;

function handleSidebar() {
    sidebar = document.getElementById("sidebar_right");
    arrow = document.getElementById("arrow");  
    if(sOpen){
        sidebar.style.right = "-300px";
        arrow.style.transform = "rotate(-225deg)";
        arrow.style.marginLeft = "15px";
        sOpen=false;
    }else{
        sidebar.style.right = "0px";
        arrow.style.transform = "rotate(-45deg)";
        arrow.style.marginLeft = "10px";
        sOpen=true;
    }
}

function handleCam() {
    cam = document.getElementById("broadcastborder");
    arrow = document.getElementById("cArrow");  
    if(camOpen){
        cam.style.bottom = "-462px";
        arrow.style.transform = "rotate(-135deg)";
        arrow.style.marginTop = "15px";
        camOpen=false;
    }else{
        cam.style.bottom = "0px";
        arrow.style.transform = "rotate(45deg)";
        arrow.style.marginTop = "8px";
        camOpen=true;
    }
}