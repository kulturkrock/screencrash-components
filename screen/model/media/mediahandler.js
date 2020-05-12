
module.exports = class MediaHandler {

    constructor(id, dom){
        this.id = id;
        this.ui = this._createMediaWrapper(dom);
    }

    handleMessage(msg){
        switch(msg.command){
            case "create":
                this.populateUI(this.ui, msg);
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
        dom.body.appendChild(element);
        return element;
    }

    populateUI(uiElement, createMessage){
        uiElement.innerHTML = "Basic Media object";
    }

    destroy(){
        this.ui.parentNode.removeChild(this.ui);
    }

}