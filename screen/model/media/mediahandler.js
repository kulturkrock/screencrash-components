
const {addClass, removeClass} = require("../domutils");

module.exports = class MediaHandler {

    constructor(id, dom){
        this.id = id;
        this.uiWrapper = this._createMediaWrapper(dom);
    }
    
    init(msg){
        // It is acceptable to include viewport info already in create message.
        this.setViewport(msg.x, msg.y, msg.width, msg.height, msg.usePercentage);

        if (msg.visible){
            this.setVisible(true);
        }
        
        if (typeof msg.layer == "number"){
            this.setLayer(msg.layer);
        }
    }

    handleMessage(msg){
        switch(msg.command){
            /* Add commands for all media types here */
            case "show":
                this.setVisible(true);
                break;
            case "hide":
                this.setVisible(false);
                break;
            case "viewport":
                this.setViewport(msg.x, msg.y, msg.width, msg.height, msg.usePercentage);
                break;
            case "layer":
                this.setLayer(msg.layer);
                break;
            default:
                console.log(`Warning: Unhandled command ${msg.command}`);
        }
    }

    _createMediaWrapper(dom){
        let element = dom.createElement("div");
        element.id = "wrapper-" + this.id;
        element.className = "media-wrapper hidden";
        dom.body.appendChild(element);
        return element;
    }
    
    setVisible(visible){
        if (this.uiWrapper){
            if (visible){
                removeClass(this.uiWrapper, "hidden");
            } else {
                addClass(this.uiWrapper, "hidden");
            }
        }
    }

    setViewport(x, y, width, height, percentage = false){
        const suffix = (percentage ? "%" : "px");
        
        if (x !== undefined){
            this.uiWrapper.style.left = x + suffix;
        }
        if (y !== undefined){
            this.uiWrapper.style.top = y + suffix;
        }
        if (width !== undefined){
            this.uiWrapper.style.width = width + suffix;
        }
        if (height !== undefined){
            this.uiWrapper.style.height = height + suffix;
        }
    }
    
    setLayer(layer){
        this.uiWrapper.style.zIndex = layer;
    }

    destroy(){
        this.uiWrapper.parentNode.removeChild(this.uiWrapper);
    }

}