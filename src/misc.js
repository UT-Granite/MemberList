const BodyElement = document.getElementsByTagName('body')[0];
const HeaderElement = document.getElementsByTagName('header')[0];
const MainElement = document.getElementsByTagName('main')[0];
let sessionID;
let userHash;

window.addEventListener('message',function(e){
    switch (e.data.action){
        case 'sessionID':
            sessionID = e.data.message;
            userHash = e.data.userHash;
            console.log(`sessionID:${sessionID}`);
            console.log(`userHash:${userHash}`);

            fetch(`https://script.google.com/macros/s/AKfycbxAWMDeN52QJUZbTEpnkYtVdfwZjH0SMil2o19ZkjrzNSCJ6HYlDZAv4Ld4D_HCHbqUMg/exec?info=name&userHash=${userHash}&sessionID=${sessionID}`)
                .then((response)=>response.json())
                .then((data)=>{
                    if (data.ok){
                        const user_name = data.name;
                        let user_nameElem = this.document.createElement('button');
                        user_nameElem.textContent = `${user_name}さんの情報を記入する。`;
                        user_nameElem.onclick = displayForm(); 
                        HeaderElement.appendChild(user_nameElem);
                    }else{
                        let errElem = this.document.createElement('button');
                        errElem.textContent = `エラーによりユーザー情報を取得できませんでした。\nもう一度ログイン`;
                        console.log(`ユーザーネーム取得でエラー:${data.error}`);
                        errElem.onclick = displayLogin();
                        HeaderElement.appendChild(errElem);
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
    clearMain();
    MainElement.appendChild(LoginButton);
}

function displayForm(){

    clearMain();
}

function clearMain(){
    const mainContents = MainElement.children;
    for (const elem of mainContents){
        elem.remove();
    }
}