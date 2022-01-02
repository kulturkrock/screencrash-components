
const VideoHandler = require('./media/videohandler');
const ImageHandler = require('./media/imagehandler');
const WebsiteHandler = require('./media/websitehandler');

module.exports = class CommandRouter {

    constructor(dom) {
        this.dom = dom;
        this.handlers = {};
        this.regularUpdateInterval = setInterval(this._regularUpdate.bind(this), 500);
    }

    init(sendFunction) {
        this.sendFunction = sendFunction;
    }

    reportError(err) {
        if (this.sendFunction) {
            console.log(`Got some errors: ${err}`);
            this.sendFunction({
                messageType: 'cmd-error',
                msg: err
            });
        } else {
            console.log(`Err: ${err}`);
        }
    }

    handleMessage(msg) {
        // Log occurrence
        // console.log('CommandHandler got message: ' + JSON.stringify(msg));

        // Handle creation and destruction of handlers, delegate all else.
        try {
            switch (msg.command) {
                case 'create':
                    this.createHandler(msg);
                    break;
                case 'destroy':
                    this.destroyHandler(msg.entityId);
                    break;
                default:
                    this.sendMessageToHandler(msg.entityId, msg);
                    break;
            }
        } catch (e) {
            this.reportError(`Failed command: ${e}`);
        }
    }

    createHandler(msg) {
        const entityId = msg.entityId;

        if (entityId in this.handlers) {
            this.reportError(`A handler for entity id ${entityId} was overwritten by a new one`);
            this.destroyHandler(entityId);
        }

        this.handlers[entityId] = this.createHandlerFromType(entityId, msg.type);
        this.handlers[entityId].init(msg);
        this.handlers[entityId].addEventListener('changed', this.onHandlerChanged.bind(this));
        this.handlers[entityId].addEventListener('destroyed', this.onHandlerDestroyed.bind(this));
        this.handlers[entityId].addEventListener('error-msg', (ev) => this.reportError(ev.detail));

        this.sendFunction({
            messageType: 'effect-added',
            entityId: entityId,
            ...this.handlers[entityId].getState()
        });
    }

    createHandlerFromType(entityId, type) {
        switch (type) {
            case 'video': return new VideoHandler(entityId, this.dom);
            case 'image': return new ImageHandler(entityId, this.dom);
            case 'website': return new WebsiteHandler(entityId, this.dom);
            default:
                throw new Error(`Unsupported media type ${type}`);
        }
    }

    destroyHandler(entityId) {
        if (entityId in this.handlers) {
            this.handlers[entityId].destroy();
            delete this.handlers[entityId];
        }
    }

    onHandlerDestroyed(event) {
        const entityId = event.detail;
        if (entityId in this.handlers) {
            delete this.handlers[entityId];
        }

        this.sendFunction({
            messageType: 'effect-removed',
            entityId: entityId
        });
    }

    onHandlerChanged(event) {
        const entityId = event.detail;
        if (entityId in this.handlers) {
            this.sendFunction({
                messageType: 'effect-changed',
                entityId: entityId,
                ...this.handlers[entityId].getState()
            });
        } else {
            this.reportError('Got update events on untracked effect');
        }
    }

    sendMessageToHandler(entityId, msg) {
        if (entityId in this.handlers) {
            if (this.handlers[entityId].handleMessage(msg)) {
                this.sendFunction({
                    messageType: 'effect-changed',
                    entityId: entityId,
                    ...this.handlers[entityId].getState()
                });
            }
        } else {
            this.reportError(`Trying to issue command for non-existant entity id ${entityId}`);
        }
    }

    _regularUpdate() {
        if (!this.sendFunction) {
            return;
        }

        const nofStaticKeys = 1; // effectType is always present
        for (const entityId in this.handlers) {
            const state = this.handlers[entityId].getRegularUpdateState();
            if (Object.keys(state).length > nofStaticKeys) {
                this.sendFunction({
                    messageType: 'effect-changed',
                    entityId: entityId,
                    ...state
                });
            }
        }
    }

};
