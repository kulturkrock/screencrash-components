
const MediaHandler = require('./mediahandler');

module.exports = class ImageHandler extends MediaHandler {

    constructor(id, dom){
        super(id, dom);
    }

    init(createMessage){
        this.uiWrapper.innerHTML = `<img id = 'image-${this.id}' class = 'image-media' src = '${createMessage.resource}'>`; 
    }

    handleMessage(msg){

        switch(msg.command){
            default:
                super.handleMessage(msg);
        }
    }
}