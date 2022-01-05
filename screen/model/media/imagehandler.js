
const MediaHandler = require('./mediahandler');
const path = require('path');

module.exports = class ImageHandler extends MediaHandler {

    init(createMessage) {
        super.init(createMessage);
        this.uiWrapper.innerHTML = `<img id = 'image-${this.id}' class = 'image-media' src = '${createMessage.asset}'>`;
        this.clipName = path.parse(createMessage.asset).name;
    }

    getState() {
        return {
            ...super.getState(),
            effectType: 'image',
            name: this.clipName
        };
    }

    handleMessage(msg) {
        switch (msg.command) {
            default:
                return super.handleMessage(msg);
        }
    }

};
