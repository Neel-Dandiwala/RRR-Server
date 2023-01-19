"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadOnImgur = void 0;
const express = require('express');
const imgur = require('imgur');
const fs = require('fs');
const imgurUploader = require('imgur-uploader');
const uploadOnImgur = async (filename) => {
    const path = 'public/' + filename;
    console.log(path);
    return await imgurUploader(fs.readFileSync(path)).then((data) => {
        console.log(data.link);
        return data.link;
    });
};
exports.uploadOnImgur = uploadOnImgur;
//# sourceMappingURL=ImgurUpload.js.map