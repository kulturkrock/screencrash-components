
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

    populateUI(uiElement, createMessage){
        uiElement.innerHTML = `
            <video id = "video-${this.id}" class = "video-media" autoplay="autoplay" muted>
                <source src="${createMessage.resource}" type="video/mp4" />
            </video>
        `;
        
        this.videoNode = uiElement.getElementsByTagName("video")[0];
        this.videoNode.onended = (e) => this.destroy();
    }

}