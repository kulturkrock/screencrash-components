
const VideoHandler = require("./media/videohandler");
const ImageHandler = require("./media/imagehandler");

module.exports = class CommandRouter {

    constructor(dom){
        this.dom = dom;
        this.handlers = {};
    }

    handleMessage(msg){

        // Log occurrence
        console.log("CommandHandler got message: " + JSON.stringify(msg));

        // Handle creation and destruction of handlers, delegate all else.
        try{
            switch(msg.command){
                case "create":
                    this.createHandler(msg);
                    break;
                case "destroy":
                    this.destroyHandler(msg);
                    break;
                default:
                    this.sendMessageToHandler(msg.entity_id, msg);
                    break;
            }
        } catch(e) {
            console.log(`An error occured: ${e}`);
            // TODO: Report error back to core?
        }
    }

    createHandler(msg){
        const entityId = msg.entity_id;
        this.handlers[entityId] = this.createHandlerFromType(entityId, msg.type);
        this.handlers[entityId].init(msg);
    }

    createHandlerFromType(entityId, type){
        switch(type){
            case "video": return new VideoHandler(entityId, this.dom);
            case "image": return new ImageHandler(entityId, this.dom);
            default:
                throw `Unsupported media type ${type}`;
        }
    }

    destroyHandler(msg){
        const entityId = msg.entity_id;
        this.handlers[entityId].destroy();
        delete this.handlers[entityId];
    }

    sendMessageToHandler(entityId, msg){
        if (entityId in this.handlers){
            this.handlers[entityId].handleMessage(msg);
        }
    }

}