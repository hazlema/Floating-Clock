class Stopwatch {
    constructor() {
        this.start;
        this.state   = 0; // 0=Start, 1=Stop, 2=Reset
        this.running = false;
        this.footer = "Click here to start timer";
    }

    dateDiff(compareDate) {
        var ms = new Date() - compareDate;
        var secs = ms / 1000;
        var minutes = secs / 60; secs = secs % 60;
        var hours = minutes / 60; minutes = minutes % 60;
        var days = hours / 24; hours = hours % 24;

        return {
            'D': parseInt(days),
            'H': parseInt(hours),
            'M': parseInt(minutes),
            'S': parseInt(secs)
        }
    }

    display() {
        if (this.running) {
            var values  = this.dateDiff(this.start);
            this.footer = `${values.D}<span class="accent0"> days, </span> ${values.H}<span class="accent0"> hrs, </span> ${values.M}<span class="accent0"> min, </span> ${values.S}<span class="accent0"> sec</span>`;
        }

        return this.footer;
    }

    click(ev) {
        if (ev.button == 0) {
            switch (this.state) {
                case 0: 
                    this.state   = 1;
                    this.start   = new Date();
                    this.running = true;
                    break;
                
                case 1:
                    this.state = 2;
                    this.running = false;
                    break;
    
                case 2:
                    this.reset();
                    break;
            }
        }
        
        if (ev.button == 2) {
            this.reset();
        }
    }

    reset() {
        this.footer = "Click here to start timer";
        this.running = false;
        this.state = 0;
    }
}

module.exports = {Stopwatch};
