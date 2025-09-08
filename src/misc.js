const testMode = false;

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

            displayList_onlyMain();
            try{
                getExistingUserInfo();
            }catch(e){
            console.log("ファイルが見つかりませんでした。");

                try{
                fetch(`https://script.google.com/macros/s/AKfycbxAWMDeN52QJUZbTEpnkYtVdfwZjH0SMil2o19ZkjrzNSCJ6HYlDZAv4Ld4D_HCHbqUMg/exec?info=nandi&userHash=${userHash}&sessionID=${sessionID}`)
                .then((response)=>response.json())
                .then((data)=>{
                    getNewUserInfo(data);
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

async function getNewUserInfo(data){
    if (data.ok){
        const user_name = data.name;
        const icon_url = data.icon;
        displayEditProfileButton(user_name,icon_url);
    }else{
        let errElem = this.document.createElement('button');
        errElem.textContent = `エラーによりユーザー情報を取得できませんでした。\nもう一度ログイン`;
        console.log(`ユーザーネーム取得でエラー:${data.error}`);
        errElem.onclick = displayLogin();
        HeaderElement.appendChild(errElem);
    }
}

async function getExistingUserInfo(){
    await fetch(`./data/${userHash}`).then((response) => {
        return(response.text());
    }).then((data) => {
        const decrypted_data = JSON.parse(CryptoJS.AES.decrypt(data,AES_Key).toString(CryptoJS.enc.Utf8));
        console.log(decrypted_data);
        my_info = decrypted_data;
        const user_name = decrypted_data.name;
        displayEditProfileButton(user_name,decrypted_data.icon_url);
    });
}

try{
    window.opener.postMessage({
        action:'Notification',
        message:'1',
    },'*');
    
}catch (e){
    displayLogin();
    //displayForm("あああ",null);
}

function clearHeader(){
    while(HeaderElement.firstChild){
        HeaderElement.removeChild(HeaderElement.firstChild);
    }
}

function displayEditProfileButton(name,icon_url){
    clearHeader();
    const user_nameElem = document.createElement('button');
    user_nameElem.textContent = `${name}さんのプロフィールを記入する。`;
    user_nameElem.onclick = () => {displayForm(name,icon_url);};
    HeaderElement.appendChild(user_nameElem);
}


function displayLogin(){
    const trueIframeSrc = "https://script.google.com/macros/s/AKfycbxAWMDeN52QJUZbTEpnkYtVdfwZjH0SMil2o19ZkjrzNSCJ6HYlDZAv4Ld4D_HCHbqUMg/exec";
    const testIframeSrc = "./test/loginButton.html";
    const loginGridElm = document.createElement('div');
    loginGridElm.id = "loginGrid";
    const contentElm = document.createElement('div');
    contentElm.id = "loginContent";
    loginGridElm.appendChild(contentElm);
    const homeLogoElm = document.createElement('img');
    homeLogoElm.src = "src/img/MemberListLogo.svg";
    homeLogoElm.id = "homeLogo";
    contentElm.appendChild(homeLogoElm);
    let LoginButton = document.createElement('iframe');
    LoginButton.allowtransparency = "true";
    LoginButton.scrolling = "no";
    LoginButton.src = trueIframeSrc;
    contentElm.appendChild(LoginButton);

    clearMain();

    if (testMode){
        const testButtons = document.createElement('div');
        const testLoginButton = document.createElement('button');
        const inputTestname = document.createElement('input');
        testLoginButton.textContent = "テストモードでログイン";
        testLoginButton.style.zIndex = 10;
        testLoginButton.onclick = () => {userHash = "test/"+(inputTestname.value || "000000");testDisplayList();};
        
        inputTestname.type = "text";
        inputTestname.placeholder = "テストユーザーネーム";
        inputTestname.style.zIndex = 10;
        
        testButtons.appendChild(inputTestname);
        testButtons.appendChild(testLoginButton);
        testButtons.style.position = "absolute";
        MainElement.appendChild(testButtons);
    }

    
    MainElement.appendChild(loginGridElm);

}



function displayImageEditor(user_name,icon_url){
    clearHeader();
    clearMain();
    let icon_src = icon_url;
    const icon_background = document.createElement('div');
    icon_background.id = "icon_background";
    MainElement.appendChild(icon_background);
    const icon_canvas = document.createElement('canvas');
    icon_canvas.id = "icon_canvas";
    icon_canvas.style.cursor = "grab";
    let squere_length = Math.min(256,window.innerWidth);
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let startX,startY;
    let scale = 1;
    icon_canvas.width = squere_length;
    icon_canvas.height = squere_length;
    icon_background.style.width = `${squere_length}px`;
    icon_background.style.height = `${squere_length}px`;

    

    const imgElem = document.getElementById("icon_ref");
    imgElem.src = "src/img/noimage.jpg";
  
    const context = icon_canvas.getContext("2d");
    imgElem.onload = () => {
        offsetX = 0;
        offsetY = 0;
        drawImage()
    }

    

    const file_select_button = document.createElement('label');
    file_select_button.textContent = "画像の変更";
    file_select_button.className = "nomalButton";
    file_select_button.style.display = "block";
    file_select_button.style.marginLeft = "auto";
    file_select_button.style.marginRight = "auto";
    file_select_button.style.width = "fit-content";
    file_select_button.style.paddingLeft = "10%";
    file_select_button.style.paddingRight = "10%";
    file_select_button.style.marginBottom = "30px";
    const file_selector = document.createElement('input');
    file_selector.type = "file";
    file_selector.accept = ".png,.jpeg,.jpg,.HEIC,.tiff"
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
        icon_canvas.style.cursor = "grabbing";
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
    icon_canvas.addEventListener('mouseleave',()=> {isDragging = false; icon_canvas.style.cursor = "grab";});
    icon_canvas.addEventListener('mouseup',()=>{isDragging=false; icon_canvas.style.cursor = "grab";});
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

    icon_background.appendChild(icon_canvas);
    MainElement.appendChild(file_select_button);

    const confirm_button = document.createElement('button');
    confirm_button.textContent = "決定";
    confirm_button.className = "greenButton";
    confirm_button.style.display = "block";
    confirm_button.style.marginLeft = "auto";
    confirm_button.style.marginRight = "auto";
    confirm_button.onclick = async () => {
        const imageData = icon_canvas.toDataURL('image/jpeg',0.9);

            // FormDataオブジェクトを作成
        const formData = new FormData();
        formData.append('imageData', imageData);

        
        if (testMode){
            const link = document.createElement('a');
            link.href = imageData;
            link.download = `${userHash}_icon.jpeg`;
            link.click();
            icon_src = `./data/test/img/${userHash}_icon.jpeg`;
            alert("保存しました。");
        }else{
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
                    icon_src = data.url;
                    alert("保存しました。\n全体の編集画面からも保存してください。");
                }
                else{
                    console.log(`サーバーエラーにより保存できませんでした。:${data.error}`);
                    alert(`サーバーエラーにより保存できませんでした。:${data.error}`);
                }
            })
        }catch (e){
            console.log(`アップロードに問題がありました。:${e.message}`);
            alert(`アップロードに問題がありました。:${e.message}`);
        }
        }
        displayForm(user_name,icon_src);
    }

    MainElement.appendChild(confirm_button);

    const cancel_button = document.createElement('span');
    cancel_button.className = "material-symbols-outlined cancelButton";
    cancel_button.textContent = "close";
    cancel_button.onclick = () => {displayForm(user_name,icon_url);};
    HeaderElement.appendChild(cancel_button);

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
}

