
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
            case "play":
                this.play(true);
                break;
            case "pause":
                this.play(false);
                break;
            default:
                super.handleMessage(msg);
        }
    }

    populateUI(uiElement, createMessage){
        uiElement.innerHTML = `
            <video id = "video-${this.id}" class = "video-media" muted>
                <source src="${createMessage.resource}" type="video/mp4" />
            </video>
        `;
        
        this.videoNode = uiElement.getElementsByTagName("video")[0];
        this.videoNode.onended = (e) => this.destroy();
    }

    /* Either plays or pauses video, depending on the given argument */
    play(play = true){
        if (this.videoNode){
            if (play){
                this.videoNode.play();
            } else {
                this.videoNode.pause();
            }
        }
    }

}