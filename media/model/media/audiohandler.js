
const MediaHandler = require('./mediahandler');
const path = require('path');

module.exports = class AudioHandler extends MediaHandler {

    constructor(id, dom) {
        super(id, dom);
        this.audioDisabled = (process.env.SCREENCRASH_NO_AUDIO === 'true');
    }

    init(createMessage, resourcesPath) {
        super.init(createMessage, resourcesPath);

        const audioPath = `${resourcesPath}/${createMessage.asset}`;
        const autostart = createMessage.autostart === undefined || createMessage.autostart;
        this.uiWrapper.innerHTML = `
            <audio id = "audio-${this.id}" class = "audio-media" src = "${audioPath}" ${this.audioDisabled ? 'muted' : ''} ${autostart ? 'autoplay' : ''} />
        `;

        // Set up events and basic data
        this.audioNode = this.uiWrapper.getElementsByTagName('audio')[0];
        this.audioNode.addEventListener('error', this.onError.bind(this), true);
        this.audioNode.onended = this.onEnded.bind(this);
        this.audioNode.onloadeddata = this.onLoadedData.bind(this);
        this.audioNode.ontimeupdate = this.onTimeUpdated.bind(this);
        this.audioNode.onvolumechange = this.onVolumeChanged.bind(this);
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
        return {
            ...super.getRegularUpdateState(),
            effectType: 'audio'
        };
    }

    getState() {
        return {
            ...super.getState(),
            effectType: 'audio',
            name: this.name,
            duration: this.getDuration(),
            currentTime: this.getCurrentTime(),
            lastSync: Date.now(),
            playing: this.isPlaying(),
            looping: this.isLooping(),
            muted: this.isMuted(),
            volume: this.getVolume()
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

        return true;
    }

    isPlaying() {
        return this.audioNode &&
               !this.audioNode.paused &&
               !this.audioNode.ended &&
               this.audioNode.readyState > 2;
    }

    isLooping() {
        return this.nofLoops !== 0;
    }

    getDuration() {
        return this.audioNode ? this.audioNode.duration : 0;
    }

    getCurrentTime() {
        return this.audioNode ? this.audioNode.currentTime : 0;
    }

    isMuted() {
        return this.audioNode ? this.audioNode.muted : false;
    }

    getVolume() {
        return this.audioNode ? Math.round(this.audioNode.volume * 100) : 0;
    }

    play() {
        if (this.audioNode) {
            this.audioNode.play();
        }
    }

    pause() {
        if (this.audioNode) {
            this.audioNode.pause();
        }
    }

    seek(position) {
        if (this.audioNode && position !== undefined && position !== null) {
            this.audioNode.currentTime = position;
            this.stopFade(this.finalFadeOutStarted);
            this.finalFadeOutStarted = false;
        }
    }

    setMuted(muted) {
        if (this.audioNode && !this.audioDisabled) {
            this.audioNode.muted = muted;
        }
    }

    setVolume(volume) {
        if (this.audioNode && !this.audioDisabled) {
            this.audioNode.volume = volume / 100;
        }
    }

    setupFade(from, to) {
        super.setupFade(from, to);
        if (!this.audioDisabled) {
            const startVolume = (from == null ? this.getVolume() : from);
            this.currentFade.startVolume = startVolume;
            this.currentFade.currentVolume = startVolume;
            this.currentFade.volumePerStep = (to - startVolume) / this.currentFade.stepsLeft;
            this.currentFade.targetVolume = to;
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
        this.emitEvent('event', { event: 'audio_ended', entityId: this.id });
        super.stopOnFadeDone();
    }

    isFadeStepAllowed() {
        return super.isFadeStepAllowed() && this.isPlaying();
    }

    resetFade() {
        super.resetFade();
        this.setVolume(this.currentFade.startVolume);
    }

    onError() {
        this.emitError(`Unable to play audio with id ${this.id}`);
        this.destroy();
    }

    onEnded() {
        if (this.nofLoops === 0) {
            this.emitEvent('event', { event: 'audio_ended', entityId: this.id });
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

        const currentTime = this.audioNode.currentTime;
        if (currentTime < this.lastRecordedTime && currentTime > 0) {
            // Time has changed backwards. Either we looped over and
            // started over or we time jumped. In both cases, we probably
            // want to notify the world about this change.
            this.emitEvent('changed', this.id);
        }
        this.lastRecordedTime = currentTime;
    }

};
