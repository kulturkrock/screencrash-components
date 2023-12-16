
const MediaHandler = require('./mediahandler');
const path = require('path');
const fs = require('fs');
const $ = require('jquery');

const AUDIO_BUFFER_LENGTH_SECONDS = 30;

class SeamlessAudio extends EventTarget {

    constructor(mimeCodec) {
        super();
        this.mimeCodec = mimeCodec;
        this.audioNode = null; // Public, but can only be used after init()
        this.audioContext = new AudioContext();
        this.audioBufferSource = null;
        this.audioBuffer = null;
        this.audioBufferIndex = 0;
        this.fullCurrentFileBuffer = null;
        this.fullCurrentFileBufferIndex = 0;
        this.nextFileBuffer = null;
        this.looping = false;
        this.currentFilePath = null;
        this.playedFilesDuration = 0;
    }

    async init(uiWrapper, id, audioDisabled, autostart, filePath) {
        // TODO remove element? Or make a fake one just for controls?
        uiWrapper.innerHTML = `
        <audio id = "audio-${id}" class = "audio-media" ${audioDisabled ? 'muted' : ''} ${autostart ? 'autoplay' : ''} />
        `;
        this.audioNode = uiWrapper.getElementsByTagName('audio')[0];
        // TODO: Set number of channels based on audio file
        this.audioBuffer = this.audioContext.createBuffer(
            2,
            this.audioContext.sampleRate * AUDIO_BUFFER_LENGTH_SECONDS,
            this.audioContext.sampleRate
        );
        this.silenceBuffer = this.audioContext.createBuffer(
            2,
            this.audioContext.sampleRate * AUDIO_BUFFER_LENGTH_SECONDS,
            this.audioContext.sampleRate
        );
        this.currentFilePath = filePath;
        this.fullCurrentFileBuffer = await this.audioContext.decodeAudioData(fs.readFileSync(this.currentFilePath).buffer);
        this._addDataToBuffer();
        this.audioBufferSource = this.audioContext.createBufferSource();
        this.audioBufferSource.buffer = this.audioBuffer;
        this.audioBufferSource.connect(this.audioContext.destination);
        this.audioBufferSource.loop = true;
        this.audioBufferSource.start();

        this.checkEndInterval = setInterval(() => this._checkEnd(), 50);
    }

    setLooping(looping) {
        this.looping = looping;
    }

    async nextFile(filePath) {
        this.currentFilePath = filePath;
        this.nextFileBuffer = await this.audioContext.decodeAudioData(fs.readFileSync(this.currentFilePath).buffer);
    }

    playedFilesTime() {
        return this.playedFilesDuration;
    };

    destroy() {
        clearInterval(this.checkEndInterval);
        this.audioContext.close();
    }

    _addDataToBuffer() {
        // if (!Number.isNaN(this.mediaSource.duration)) {
        //     this.playedFilesDuration = this.mediaSource.duration;
        // }

        const fullCurrentFileBufferEndIndex = Math.min(
            this.fullCurrentFileBufferIndex + this.audioBuffer.length / 2,
            this.fullCurrentFileBuffer.length
        );
        // console.log('fullCurrentFileBufferEndIndex', fullCurrentFileBufferEndIndex);
        // console.log('this.fullCurrentFileBuffer.length', this.fullCurrentFileBuffer.length);
        const audioBufferEndIndex = this.audioBufferIndex + fullCurrentFileBufferEndIndex - this.fullCurrentFileBufferIndex;

        for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
            this.audioBuffer.copyToChannel(
                this.fullCurrentFileBuffer.getChannelData(channel).slice(this.fullCurrentFileBufferIndex, fullCurrentFileBufferEndIndex),
                channel,
                this.audioBufferIndex
            );
            if (audioBufferEndIndex > this.audioBuffer.length) {
                this.audioBuffer.copyToChannel(
                    this.fullCurrentFileBuffer.getChannelData(channel).slice(
                        fullCurrentFileBufferEndIndex - (audioBufferEndIndex - this.audioBuffer.length),
                        fullCurrentFileBufferEndIndex
                    ),
                    channel,
                    0
                );
            }
        }

