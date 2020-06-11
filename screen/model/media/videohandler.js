
const MediaHandler = require('./mediahandler');

module.exports = class VideoHandler extends MediaHandler {

    constructor(id, dom){
        super(id, dom);
    }

    init(createMessage){
        this.uiWrapper.innerHTML = `
            <video id = "video-${this.id}" class = "video-media" autoplay="autoplay" muted>
                <source src="${createMessage.resource}" type="video/mp4" />
            </video>
        `;
        
        this.videoNode = this.uiWrapper.getElementsByTagName("video")[0];
        this.videoNode.onended = (e) => this.destroy();
    }

    handleMessage(msg){

        switch(msg.command){
            default:
                super.handleMessage(msg);
        }
    }

}