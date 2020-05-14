
module.exports = class MediaHandler {

    constructor(id, dom){
        this.id = id;
        this.ui = this._createMediaWrapper(dom);
    }

    handleMessage(msg){
        switch(msg.command){
            case "create":
                // It is acceptable to include viewport info already in create message.
                this.setViewport(msg.x, msg.y, msg.width, msg.height, msg.usePercentage);
                if (msg.visible){
                    this.setVisible(true);
                }
                this.populateUI(this.ui, msg);
                break;
            case "show":
                this.setVisible(true);
                break;
            case "hide":
                this.setVisible(false);
                break;
            case "viewport":
                this.setViewport(msg.x, msg.y, msg.width, msg.height, msg.usePercentage);
                break;
            case "destroy":
                this.destroy(); break;
            default:
                console.log("Warning: Unhandled command '%s'", msg.command);
        }
    }

    _createMediaWrapper(dom){
        let element = dom.createElement("div");
        element.id = "wrapper-" + this.id;
        element.className = "media-wrapper";
        element.style.display = "none";
        dom.body.appendChild(element);
        return element;
    }

    populateUI(uiElement, createMessage){
        uiElement.innerHTML = "Basic Media object";
    }

    setVisible(visible){
        if (this.ui){
            if (visible){
                this.ui.style.display = "block";
            } else {
                this.ui.style.display = "none";
            }
        }
    }

    setViewport(x, y, width, height, percentage = false){
        let suffix = (percentage ? "%" : "px");
        if (x !== undefined){
            this.ui.style.left = x + suffix;
        }
        if (y !== undefined){
            this.ui.style.top = y + suffix;
        }
        if (width !== undefined){
            this.ui.style.width = width + suffix;
        }
        if (height !== undefined){
            this.ui.style.height = height + suffix;
        }
    }

    destroy(){
        this.ui.parentNode.removeChild(this.ui);
    }

}