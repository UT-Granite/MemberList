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

            fetch(`https://script.google.com/macros/s/AKfycbxAWMDeN52QJUZbTEpnkYtVdfwZjH0SMil2o19ZkjrzNSCJ6HYlDZAv4Ld4D_HCHbqUMg/exec?nandi=name&userHash=${userHash}&sessionID=${sessionID}`)
                .then((response)=>response.json())
                .then((data)=>{
                    if (data.ok){
                        const user_name = data.name;
                        const icon_url = data.icon;
                        console.log(icon_url);
                        let user_nameElem = document.createElement('button');
                        user_nameElem.textContent = `${user_name}さんのプロフィールを記入する。`;
                        user_nameElem.onclick = () => {displayForm(user_name,icon_url);}; 
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
    //displayForm("あああ",null);
}



function displayLogin(){
    let LoginButton = document.createElement('iframe');
    LoginButton.src = "https://script.google.com/macros/s/AKfycbxAWMDeN52QJUZbTEpnkYtVdfwZjH0SMil2o19ZkjrzNSCJ6HYlDZAv4Ld4D_HCHbqUMg/exec";
    clearMain();
    MainElement.appendChild(LoginButton);
}

function displayForm(user_name,icon_url){
    clearMain();
    const icon_canvas = document.createElement('canvas');
    let squere_length = Math.min(200,window.innerWidth);
    icon_canvas.width = squere_length;
    icon_canvas.height = squere_length;
    const icon_image = new Image();
    if (icon_url == null){
        icon_image.src = "src/img/noimage.jpg";
    }else{
        icon_image.src = icon_url;
    }
    icon_image.onload = () => {
        const context = icon_canvas.getContext("2d");
        context.drawImage(icon_image,0,0,icon_canvas.width,icon_canvas.height);
    }

    MainElement.appendChild(icon_canvas);

    const real_name_form = document.createElement('input');
    real_name_form.type = "text";
    real_name_form.value = user_name;
    real_name_form.required = true;
    MainElement.appendChild(real_name_form);

    const furigana_name_form = document.createElement('input');
    furigana_name_form.type = "text";
    furigana_name_form.value = "";
    MainElement.appendChild(furigana_name_form);

    const nick_name_form = document.createElement('input');
    nick_name_form.type = "text";
    nick_name_form.value = "";
    MainElement.appendChild(nick_name_form);
    
    const generation_form = document.createElement('input');
    generation_form.type = "number";
    const date = new Date();
    const max_gen = date.getFullYear() - 2017;
    generation_form.min = 1;
    generation_form.max = max_gen;
    generation_form.step = "1";
    generation_form.value = max_gen;
    generation_form.required = true;
    MainElement.appendChild(generation_form);

    const university_form = document.createElement('input');
    university_form.type = "text";
    MainElement.appendChild(university_form);

    const major_form = document.createElement('input');
    major_form.type = "text";
    MainElement.appendChild(major_form);

    createGradeForm();
    

    const hobby_form = document.createElement('textarea');
    hobby_form.required = true;
    MainElement.appendChild(hobby_form);

    const add_button = document.createElement('button');
    add_button.textContent = "質問項目を追加する。";
    add_button.onclick = add_index;
    MainElement.appendChild(add_button);

    const submit_button = document.createElement('button');
    submit_button.textContent = "保存";
    MainElement.appendChild(submit_button);

    const cancel_button = document.createElement('button');
    cancel_button.textContent = "もどる";
    MainElement.appendChild(cancel_button);
}

function clearMain(){
    const mainContents = MainElement.children;
    for (const elem of mainContents){
        elem.remove();
    }
}

function add_index(){
    let form_added_div = document.createElement('div');
    let index_name_form = document.createElement('input');
    index_name_form.type = "text";
    form_added_div.appendChild(index_name_form);
    let index_content_form = document.createElement('input');
    index_content_form.type = "text";
    form_added_div.appendChild(index_content_form);
    let delete_button = document.createElement('button');
    delete_button.textContent = "削除";
    delete_button.onclick = () => {form_added_div.remove();};
    form_added_div.appendChild(delete_button);
    MainElement.appendChild(form_added_div);
}

function createGradeForm(){
    let grade_form = document.createElement('select');
    const grade_list = ["学部1年","学部2年","学部3年","学部4年","学部5年","学部6年","修士1年","修士2年","博士1年","博士2年","博士3年","博士4年","記載しない"];
    for (let list of grade_list){
        const list_elm = document.createElement('option');
        list_elm.value = list;
        list_elm.textContent = list;
        grade_form.appendChild(list_elm); 
    }
    MainElement.appendChild(grade_form);
}