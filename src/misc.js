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

            fetch(`https://script.google.com/macros/s/AKfycbxAWMDeN52QJUZbTEpnkYtVdfwZjH0SMil2o19ZkjrzNSCJ6HYlDZAv4Ld4D_HCHbqUMg/exec?info=name&userHash=${userHash}&sessionID=${sessionID}`)
                .then((response)=>response.json())
                .then((data)=>{
                    if (data.ok){
                        const user_name = data.name;
                        let user_nameElem = this.document.createElement('p1');
                        user_nameElem.textContent = user_name;
                        BodyElement.appendChild(user_nameElem);
                    }else{
                        let errElem = this.document.createElement('p1');
                        errElem.textContent = data.error;
                        BodyElement.appendChild(errElem);
                    }
                });

            break;
    }
})

try{
    window.opener.postMessage({
        action:'Notification',
        message:'1',
    },'*');
    
}catch (e){
    displayLogin();
}



function displayLogin(){
    let LoginButton = document.createElement('iframe');
    LoginButton.src = "https://script.google.com/macros/s/AKfycbxAWMDeN52QJUZbTEpnkYtVdfwZjH0SMil2o19ZkjrzNSCJ6HYlDZAv4Ld4D_HCHbqUMg/exec";
    BodyElement.appendChild(LoginButton);
}