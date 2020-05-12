
const MediaHandler = require('./mediahandler');

module.exports = class VideoHandler extends MediaHandler {

    constructor(id, dom){
        super(id, dom);
    }

    handleMessage(msg){
        if (!msg.command){
            return;
        }

        switch(msg.command){
            default:
                super.handleMessage(msg);
        }
    }

    populateUI(uiElement){
        uiElement.innerHTML = "Video object";
    }

}