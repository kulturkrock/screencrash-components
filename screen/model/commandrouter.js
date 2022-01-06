const VideoHandler = require('./media/videohandler');
const ImageHandler = require('./media/imagehandler');
const WebsiteHandler = require('./media/websitehandler');

module.exports = class CommandRouter {

    constructor(dom, fileHandler) {
        this.dom = dom;
        this.fileHandler = fileHandler;
        this.handlers = {};
    }

    async initialMessage() {
        return {
            type: 'announce',
            client: 'screen',
            channel: 1,
            files: {} // TODO: Calculate real hashes
        };
    }

    init(sendFunction) {
        this.sendFunction = sendFunction;
    }

    reportError(err) {
        if (this.sendFunction) {
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
        console.log('CommandHandler got message: ' + JSON.stringify(msg));

        // Handle creation and destruction of handlers, delegate all else.
        try {
            switch (msg.command) {
                case 'create':
                    this.createHandler(msg);
                    break;
                case 'destroy':
                    this.destroyHandler(msg);
                    break;
                case 'file':
                    this.fileHandler.writeFile(msg);
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

    destroyHandler(msg) {
        const entityId = msg.entityId;
        this.handlers[entityId].destroy();
    }

    onHandlerDestroyed(event) {
        const entityId = event.detail;
        delete this.handlers[entityId];
        this.sendFunction({
            messageType: 'effect-removed',
            entityId: entityId
        });
    }

    onHandlerChanged(event) {
        console.log(`Received change event for ${event.detail}`);
        const entityId = event.detail;
        this.sendFunction({
            messageType: 'effect-changed',
            entityId: entityId,
            ...this.handlers[entityId].getState()
        });
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

};
