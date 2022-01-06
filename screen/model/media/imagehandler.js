
const MediaHandler = require('./mediahandler');

module.exports = class ImageHandler extends MediaHandler {

    init(createMessage) {
        super.init(createMessage);
        this.uiWrapper.innerHTML = `<img id = 'image-${this.id}' class = 'image-media' src = '${createMessage.asset}'>`;
    }

    getRegularUpdateState() {
        return {
            ...super.getRegularUpdateState(),
            effectType: 'image'
        };
    }

    getState() {
        return {
            ...super.getState(),
            effectType: 'image'
        };
    }

    handleMessage(msg) {
        switch (msg.command) {
            default:
                return super.handleMessage(msg);
        }
    }

};
