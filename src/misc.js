const allCookies = document.cookie;
console.log(allCookies);
const BodyElement = document.getElementsByTagName('body')[0];
if (allCookies == ""){
    let LoginButton = document.createElement('iframe');
    LoginButton.src = "https://script.google.com/macros/s/AKfycbxAWMDeN52QJUZbTEpnkYtVdfwZjH0SMil2o19ZkjrzNSCJ6HYlDZAv4Ld4D_HCHbqUMg/exec";
    BodyElement.appendChild(LoginButton);
}else{
    let sessionID_info = document.createElement('p1');
    sessionID_info.textContent = allCookies;
    BodyElement.appendChild(sessionID_info);
}