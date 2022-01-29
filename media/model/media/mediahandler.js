
module.exports = class MediaHandler extends EventTarget {

    constructor(id, dom) {
        super();
        this.id = id;
        this.isDestroyed = false;
        this.uiWrapper = this._createMediaWrapper(dom);
    }

    _createMediaWrapper(dom) {
        const element = dom.createElement('div');
        element.id = 'wrapper-' + this.id;
        element.className = 'media-wrapper hidden';
        dom.body.appendChild(element);
        return element;
    }

    emitEvent(eventType, data) {
        if (!this.isDestroyed) {
            this.dispatchEvent(
                new CustomEvent(eventType, { detail: data })
            );
        }
    }

    emitError(msg) {
        this.emitEvent('error-msg', msg);
    }

    init(msg, resourcesPath) {
        // Override this method to set initial state from
        // creation message
    }

    getRegularUpdateState() {
        // Override to add regular state data
        return {
            effectType: 'unknown'
        };
    }

    getState() {
        // Override to add state data
        return {
            effectType: 'unknown'
        };
    }

    handleMessage(msg) {
        // Override this to handle commands
        console.log(`Warning: Unhandled command ${msg.command}`);
        return false;
    }

    destroy() {
        if (!this.isDestroyed) {
            this.uiWrapper.parentNode.removeChild(this.uiWrapper);
            this.emitEvent('destroyed', this.id);
            this.isDestroyed = true;
        }
    }

};