async function displayForm(user_name,icon_src_url){
    const formGrid = document.createElement('div');
    formGrid.id = "formGrid";
    
    const member_info = {};
    clearHeader();
    clearMain();
    const iconFrame = document.createElement("div");
    iconFrame.id = "iconFrame";
    const iconElm = document.createElement('img');
    iconElm.src = icon_src_url || "src/img/noimage.jpg";
    iconElm.id = "icon_preview";
    iconFrame.appendChild(iconElm);
    const edit_icon_span = document.createElement('span');
    edit_icon_span.className = "material-symbols-outlined";
    edit_icon_span.textContent = "edit_square";
    iconFrame.appendChild(edit_icon_span);
    edit_icon_span.id = "edit_icon_button";
    edit_icon_span.style.cursor = "pointer";
    edit_icon_span.onclick = () => {displayImageEditor(user_name,icon_src_url);};
    formGrid.appendChild(iconFrame);


    const furiganaFrame = document.createElement("div");
    furiganaFrame.className = "formFrame";
    const furiganaLabel = document.createElement('label');
    furiganaLabel.textContent = "フリガナ";
    furiganaLabel.htmlFor = "furigana_name_form";
    furiganaFrame.appendChild(furiganaLabel);
    const furigana_name_form = document.createElement('input');
    furigana_name_form.id = "furigana_name_form";
    furigana_name_form.className = "formInput";
    furigana_name_form.type = "text";
    furigana_name_form.value = my_info.furigana || "";
    furiganaFrame.appendChild(furigana_name_form);
    formGrid.appendChild(furiganaFrame);
    
    const nameFrame = document.createElement("div");
    nameFrame.className = "formFrame";
    const nameLabel = document.createElement('label');
    nameLabel.textContent = "氏名";
    nameLabel.htmlFor = "real_name_form";
    nameFrame.appendChild(nameLabel);
    const real_name_form = document.createElement('input');
    real_name_form.id = "real_name_form";
    real_name_form.className = "formInput";
    real_name_form.type = "text";
    real_name_form.value = user_name;
    real_name_form.required = true;
    nameFrame.appendChild(real_name_form);
    formGrid.appendChild(nameFrame);
    

    const nick_nameFrame = document.createElement("div");
    nick_nameFrame.className = "formFrame";
    const nick_nameLabel = document.createElement('label');
    nick_nameLabel.textContent = "ニックネーム(あれば)";
    nick_nameLabel.htmlFor = "nick_name_form";
    nick_nameFrame.appendChild(nick_nameLabel);
    const nick_name_form = document.createElement('input');
    nick_name_form.id = "nick_name_form";
    nick_name_form.className = "formInput";
    nick_name_form.type = "text";
    nick_name_form.value = my_info.nick_name || "";
    nick_nameFrame.appendChild(nick_name_form);
    formGrid.appendChild(nick_nameFrame);
    
    const generation_frame = document.createElement("div");
    generation_frame.className = "formFrame";
    const generation_label = document.createElement('label');
    generation_label.textContent = "期";
    generation_label.htmlFor = "generation_form";
    const generation_form = document.createElement('input');
    generation_form.type = "number";
    const date = new Date();
    const max_gen = date.getFullYear() - 2017;
    generation_form.min = 1;
    generation_form.max = max_gen;
    generation_form.step = "1";
    generation_form.value = my_info.roll_in_year ? (my_info.roll_in_year - 2017) : max_gen;
    generation_form.required = true;
    generation_form.id = "generation_form";
    generation_form.className = "formInput";
    generation_frame.appendChild(generation_form);
    generation_frame.appendChild(generation_label);
    generation_frame.style.justifyContent = "left";
    formGrid.appendChild(generation_frame);

    const universityFrame = document.createElement("div");
    universityFrame.className = "formFrame";
    const universityLabel = document.createElement('label');
    universityLabel.textContent = "大学";
    universityLabel.htmlFor = "university_form";
    universityFrame.appendChild(universityLabel);
    const university_form = document.createElement('input');
    university_form.id = "university_form";
    university_form.className = "formInput";
    university_form.type = "text";
    university_form.value = my_info.university || "";
    universityFrame.appendChild(university_form);
    formGrid.appendChild(universityFrame);

    const mejorFrame = document.createElement("div");
    mejorFrame.className = "formFrame";
    const majorLabel = document.createElement('label');
    majorLabel.textContent = "学部/学科等";
    majorLabel.htmlFor = "major_form";
    mejorFrame.appendChild(majorLabel);
    const major_form = document.createElement('input');
    major_form.id = "major_form";
    major_form.className = "formInput";
    major_form.type = "text";
    major_form.value = my_info.major || "";
    mejorFrame.appendChild(major_form);
    formGrid.appendChild(mejorFrame);

    const gradeFrame = document.createElement("div");
    gradeFrame.className = "formFrame";
    const gradeLabel = document.createElement('label');
    gradeLabel.textContent = "学年";
    gradeLabel.htmlFor = "grade_form";
    gradeFrame.appendChild(gradeLabel);
    
    const grade_form = document.createElement('select');
    grade_form.className = "formInput";
    const grade_list = ["学部1年","学部2年","学部3年","学部4年","学部5年","学部6年","修士1年","修士2年","博士1年","博士2年","博士3年","博士4年","記載しない"];
    for (let list of grade_list){
        const list_elm = document.createElement('option');
        list_elm.value = list;
        list_elm.textContent = list;
        grade_form.appendChild(list_elm); 
    }
    grade_form.value = my_info.grade || "記載しない";
    grade_form.id = "grade_form";
    grade_form.className = "formInput";
    gradeFrame.appendChild(grade_form);
    formGrid.appendChild(gradeFrame);

    const hobbyFrame = document.createElement("div");
    hobbyFrame.className = "formFrame";
    const hobbyLabel = document.createElement('label');
    hobbyLabel.textContent = "趣味";
    hobbyLabel.htmlFor = "hobby_form";
    hobbyFrame.appendChild(hobbyLabel);
    
    const hobby_form = document.createElement('textarea');
    hobby_form.required = true;
    hobby_form.value = my_info.hobby || "";
    hobby_form.id = "hobby_form";
    hobby_form.className = "formInput";
    hobbyFrame.appendChild(hobby_form);
    formGrid.appendChild(hobbyFrame);

    const addedDivsFrame = document.createElement("div");
    addedDivsFrame.className = "addedFormFrame";
    formGrid.appendChild(addedDivsFrame);

    const add_button = document.createElement('button');
    add_button.textContent = "質問項目の追加";
    add_button.className = "nomalButton";
    add_button.style.display = "block";
    add_button.style.marginLeft = "auto";
    add_button.style.marginRight = "auto";
    add_button.onclick = () => {add_index(addedDivsFrame);};
    formGrid.appendChild(add_button);

    for (const qanda of Object.entries(my_info.add_questions || {})){
        add_index(addedDivsFrame,[qanda[0],qanda[1]]);
    }

    const submit_button = document.createElement('button');
    submit_button.textContent = "保存";
    submit_button.className = "greenButton";
    submit_button.style.display = "block";
    submit_button.style.marginLeft = "auto";
    submit_button.style.marginRight = "auto";
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

        
        

        member_info.name = real_name_form.value;
        member_info.furigana = furigana_name_form.value;
        member_info.nick_name = nick_name_form.value;
        member_info.roll_in_year = parseInt(generation_form.value) + 2017;
        member_info.university = university_form.value;
        member_info.major = major_form.value;
        if (member_info.grade === "記載しない"){
            member_info.grade = "";
        }else{
            member_info.grade = grade_form.value;
        }
        member_info.hobby = hobby_form.value;
        member_info.icon_url = icon_src_url;
        
        const add_questions = {};
        const addedForms = document.getElementsByClassName("addedForm");
        for (const addedForm of addedForms){
            add_questions[addedForm.children[0].value] = addedForm.children[1].value;
        }
        member_info.add_questions = add_questions;
        const json_data = JSON.stringify(member_info);
        const encrypted_data = CryptoJS.AES.encrypt(json_data,AES_Key).toString();
        
        console.log(encrypted_data);
        if (testMode){
            const blob = new Blob([encrypted_data],{type:"text/plain"});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = userHash;
            a.click();
            alert("保存しました。");
        }else{
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
        }
        displayList(member_info.name,member_info.icon_url);
        /*const decrypted_data = CryptoJS.AES.decrypt(encrypted_data,"testkey").toString(CryptoJS.enc.Utf8);
        console.log(decrypted_data);*/
    }
    formGrid.appendChild(submit_button);

    const cancel_button = document.createElement('span');
    cancel_button.className = "material-symbols-outlined cancelButton";
    cancel_button.textContent = "close";
    cancel_button.onclick = () => {displayList(user_name,icon_src_url);};
    HeaderElement.appendChild(cancel_button);

    const noteElm = document.createElement('p');
    noteElm.textContent = "※プロフィール変更の反映には数分かかります。";
    noteElm.className = "noteText";
    formGrid.appendChild(noteElm);
    MainElement.appendChild(formGrid);
}

