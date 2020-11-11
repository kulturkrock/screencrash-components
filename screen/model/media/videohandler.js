
const MediaHandler = require('./mediahandler');

module.exports = class VideoHandler extends MediaHandler {

    init(createMessage) {
        super.init(createMessage);

        this.uiWrapper.innerHTML = `
            <video id = "video-${this.id}" class = "video-media" muted>
                <source src="${createMessage.resource}" type="video/mp4" />
            </video>
        `;

        this.videoNode = this.uiWrapper.getElementsByTagName('video')[0];
        this.videoNode.onended = (e) => this.destroy();
    }

    handleMessage(msg) {
        switch (msg.command) {
            case 'play':
                this.play();
                break;
            case 'pause':
                this.pause();
                break;
            default:
                super.handleMessage(msg);
        }
    }

    play() {
        if (this.videoNode) {
            this.videoNode.play();
        }
    }

    pause() {
        if (this.videoNode) {
            this.videoNode.pause();
        }
    }

};
