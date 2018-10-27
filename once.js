// Execute a function just one time
class Once {
    constructor(fn) {
        this.executed = false;
        this.fn = fn;
    }

    exec() {
        if (this.executed == false) {
            this.fn();
            this.executed = true;
        }
    }
}

module.exports = {Once};
