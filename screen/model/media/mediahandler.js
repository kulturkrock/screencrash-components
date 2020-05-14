
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
            case "show":
                this.setVisible(true);
                break;
            case "hide":
                this.setVisible(false);
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

    destroy(){
        this.ui.parentNode.removeChild(this.ui);
    }

}