
const VisualHandler = require('./visualhandler');
const path = require('path');

module.exports = class VideoHandler extends VisualHandler {

    constructor(id, dom) {
        super(id, dom);
        this.audioDisabled = (process.env.SCREENCRASH_NO_AUDIO === 'true');
        this.visualDisabled = (process.env.SCREENCRASH_NO_WINDOW === 'true');
    }

    init(createMessage, resourcesPath) {
        super.init(createMessage, resourcesPath);

        const videoPath = `${resourcesPath}/${createMessage.asset}`;
        const autostart = createMessage.autostart === undefined || createMessage.autostart;
        this.uiWrapper.innerHTML = `
            <video id = "video-${this.id}" class = "video-media" ${this.audioDisabled ? 'muted' : ''} ${autostart ? 'autoplay' : ''}>
                <source src="${videoPath}" type="video/mp4" />
            </video>
        `;

        // Set up events and basic data
        this.videoNode = this.uiWrapper.getElementsByTagName('video')[0];
        this.videoNode.addEventListener('error', this.onError.bind(this), true);
        this.videoNode.onended = this.onEnded.bind(this);
        this.videoNode.onloadeddata = this.onLoadedData.bind(this);
        this.videoNode.ontimeupdate = this.onTimeUpdated.bind(this);
        this.videoNode.onvolumechange = this.onVolumeChanged.bind(this);
        this.nofLoops = (createMessage.looping ? createMessage.looping : 1) - 1;
        this.lastRecordedTime = -1;

        // Variables to keep track of fade out on end
        this.finalFadeOutTime = createMessage.fadeOut || 0;
        this.finalFadeOutStarted = false;

        // Set name of this handler
        this.name = path.parse(createMessage.asset).name;
        if (createMessage.displayName) {
            this.name = createMessage.displayName; // Override name
        }
    }

    getRegularUpdateState() {
        const data = {
            ...super.getRegularUpdateState(),
            effectType: 'video'
        };
        if (!this.visualDisabled) {
            data.currentImage = this.getScreenshot();
        }
        return data;
    }

    getState() {
        const data = {
            ...super.getState(),
            effectType: 'video',
            name: this.name,
            duration: this.getDuration(),
            currentTime: this.getCurrentTime(),
            lastSync: Date.now(),
            playing: this.isPlaying(),
            looping: this.isLooping()
        };
        if (!this.audioDisabled) {
            data.muted = this.isMuted();
            data.volume = this.getVolume();
        }
        if (!this.visualDisabled) {
            data.currentImage = this.getScreenshot();
        }
        return data;
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
            case 'set_volume':
                // Fades manually change volume. Avoid that.
                this.stopFade();
                this.setVolume(msg.volume);
                break;
            case 'toggle_mute':
                // Fades manually change volume. Avoid that.
                this.stopFade();
                this.setMuted(!this.isMuted());
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
        return this.videoNode ? Math.round(this.videoNode.volume * 100) : 0;
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
            this.stopFade(this.finalFadeOutStarted);
            this.finalFadeOutStarted = false;
        }
    }

    setMuted(muted) {
        if (this.videoNode && !this.audioDisabled) {
            this.videoNode.muted = muted;
        }
    }

    setVolume(volume) {
        if (this.videoNode && !this.audioDisabled) {
            this.videoNode.volume = volume / 100;
        }
    }

    setupFade(from, to) {
        super.setupFade(from, to);
        if (!this.audioDisabled) {
            const startVolume = (from == null ? this.getVolume() : from * 100);
            this.currentFade.startVolume = startVolume;
            this.currentFade.currentVolume = startVolume;
            this.currentFade.volumePerStep = (to * 100 - startVolume) / this.currentFade.stepsLeft;
            this.currentFade.targetVolume = to * 100;
            this.setVolume(startVolume);
        }
    }

    runFadeStep(isLastStep) {
        super.runFadeStep(isLastStep);
        if (!this.audioDisabled) {
            if (isLastStep) {
                this.setVolume(this.currentFade.targetVolume);
            } else {
                this.currentFade.currentVolume += this.currentFade.volumePerStep;
                this.setVolume(Math.round(this.currentFade.currentVolume));
            }
        }
    }

    stopOnFadeDone() {
        this.emitEvent('event', { event: 'video_ended', entityId: this.id });
        super.stopOnFadeDone();
    }

    isFadeStepAllowed() {
        return super.isFadeStepAllowed() && this.isPlaying();
    }

    resetFade() {
        super.resetFade();
        if (!this.audioDisabled) {
            this.setVolume(this.currentFade.startVolume);
        }
    }

    onError() {
        this.emitError(`Unable to play video with id ${this.id}`);
        this.destroy();
    }

    onEnded() {
        if (this.nofLoops === 0) {
            this.destroy();
            this.emitEvent('event', { event: 'video_ended', entityId: this.id });
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

    onVolumeChanged() {
        this.emitEvent('changed', this.id);
    }

    onTimeUpdated(event) {
        if (this.finalFadeOutTime > 0 && !this.finalFadeOutStarted) {
            const timeLeft = (this.getDuration() - this.getCurrentTime()) + (this.nofLoops * this.getDuration());
            if (timeLeft < this.finalFadeOutTime) {
                this.finalFadeOutStarted = true;
                this.startFade(this.finalFadeOutTime, null, 0.0, true);
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
