
const MediaHandler = require('./mediahandler');
const path = require('path');

module.exports = class VideoHandler extends MediaHandler {

    init(createMessage, resourcesPath) {
        super.init(createMessage, resourcesPath);

        const videoPath = `${resourcesPath}/${createMessage.asset}`;
        const autostart = createMessage.autostart === undefined || createMessage.autostart;
        this.uiWrapper.innerHTML = `
            <video id = "video-${this.id}" class = "video-media" muted ${autostart ? 'autoplay' : ''}>
                <source src="${videoPath}" type="video/mp4" />
            </video>
        `;

        this.videoNode = this.uiWrapper.getElementsByTagName('video')[0];
        this.videoNode.addEventListener('error', this.onError.bind(this), true);
        this.videoNode.onended = this.onEnded.bind(this);
        this.videoNode.onloadeddata = this.onLoadedData.bind(this);
        this.videoNode.ontimeupdate = this.onTimeUpdated.bind(this);
        this.nofLoops = (createMessage.looping ? createMessage.looping : 1) - 1;
        this.lastRecordedTime = -1;

        this.fadeOutTime = createMessage.fadeOut || 0;
        this.opacityBeforeFadeOut = 1.0;
        this.fadeOutStarted = false;

        this.name = path.parse(createMessage.asset).name;
        if (createMessage.displayName) {
            this.name = createMessage.displayName; // Override name
        }
    }

    getRegularUpdateState() {
        return {
            ...super.getRegularUpdateState(),
            effectType: 'video',
            currentImage: this.getScreenshot()
        };
    }

    getState() {
        return {
            ...super.getState(),
            effectType: 'video',
            name: this.name,
            duration: this.getDuration(),
            currentTime: this.getCurrentTime(),
            lastSync: Date.now(),
            playing: this.isPlaying(),
            looping: this.isLooping(),
            muted: this.isMuted(),
            volume: this.getVolume(),
            currentImage: this.getScreenshot()
        };
    }

    handleMessage(msg) {
        switch (msg.command) {
            case 'play':
                this.play();
                break;
            case 'pause':
                this.pause();
                break;
            case 'seek':
                this.seek(msg.position);
                break;
            default:
                return super.handleMessage(msg);
        }

        // If not handled we have already returned false
        return true;
    }

    isPlaying() {
        return this.videoNode &&
               !this.videoNode.paused &&
               !this.videoNode.ended &&
               this.videoNode.readyState > 2;
    }

    isLooping() {
        return this.nofLoops !== 0;
    }

    getDuration() {
        return this.videoNode ? this.videoNode.duration : 0;
    }

    getCurrentTime() {
        return this.videoNode ? this.videoNode.currentTime : 0;
    }

    isMuted() {
        return this.videoNode ? this.videoNode.muted : false;
    }

    getVolume() {
        return this.videoNode ? this.videoNode.volume : 0;
    }

    getScreenshot() {
        const canvas = document.createElement('canvas');
        canvas.width = this.videoNode.clientWidth;
        canvas.height = this.videoNode.clientHeight;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.videoNode, 0, 0, canvas.width, canvas.height);

        const result = canvas.toDataURL('image/jpeg', 0.1);
        return result;
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

    seek(position) {
        if (this.videoNode && position !== undefined && position !== null) {
            this.videoNode.currentTime = position;
            this.resetFadeOut();
        }
    }

    resetFadeOut() {
        if (this.fadeOutStarted) {
            this.stopFade();
            this.fadeOutStarted = false;
            this.setOpacity(this.opacityBeforeFadeOut);
        }
    }

    // Override fade function in mediahandler.js
    fade(stepDuration, stepsLeft, opacityPerStep, finalOpacity, onFadeDone) {
        if (this.isPlaying()) {
            super.fade(stepDuration, stepsLeft, opacityPerStep, finalOpacity, onFadeDone);
        } else {
            this.currentFadeTimer = setTimeout(this.fade.bind(this, stepDuration, stepsLeft, opacityPerStep, finalOpacity, onFadeDone), stepDuration);
        }
    }

    onError() {
        this.emitError(`Unable to play video with id ${this.id}`);
        this.destroy();
    }

    onEnded() {
        if (this.nofLoops === 0) {
            this.destroy();
        } else {
            if (this.nofLoops > 0) {
                this.nofLoops -= 1;
            }
            this.play();
        }
    }

    onLoadedData() {
        this.emitEvent('changed', this.id);
    }

    onTimeUpdated(event) {
        if (this.fadeOutTime > 0 && !this.fadeOutStarted) {
            const timeLeft = (this.getDuration() - this.getCurrentTime()) + (this.nofLoops * this.getDuration());
            if (timeLeft < this.fadeOutTime) {
                this.opacityBeforeFadeOut = this.getOpacity();
                this.fadeOutStarted = true;
                this.doFade(this.fadeOutTime, null, 0.0, true);
            }
        }

        const currentTime = this.videoNode.currentTime;
        if (currentTime < this.lastRecordedTime && currentTime > 0) {
            // Time has changed backwards. Either we looped over and
            // started over or we time jumped. In both cases, we probably
            // want to notify the world about this change.
            this.emitEvent('changed', this.id);
        }
        this.lastRecordedTime = currentTime;
    }

};
