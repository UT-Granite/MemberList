const BodyElement = document.getElementsByTagName('body')[0];
let sessionID;
let userHash;

window.addEventListener('message',function(e){
    switch (e.data.action){
        case 'sessionID':
            sessionID = e.data.message;
            userHash = e.data.userHash;
            let sessionID_info = document.createElement('p1');
            sessionID_info.textContent = sessionID;
            BodyElement.appendChild(sessionID_info);
            break;
    }
})

try{
    window.opener.postMessage({
        action:'Notification',
        message:'1',
    },'*');
}catch (e){
    let LoginButton = document.createElement('iframe');
    LoginButton.src = "https://script.google.com/macros/s/AKfycbxAWMDeN52QJUZbTEpnkYtVdfwZjH0SMil2o19ZkjrzNSCJ6HYlDZAv4Ld4D_HCHbqUMg/exec";
    BodyElement.appendChild(LoginButton);
}