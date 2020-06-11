
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

    destroy(){
        this.uiWrapper.parentNode.removeChild(this.uiWrapper);
    }

}