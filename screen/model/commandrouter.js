
let MediaHandler = require("./media/mediahandler");
let VideoHandler = require("./media/videohandler");
let ImageHandler = require("./media/imagehandler");

module.exports = class CommandRouter {

    constructor(dom){
        this.dom = dom;
        this.handlers = {};
    }

    handleMessage(msg){

        // Log occurrence
        console.log("CommandHandler got message: " + JSON.stringify(msg));

        // Handle creation and destruction of handlers, delegate all else.
        switch(msg.command){
            case "create":
                this.createHandler(msg);
                break;
            case "destroy":
                this.destroyHandler(msg);
                break;
            default:
                this.sendMessageToHandler(msg.entity_id, msg);
        }
    }

    createHandler(msg){
        let entityId = msg.entity_id;

        if (!(entityId in this.handlers)){
            this.handlers[entityId] = this.createHandlerFromType(entityId, msg.type);
            this.sendMessageToHandler(entityId, msg);
        } else {
            console.log("Warning: Trying to create media with an id that already exists");
        }
    }

    createHandlerFromType(entityId, type){
        switch(type){
            case "video": return new VideoHandler(entityId, this.dom);
            case "image": return new ImageHandler(entityId, this.dom);
            default:
                console.log("Warning: Unsupported media type %s", type);
                return new MediaHandler(entityId, this.dom);
        }
    }

    destroyHandler(msg){
        let entityId = msg.entity_id;
        this.sendMessageToHandler(entityId, msg);
        delete this.handlers[entityId];
    }

    sendMessageToHandler(entityId, msg){
        if (entityId in this.handlers){
            this.handlers[entityId].handleMessage(msg);
        }
    }

}