/*[ Class: Modes ]***************************************************
* A container to store the various display modes
 */
class Modes {
    constructor() {
        this.current = 0;
        this.list    = [{
            name: "Digital Clock",     
            click: function(){},
            reset: function(){},
            display: function(){}
        }];

        document.title = this.name(this.previewNextIndex());
    }

    /**
     * Mode storage: Store different modes for the clock
     * @param {Array of Objects or a single Object} modesToAdd 
     * @return this
     */
    addMode(modesToAdd) {
        var me = this;

        if (Array.isArray(modesToAdd)) {
            for (var modeToAdd of modesToAdd) {
                me.list.push(modeToAdd);
            }
        } else {
            me.list.push(modesToAdd);
        }

        return this;
    }

    /**
     * Get the index number for the next next()
     * @return {Number} 
     */
    previewNextIndex() {
        return ((this.current+1) > (this.list.length-1)) ? 0 : this.current+1;
    }

    /**
     * Inc the index number for next()
     */
    next() {
        document.title = this.name(this.previewNextIndex());
        this.current = this.previewNextIndex();
        return this;
    }

    display() {
        return this.list[this.current].display;
    }

    reset() {
        return this.list[this.current].reset;
    }

    click() {
        return this.list[this.current].click;
    }

    // Use an arg to force an index
    name(index = -1) {
        return (index == -1) ? this.list[this.current].name : this.list[index].name;
    }
}

module.exports = {Modes};
