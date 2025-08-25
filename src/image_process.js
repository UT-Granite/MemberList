async function uploadGyazo(imgData,accessToken){
    const url = "https://upload.gyazo.com/api/upload";
    const payload = {
        method: "POST",
        headers: {'Authorization':`Bearer ${accessToken}`},
        body: imgData
    };

    try {
        const response = await fetch(url,payload);
        if (response.ok){
            const data = await response.json();
            return {ok:true,permalink:data.permlink_url,id:data.image_id,url:data.url};
        }else{
            return {ok:false,message:`画像のアップロードに失敗しました。:${response.status}`}
        }
    }catch (error){
        return {ok:false,message:`fetchエラー:${error.message}`};
    }
}