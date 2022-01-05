
const MediaHandler = require('./mediahandler');

module.exports = class WebsiteHandler extends MediaHandler {

    init(createMessage) {
        super.init(createMessage);

        this.uiWrapper.innerHTML = `
            <iframe id = "website-frame-${this.id}" class = "website-frame"
                    src = "${createMessage.asset}"
                    frameborder = "0" height="100%" width="100%" scrolling = "no">
            </iframe>
        `;

        this.name = (createMessage.displayName ? `Web: ${createMessage.displayName}` : createMessage.asset);
    }

    getState() {
        return {
            ...super.getState(),
            effectType: 'web',
            name: this.name
        };
    }

    handleMessage(msg) {
        switch (msg.command) {
            default:
                return super.handleMessage(msg);
        }
    }

};
