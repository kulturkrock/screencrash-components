
module.exports = class MediaHandler {

    constructor(id, dom){
        this.id = id;
        this.uiWrapper = this._createMediaWrapper(dom);
    }
    
    init(msg){
        this.uiWrapper.innerHTML = "Basic Media object";
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
            default:
                console.log("Warning: Unhandled command '%s'", msg.command);
        }
    }

    _createMediaWrapper(dom){
        let element = dom.createElement("div");
        element.id = "wrapper-" + this.id;
        element.className = "media-wrapper";
        element.style.visibility = "hidden";
        dom.body.appendChild(element);
        return element;
    }

    setVisible(visible){
        if (this.uiWrapper){
            if (visible){
                this.uiWrapper.style.visibility = "visible";
            } else {
                this.uiWrapper.style.visibility = "hidden";
            }
        }
    }
	
    destroy(){
        this.uiWrapper.parentNode.removeChild(this.uiWrapper);
    }

}