        this.audioBufferIndex = audioBufferEndIndex % this.audioBuffer.length;
        this.fullCurrentFileBufferIndex = fullCurrentFileBufferEndIndex;
    }

    _checkEnd() {
        const playedFraction = (this.audioContext.currentTime % AUDIO_BUFFER_LENGTH_SECONDS) / AUDIO_BUFFER_LENGTH_SECONDS;
        const playedAudioBufferIndex = Math.round(playedFraction * this.audioBuffer.length);
        const minSamplesToEnd = this.audioContext.sampleRate * 0.1;
        if ((this.audioBuffer.length + this.audioBufferIndex - playedAudioBufferIndex) % this.audioBuffer.length < minSamplesToEnd) {
            if (this.fullCurrentFileBufferIndex === this.fullCurrentFileBuffer.length) {
                console.log('end of file buffer');
                if (this.nextFileBuffer !== null) {
                    console.log('changed file path');
                    this.fullCurrentFileBuffer = this.nextFileBuffer;
                    this.fullCurrentFileBufferIndex = 0;
                    this.nextFileBuffer = null;
                    this.dispatchEvent(new CustomEvent('new-file'));
                } else if (this.looping) {
                    console.log('looping');
                    this.fullCurrentFileBufferIndex = 0;
                    this.dispatchEvent(new CustomEvent('looped'));
                } else {
                    console.log('end');
                    this.audioBufferSource.loop = false;
                    this.fullCurrentFileBuffer = this.silenceBuffer;
                    this.fullCurrentFileBufferIndex = 0;
                    this.audioBufferSource.addEventListener('ended', () => {
                        this._onEnded();
                    }, { once: true });
                }
            }
            this._addDataToBuffer();
        }
    }

    _onEnded() {
        this.dispatchEvent(
            new CustomEvent('ended')
        );
    }

}

class ConvenientAudio extends EventTarget {

    constructor() {
        super();
        this.audioNode = null; // Public, but can only be used after attach()
        this.looping = false;
        this.currentFilePath = null;
        this.changedFilePath = false;
    }

    init(uiWrapper, id, audioDisabled, autostart, filePath) {
        uiWrapper.innerHTML = `
        <audio id = "audio-${id}" class = "audio-media" src = "${filePath}" ${audioDisabled ? 'muted' : ''} ${autostart ? 'autoplay' : ''} />
        `;
        this.audioNode = uiWrapper.getElementsByTagName('audio')[0];
        this.audioNode.onended = this._onEnded.bind(this);
    }

    setLooping(looping) {
        this.looping = looping;
    }

    nextFile(filePath) {
        this.currentFilePath = filePath;
        this.changedFilePath = true;
    }

    playedFilesTime() {
        return 0;
    }

    destroy() {}

    _onEnded() {
        if (this.changedFilePath) {
            this.audioNode.setAttribute('src', this.currentFilePath);
            this.audioNode.load();
            this.audioNode.play();
            this.changedFilePath = false;
            this.dispatchEvent(
                new CustomEvent('new-file')
            );
        } else if (this.looping) {
            this.audioNode.play();
            this.dispatchEvent(
                new CustomEvent('looped')
            );
        } else {
            this.dispatchEvent(
                new CustomEvent('ended')
            );
        }
    }

}

