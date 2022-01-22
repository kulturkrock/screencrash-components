
const { addClass, removeClass, hasClass } = require('../domutils');

module.exports = class MediaHandler extends EventTarget {

    constructor(id, dom) {
        super();
        this.id = id;
        this.isDestroyed = false;
        this.uiWrapper = this._createMediaWrapper(dom);
    }

    init(msg, resourcesPath) {
        // It is acceptable to include viewport info already in create message.
        this.setViewport(msg.x, msg.y, msg.width, msg.height, msg.usePercentage);

        if (msg.visible) {
            this.setVisible(true);
        }

        if (msg.opacity) {
            this.setOpacity(msg.opacity);
        }

        if (typeof msg.layer === 'number') {
            this.setLayer(msg.layer);
        }
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

    getRegularUpdateState() {
        return {
            effectType: 'unknown'
        };
    }

    getState() {
        return {
            effectType: 'unknown',
            visible: this.isVisible(),
            opacity: this.getOpacity(),
            viewport_x: this.getX(),
            viewport_y: this.getY(),
            viewport_width: this.getWidth(),
            viewport_height: this.getHeight(),
            layer: this.getLayer()
        };
    }

    handleMessage(msg) {
        switch (msg.command) {
            /* Add commands for all media types here */
            case 'show':
                this.setVisible(true);
                break;
            case 'hide':
                this.setVisible(false);
                break;
            case 'opacity':
                this.setOpacity(msg.opacity);
                break;
            case 'viewport':
                this.setViewport(msg.x, msg.y, msg.width, msg.height, msg.usePercentage);
                break;
            case 'layer':
                this.setLayer(msg.layer);
                break;
            default:
                console.log(`Warning: Unhandled command ${msg.command}`);
                return false;
        }

        // If not handled we have already returned false
        return true;
    }

    _createMediaWrapper(dom) {
        const element = dom.createElement('div');
        element.id = 'wrapper-' + this.id;
        element.className = 'media-wrapper hidden';
        dom.body.appendChild(element);
        return element;
    }

    isVisible() {
        return this.uiWrapper && !hasClass(this.uiWrapper, 'hidden');
    }

    setVisible(visible) {
        if (this.uiWrapper) {
            if (visible) {
                removeClass(this.uiWrapper, 'hidden');
            } else {
                addClass(this.uiWrapper, 'hidden');
            }
        }
    }

    getOpacity() {
        return this.uiWrapper.style.opacity;
    }

    setOpacity(opacity) {
        if (opacity >= 0.0 && opacity <= 1.0) {
            this.uiWrapper.style.opacity = opacity;
        }
    }

    getX() {
        return this.uiWrapper.style.left;
    }

    getY() {
        return this.uiWrapper.style.top;
    }

    getWidth() {
        return this.uiWrapper.clientWidth;
    }

    getHeight() {
        return this.uiWrapper.clientHeight;
    }

    setViewport(x, y, width, height, percentage = false) {
        const suffix = (percentage ? '%' : 'px');

        if (x !== undefined) {
            this.uiWrapper.style.left = x + suffix;
        }
        if (y !== undefined) {
            this.uiWrapper.style.top = y + suffix;
        }
        if (width !== undefined) {
            this.uiWrapper.style.width = width + suffix;
        }
        if (height !== undefined) {
            this.uiWrapper.style.height = height + suffix;
        }
    }

    getLayer() {
        return this.uiWrapper.style.zIndex;
    }

    setLayer(layer) {
        this.uiWrapper.style.zIndex = layer;
    }

    destroy() {
        if (!this.isDestroyed) {
            this.uiWrapper.parentNode.removeChild(this.uiWrapper);
            this.emitEvent('destroyed', this.id);
            this.isDestroyed = true;
        }
    }

};
