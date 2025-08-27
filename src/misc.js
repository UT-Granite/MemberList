const BodyElement = document.getElementsByTagName('body')[0];
const HeaderElement = document.getElementsByTagName('header')[0];
const MainElement = document.getElementsByTagName('main')[0];
let sessionID;
let userHash = "000000";
let hashList = [];
let AES_Key;
let my_info = {};

window.addEventListener('message',function(e){
    switch (e.data.action){
        case 'sessionID':
            sessionID = e.data.message;
            userHash = e.data.userHash;
            hashList = e.data.hashList.split(',');
            AES_Key = e.data.aeskey;
            console.log(`sessionID:${sessionID}`);
            console.log(`userHash:${userHash}`);
            console.log(`hashList:${hashList}`);

            displayList();
            try{
                fetch(`./data/xmCIIWinjfj4nQCp18tFNHDf14EhUZaEdg1qEUnGGUw=`).then((response) => {
                    return(response.text());
                }).then((data) => {
                    const decrypted_data = JSON.parse(CryptoJS.AES.decrypt(data,AES_Key).toString(CryptoJS.enc.Utf8));
                    console.log(decrypted_data);
                    my_info = decrypted_data;
                    const user_name = decrypted_data.name;
                    let user_nameElem = document.createElement('button');
                    user_nameElem.textContent = `${user_name}さんのプロフィールを記入する。`;
                    user_nameElem.onclick = () => {displayForm(user_name,my_info.icon_url);}; 
                    HeaderElement.appendChild(user_nameElem);
                });
            }catch(e){
            console.log("ファイルが見つかりませんでした。");

            

            try{
            fetch(`https://script.google.com/macros/s/AKfycbxAWMDeN52QJUZbTEpnkYtVdfwZjH0SMil2o19ZkjrzNSCJ6HYlDZAv4Ld4D_HCHbqUMg/exec?info=nandi&userHash=${userHash}&sessionID=${sessionID}`)
                .then((response)=>response.json())
                .then((data)=>{
                    if (data.ok){
                        const user_name = data.name;
                        const icon_url = data.icon;
                        //console.log(icon_url);
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
                });}catch (e){
                    let errElem = this.document.createElement('button');
                        errElem.textContent = `エラーによりユーザー情報を取得できませんでした。\nもう一度ログイン`;
                        console.log(`fetchに失敗しました。:${data.error}`);
                        errElem.onclick = displayLogin();
                        HeaderElement.appendChild(errElem);
                }
            }

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

async function displayForm(user_name,icon_src_url){
    const member_info = {};

    clearMain();
    const icon_canvas = document.createElement('canvas');
    let squere_length = Math.min(200,window.innerWidth);
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let startX,startY;
    let scale = 1;
    icon_canvas.width = squere_length;
    icon_canvas.height = squere_length;

    

    const imgElem = document.getElementById("icon_ref");
    imgElem.src = "src/img/noimage.jpg";
  
    const context = icon_canvas.getContext("2d");
    imgElem.onload = () => {
        offsetX = 0;
        offsetY = 0;
        drawImage()
    }

    function drawImage(){
        const min_edge = Math.min(imgElem.naturalWidth,imgElem.naturalHeight);
        const img_width = icon_canvas.width*imgElem.naturalWidth/min_edge;
        const img_height = icon_canvas.height*imgElem.naturalHeight/min_edge;
        let x = (icon_canvas.width - scale*img_width)/2 + offsetX;
        let y = (icon_canvas.height - scale*img_height)/2 + offsetY;
        x = climp(x,-img_width,img_width);
        y = climp(y,-img_height,img_height);
        context.clearRect(0,0,icon_canvas.width,icon_canvas.height);
        context.drawImage(imgElem,x,y,scale*img_width,scale*img_height);
    }

    const file_select_button = document.createElement('label');
    file_select_button.textContent = "画像の変更";
    const file_selector = document.createElement('input');
    file_selector.type = "file";
    file_selector.accept = ".png,.jpeg,.jpg,.HEIC"
    file_selector.style.display = "none";
    file_selector.addEventListener("change",(e) => {
        const image_file = e.target.files;
        const reader = new FileReader();
        reader.readAsDataURL(image_file[0]);
        reader.onload = () => {
            imgElem.src = reader.result;
        }
    });
    file_select_button.appendChild(file_selector);

    icon_canvas.addEventListener('mousedown',(e)=>{
        isDragging = true;
        startX = e.offsetX - offsetX;
        startY = e.offsetY - offsetY;
    });
    icon_canvas.addEventListener('touchstart',(e)=>{
        e.preventDefault();
        isDragging = true;
        startX = e.touches[0].pageX - offsetX;
        startY = e.touches[0].pageY - offsetY;
    });
    icon_canvas.addEventListener('mousemove',(e)=>{
        if (isDragging){
            offsetX = e.offsetX - startX;
            offsetY = e.offsetY - startY;
            drawImage();
        }
    });
    icon_canvas.addEventListener('touchmove',(e)=>{
        e.preventDefault();
        if (isDragging){
            offsetX = e.changedTouches[0].pageX - startX;
            offsetY = e.changedTouches[0].pageY - startY;
            drawImage();
        }
    });
    icon_canvas.addEventListener('mouseleave',()=> isDragging = false);
    icon_canvas.addEventListener('mouseup',()=>isDragging=false);
    icon_canvas.addEventListener('touchend',()=>isDragging=false);
    icon_canvas.addEventListener('touchcancel',()=>isDragging=false);
    
    icon_canvas.addEventListener('wheel',(e)=>{
        e.preventDefault();
        scale += -e.deltaY*0.0005;
        if(scale < 0.01){
            scale = 0.01;
        }
        drawImage();
    })

    MainElement.appendChild(icon_canvas);
    MainElement.appendChild(file_select_button);

    const real_name_form = document.createElement('input');
    real_name_form.type = "text";
    real_name_form.value = user_name;
    real_name_form.required = true;
    MainElement.appendChild(real_name_form);

    const furigana_name_form = document.createElement('input');
    furigana_name_form.type = "text";
    furigana_name_form.value = my_info.furigana || "";
    MainElement.appendChild(furigana_name_form);

    const nick_name_form = document.createElement('input');
    nick_name_form.type = "text";
    nick_name_form.value = my_info.nick_name || "";
    MainElement.appendChild(nick_name_form);
    
    const generation_form = document.createElement('input');
    generation_form.type = "number";
    const date = new Date();
    const max_gen = date.getFullYear() - 2017;
    generation_form.min = 1;
    generation_form.max = max_gen;
    generation_form.step = "1";
    generation_form.value = my_info.roll_in_year ? (my_info.roll_in_year - 2017) : max_gen;
    generation_form.required = true;
    MainElement.appendChild(generation_form);

    const university_form = document.createElement('input');
    university_form.type = "text";
    university_form.value = my_info.university || "";
    MainElement.appendChild(university_form);

    const major_form = document.createElement('input');
    major_form.type = "text";
    major_form.value = my_info.major || "";
    MainElement.appendChild(major_form);

    const grade_form = document.createElement('select');
    const grade_list = ["学部1年","学部2年","学部3年","学部4年","学部5年","学部6年","修士1年","修士2年","博士1年","博士2年","博士3年","博士4年","記載しない"];
    for (let list of grade_list){
        const list_elm = document.createElement('option');
        list_elm.value = list;
        list_elm.textContent = list;
        grade_form.appendChild(list_elm); 
    }
    grade_form.value = my_info.grade || "記載しない";
    MainElement.appendChild(grade_form);

    const hobby_form = document.createElement('textarea');
    hobby_form.required = true;
    hobby_form.value = my_info.hobby || "";
    MainElement.appendChild(hobby_form);

    const add_button = document.createElement('button');
    add_button.textContent = "質問項目を追加する。";
    add_button.onclick = add_index;
    MainElement.appendChild(add_button);

    for (const qanda of Object.entries(my_info.add_questions || {})){
        let form_added_div = document.createElement('div');
        form_added_div.className = "addedForm"
        let index_name_form = document.createElement('input');
        index_name_form.type = "text";
        index_name_form.value = qanda[0];
        form_added_div.appendChild(index_name_form);
        let index_content_form = document.createElement('input');
        index_content_form.type = "text";
        index_content_form.value = qanda[1];
        form_added_div.appendChild(index_content_form);
        let delete_button = document.createElement('button');
        delete_button.textContent = "削除";
        delete_button.onclick = () => {form_added_div.remove();};
        form_added_div.appendChild(delete_button);
        MainElement.appendChild(form_added_div);
    }

    const submit_button = document.createElement('button');
    submit_button.textContent = "保存";
    submit_button.onclick = async () => {
        
        /*const icon_upload_response = await new Promise((resolve,reject) => {
            icon_canvas.toBlob((blob)=>{
                if(blob){
                    resolve(blob);
                }else{
                    reject();
                }
            },"image/jpeg",0.9)
            }).then((iconBlob) =>{
                    const iconData = new FormData();
                    iconData.append("imagedata",iconBlob,"icon.jpg");
                    return uploadGyazo(iconData,"-RGqPOwpO_YZyHkORi1N1MD87PvY9u9t2jDwOTCf_SI");
            }).catch((e) =>{
                return {ok:false,message:`アイコンの生成に失敗しました。:${e.message}`};
            });**/

        
        const imageData = icon_canvas.toDataURL('image/jpeg',0.9);

            // FormDataオブジェクトを作成
        const formData = new FormData();
        formData.append('imageData', imageData);

        
        
        try {await fetch(`https://script.google.com/macros/s/AKfycbxAWMDeN52QJUZbTEpnkYtVdfwZjH0SMil2o19ZkjrzNSCJ6HYlDZAv4Ld4D_HCHbqUMg/exec?userHash=${userHash}&sessionID=${sessionID}&postData=icon`
            ,{
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type':'application/x-www-form-urlencoded',
                },
                body: formData,
            }).then((response) => {return response.json();})
            .then((data) => {
                if (data.ok){
                    member_info.icon_url = data.url;
                }
                else{
                    console.log(`サーバーエラーにより保存できませんでした。:${data.error}`);
                    alert(`サーバーエラーにより保存できませんでした。:${data.error}`);
                }
            })}catch (e){
                console.log(`アップロードに問題がありました。:${e.message}`);
                alert(`アップロードに問題がありました。:${e.message}`);
            }

        member_info.name = real_name_form.value;
        member_info.furigana = furigana_name_form.value;
        member_info.nick_name = nick_name_form.value;
        member_info.roll_in_year = parseInt(generation_form.value) + 2017;
        member_info.university = university_form.value;
        member_info.major = major_form.value;
        member_info.grade = grade_form.value;
        member_info.hobby = hobby_form.value;
        
        const add_questions = {};
        const addedForms = document.getElementsByClassName("addedForm");
        for (const addedForm of addedForms){
            add_questions[addedForm.children[0].value] = addedForm.children[1].value;
        }
        member_info.add_questions = add_questions;
        const json_data = JSON.stringify(member_info);
        const encrypted_data = CryptoJS.AES.encrypt(json_data,AES_Key).toString();
        
        console.log(encrypted_data);
        const option = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type':'application/x-www-form-urlencoded',
            },
            body: encrypted_data,
        }
        try {fetch(`https://script.google.com/macros/s/AKfycbxAWMDeN52QJUZbTEpnkYtVdfwZjH0SMil2o19ZkjrzNSCJ6HYlDZAv4Ld4D_HCHbqUMg/exec?userHash=${userHash}&sessionID=${sessionID}&postData=userData`,option)
            .then((response) => {return response.json();})
            .then((data) => {
                console.log("data:");
                console.log(data);
                if (data.ok){
                    console.log("ユーザーデータ保存");
                    alert("保存しました。");
                }else{
                    console.log(`サーバーエラーにより保存できませんでした。:${data.error}`);
                    alert(`サーバーエラーにより保存できませんでした。:${data.error}`);
                }
            }).catch((e) => {
                console.log(`クライアントエラーにより保存できませんでした。:${e.message}`);
                alert(`クライアントエラーにより保存できませんでした。:${e.message}`);
                //alert("保存しました。");
            });
        }catch (e){
            console.log(`アップロードに問題がありました。:${e.message}`);
            alert(`アップロードに問題がありました。:${e.message}`);
        }

        /*const decrypted_data = CryptoJS.AES.decrypt(encrypted_data,"testkey").toString(CryptoJS.enc.Utf8);
        console.log(decrypted_data);*/
    }
    MainElement.appendChild(submit_button);

    const cancel_button = document.createElement('button');
    cancel_button.textContent = "もどる";
    cancel_button.onclick = displayList;
    MainElement.appendChild(cancel_button);
}

function clearMain(){
    while(MainElement.firstChild){
        MainElement.removeChild(MainElement.firstChild);
    }
}

function displayList(){
    clearMain();
    for (const memberHash of hashList){
        addMemberPanel(memberHash);
    }
}

function addMemberPanel(memberHash){
    try{
        fetch(`./data/${memberHash}`).then((response) => {
            return(response.text());
        }).then((data) => {
            const member_info = JSON.parse(CryptoJS.AES.decrypt(data,AES_Key).toString(CryptoJS.enc.Utf8));
            const member_panel = document.createElement('div');
            const member_icon = document.createElement('img');
            member_icon.src = member_info.icon_url || "src/img/noimage.jpg";
            member_icon.width = 100;
            member_icon.height = 100;
            member_panel.appendChild(member_icon);
            const member_furigana = document.createElement('p');
            member_furigana.textContent = member_info.furigana || "";
            member_panel.appendChild(member_furigana);
            const member_name = document.createElement('p');
            member_name.textContent = member_info.name;
            member_panel.appendChild(member_name);
            MainElement.appendChild(member_panel);

            if(member_info.nick_name){
                const member_nick_name = document.createElement('p');
                member_nick_name.textContent = `(${member_info.nick_name})`;
                member_panel.appendChild(member_nick_name);
            }

            const member_generation = document.createElement('p');
            member_generation.textContent = `${member_info.roll_in_year - 2017}期`;
            member_panel.appendChild(member_generation);

            const member_university = document.createElement('p');
            member_university.textContent = member_info.university || "";
            member_panel.appendChild(member_university);

            const member_major = document.createElement('p');
            member_major.textContent = member_info.major || "";
            member_panel.appendChild(member_major);

            const member_grade = document.createElement('p');
            member_grade.textContent = member_info.grade || "";
            member_panel.appendChild(member_grade);

            const member_hobby = document.createElement('p');
            member_hobby.textContent = `趣味:${member_info.hobby || ""}`;
            member_panel.appendChild(member_hobby); 

            for (const qanda of Object.entries(member_info.add_questions || {})){
                const qanda_elem = document.createElement('p');
                qanda_elem.textContent = `${qanda[0]}: ${qanda[1]}`;
                member_panel.appendChild(qanda_elem);
            }

            MainElement.appendChild(member_panel);
        });
    }catch(e){
    
    }
}

function add_index(){
    let form_added_div = document.createElement('div');
    form_added_div.className = "addedForm"
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



function climp(x,min,max){
    if(x < min){
        return min;
    }else if(x > max){
        return max;
    }else{
        return x;
    }
}