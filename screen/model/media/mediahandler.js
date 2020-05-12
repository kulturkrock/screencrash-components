
module.exports = class MediaHandler {

    constructor(id, dom){
        this.id = id;
        this.ui = this._createMediaWrapper(dom);
        this.populateUI(this.ui);
    }

    handleMessage(msg){
        switch(msg.command){
            case "destroy":
                this.destroy(); break;
            default:
                console.log("Warning: Unhandled command '%s'", msg.command);
        }
    }

    _createMediaWrapper(dom){
        let element = dom.createElement("div");
        element.id = "wrapper-" + this.id;
        element.class = "media-wrapper";
        dom.body.appendChild(element);
        return element;
    }

    populateUI(uiElement){
        uiElement.innerHTML = "Basic Media object";
    }

    destroy(){
        this.ui.parentNode.removeChild(this.ui);
    }

}