module.exports = class AudioHandler extends MediaHandler {

    constructor(id, dom) {
        super(id, dom);
        this.audioDisabled = (process.env.SCREENCRASH_NO_AUDIO === 'true');
    }

    init(createMessage, resourcesPath) {
        super.init(createMessage, resourcesPath);

        this.resourcesPath = resourcesPath;

        const filePath = `${this.resourcesPath}/${createMessage.asset}`;
        const autostart = createMessage.autostart === undefined || createMessage.autostart;
        if (createMessage.seamless) {
            this.audio = new SeamlessAudio(createMessage.mimeCodec);
        } else {
            this.audio = new ConvenientAudio();
        }
        this.audio.init(this.uiWrapper, this.id, this.audioDisabled, autostart, filePath);
        this.audio.addEventListener('new-file', this.onNewFile.bind(this));
        this.audio.addEventListener('looped', this.onLooped.bind(this));
        this.audio.addEventListener('ended', this.onEnded.bind(this));

        // Set up events and basic data
        const audioNode = this.audio.audioNode;
        audioNode.addEventListener('error', this.onError.bind(this), true);
        audioNode.onloadeddata = this.onLoadedData.bind(this);
        audioNode.ontimeupdate = this.onTimeUpdated.bind(this);
        audioNode.onvolumechange = this.onVolumeChanged.bind(this);
        this.nofLoops = (createMessage.looping !== undefined ? createMessage.looping : 1) - 1;
        if (this.nofLoops !== 0) {
            this.audio.setLooping(true);
        }
        this.lastRecordedTime = -1;

        // Variables to keep track of fade out on end
        this.fadeStartVolume = 0;
        this.finalFadeOutTime = createMessage.fadeOut || 0;
        this.finalFadeOutStarted = false;

        // Set name of this handler
        this.name = path.parse(createMessage.asset).name;
        if (createMessage.displayName) {
            this.name = createMessage.displayName; // Override name
        }
    }

    destroy() {
        super.destroy();
        this.audio.destroy();
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
            case 'toggle_loop':
                this.toggleLoop();
                break;
            case 'set_loops':
                this.nofLoops = msg.looping - 1;
                this.audio.setLooping(this.nofLoops !== 0);
                break;
            case 'set_next_file':
                this.audio.nextFile(`${this.resourcesPath}/${msg.asset}`);
                break;
            default:
                return super.handleMessage(msg);
        }

        return true;
    }

    isPlaying() {
        const audioNode = this.audio.audioNode;
        return audioNode &&
               !audioNode.paused &&
               !audioNode.ended &&
               audioNode.readyState > 2;
    }

    isLooping() {
        return this.nofLoops !== 0;
    }

    toggleLoop() {
        this.nofLoops = this.isLooping() ? 0 : -1;
        this.audio.setLooping(this.nofLoops !== 0);
        this.emitEvent('changed', this.id);
    }

    getDuration() {
        return this.audio.audioNode ? this.audio.audioNode.duration - this.audio.playedFilesTime() : 0;
    }

    getCurrentTime() {
        return this.audio.audioNode ? Math.max(this.audio.audioNode.currentTime - this.audio.playedFilesTime(), 0) : 0;
    }

    isMuted() {
        return this.audio.audioNode ? this.audio.audioNode.muted : false;
    }

    getVolume() {
        return this.audio.audioNode ? Math.round(this.audio.audioNode.volume * 100) : 0;
    }

    play() {
        if (this.audio.audioNode) {
            this.audio.audioNode.play();
        }
    }

    pause() {
        if (this.audio.audioNode) {
            this.audio.audioNode.pause();
        }
    }

    seek(position) {
        if (this.audio.audioNode && position !== undefined && position !== null) {
            this.audio.audioNode.currentTime = position + this.audio.playedFilesTime();
            this.stopFade(this.finalFadeOutStarted);
            this.finalFadeOutStarted = false;
        }
    }

    setMuted(muted) {
        if (this.audio.audioNode && !this.audioDisabled) {
            this.audio.audioNode.muted = muted;
        }
    }

    setVolume(volume) {
        if (this.audio.audioNode && !this.audioDisabled) {
            this.audio.audioNode.volume = volume / 100;
        }
    }

    setupFade(fadeTime, from, to, onFadeDone) {
        super.setupFade(fadeTime, from, to, () => {});
        const startVolume = (from == null ? this.getVolume() : from * 100);
        this.fadeStartVolume = startVolume;
        this.setVolume(startVolume);
        $(this.audio.audioNode).animate({ volume: to }, fadeTime, onFadeDone);
    }

    stopFade(requireReset) {
        super.stopFade(requireReset);
        $(this.audio.audioNode).stop(true, true);
        if (requireReset) {
            this.setVolume(this.fadeStartVolume);
        }
    }

    onLooped() {
        this.nofLoops -= 1;
        if (this.nofLoops === 0) {
            this.audio.setLooping(false);
        }
    }

    onNewFile() {
        this.emitEvent('changed', this.id);
    }

    onError() {
        this.emitError(`Unable to play audio with id ${this.id}`);
        this.destroy();
    }

    onEnded() {
        this.destroy();
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

        const currentTime = this.audio.audioNode.currentTime;
        if (currentTime < this.lastRecordedTime && currentTime > 0) {
            // Time has changed backwards. Either we looped over and
            // started over or we time jumped. In both cases, we probably
            // want to notify the world about this change.
            this.emitEvent('changed', this.id);
        }
        this.lastRecordedTime = currentTime;
    }

};
