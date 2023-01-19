const express = require('express')
const imgur = require('imgur')
const fs = require('fs')
const imgurUploader = require('imgur-uploader');

export const uploadOnImgur = async (filename: string) => {
    const path = 'public/'+filename
    console.log(path)
    return await imgurUploader(fs.readFileSync(path)).then((data: any) => {
        console.log(data.link);
        return data.link;
    });
}