function clearMain(){
    while(MainElement.firstChild){
        MainElement.removeChild(MainElement.firstChild);
    }
}

async function testDisplayList(){
    AES_Key = "testkey";
    await fetch("./data/test/testHashList").then((response) => {
        return(response.text());
    }).then((data) => {
        const rawHashList = data.split(',');
        hashList = rawHashList.map((x)=>"test/"+x+".txt");
    });
    try{
        await getExistingUserInfo();
    }catch(e){
        console.log("ファイルが見つかりませんでした。");
        await getNewUserInfo({ok:true,name:userHash,icon:null});
    }
    console.log("hashList:");
    console.log(hashList);
    displayList(userHash,my_info.icon_url);
}

function displayList_onlyMain(){
    clearMain();
    for (const memberHash of hashList){
        addMemberPanel(memberHash);
    }
}

function displayList(user_name,icon_url){
    displayEditProfileButton(user_name,icon_url);
    displayList_onlyMain();
}

function addMemberPanel(memberHash){
    try{
        fetch(`./data/${memberHash}`).then((response) => {
            return(response.text());
        }).then((data) => {
            console.log(CryptoJS.AES.decrypt(data,AES_Key).toString(CryptoJS.enc.Utf8));
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

function add_index(parentElm,defaultValues = ["",""]){
    let form_added_div = document.createElement('div');
    form_added_div.className = "addedForm"
    let index_name_form = document.createElement('input');
    index_name_form.type = "text";
    index_name_form.value = defaultValues[0];
    index_name_form.placeholder = "質問項目";
    index_name_form.className = "formInput";
    form_added_div.appendChild(index_name_form);
    let index_content_form = document.createElement('input');
    index_content_form.type = "text";
    index_content_form.value = defaultValues[1];
    index_content_form.placeholder = "回答";
    index_content_form.className = "formInput";
    form_added_div.appendChild(index_content_form);
    let delete_button = document.createElement('span');
    delete_button.className = "material-symbols-outlined";
    delete_button.textContent = "delete";
    delete_button.onclick = () => {form_added_div.remove();};
    form_added_div.appendChild(delete_button);
    parentElm.appendChild(form_added_div);
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