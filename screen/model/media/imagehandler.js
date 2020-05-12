
const MediaHandler = require('./mediahandler');

module.exports = class ImageHandler extends MediaHandler {

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
        uiElement.innerHTML = `<img id = 'image-${this.id}' class = 'image-media' src = '${createMessage.resource}'>`; 
    }

}