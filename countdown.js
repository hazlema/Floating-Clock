class Countdown {
    constructor() {
        this.displayFn = null;      // Display Stuff
        this.kbInput   = "";        // Keyboard stuff
        this.kbEvent;
        
        // Countdown
        this.countdown = {          
            futureDate: new Date(),
            display: "",
            enabled: false
        }

        // Timer
        var me = this;
        setInterval(function() { me.countdownTick(); }, 1000);
    }

    /*[ Custom Event ]*****************************************************************/

    myEvent(scope, type, handler, capture) {
        scope.addEventListener(type, handler, capture);
    
        return () => {
            scope.removeEventListener(type, handler, capture);    
        }
    }

    /*[ Displays ]*********************************************************************/
    
    // Footer
    display() {
        return this.countdown.enabled ? this.countdown.display : "Click Here to Set Countdown";
    }

    // Main Display
    displayDialog() {
        // Build the prompt
        var onOff    = (new Date().getSeconds() % 2 == 1);  // true or false (blinking)
        var result   = this.kbInput == "" ? "1:05" : this.kbInput;
        var classNme = this.kbInput == "" ? "gray" : "yellow";
        
        // Add blinking underline
        result += onOff ? '<span style="border-bottom: 1px solid yellow">&nbsp;</span>' : '&nbsp;';
        
        // Return Dialog
        return  '<div class="dialog">Enter Countdown Time (HH:MM)<br>' +
                    '<div class="prompt">' +
                        `<span class="${classNme}">${result}</span>` +
                    '</div>' +
                '</div>';
    }

    /*[ kb / Settings ]*********************************************************************/

    kbHandler(event) {
        if (event.key.match(/[\d:]/)) 
            this.kbInput += event.key;
        else if (event.key == 'Backspace' && this.kbInput.length > 0)
            this.kbInput = this.kbInput.slice(0, -1);
        else if (event.key == 'Enter')
            this.finalizeSettings(false);   // Continue Processing
        else if (event.key == 'Escape') {
            this.finalizeSettings(true);    // Abort
            this.reset();
        }
    }

    // Initialize Settings 
    // -- Turns on kbEvents and changes the display
    initSettings() {
        if (this.countdown.enabled == false) {
            var mainContent   = $('#mainContent');
            var footerContent = $('#footerContent');
        
            // Init key handler
            this.kbEvent   = this.myEvent(document.body, 'keydown', (event) => { me.kbHandler(event); }, false)
            this.kbInput   = "";
            
            // Save current display settings so we can 
            // -- revert back after the dialog is over
            this.displayFn = instance.setDisplay;
            instance.animationRunning = true;               // Disallow changing modes

            // Override the display
            var me = this;
            instance.setDisplay = function() {
                mainContent.innerHTML   = me.displayDialog();
                footerContent.innerHTML = instance.modes.display()();
            }
        }
    }

    // Finalize Settings
    finalizeSettings(isAborted=false) {
        instance.setDisplay = this.displayFn;   // Reset display
        instance.animationRunning = false;      // Allow changing modes
        
        this.displayFn = null;
        this.kbEvent();                         // Remove kbEvent

        if (isAborted || this.kbInput == "") {
            this.kbInput = "";
        } else {
            this.startCountdown(this.kbInput);
        }
    }

    /*[ Countdown ]*********************************************************************/

    startCountdown() {
        var kbString = String(this.kbInput);
        var hasHours = (kbString.indexOf(":") != -1);
        var parse    = kbString.split(":");
        var hours    = (hasHours) ? parse[0] : 0;
        var minutes  = (hasHours) ? parse[1] : parse[0];
        
        //  Build future date
        var futureDate = new Date();
        futureDate.setHours(futureDate.getHours() + parseInt(hours));
        futureDate.setMinutes(futureDate.getMinutes() + parseInt(minutes));

        var diff = this.countdownDiff(futureDate);

        this.countdown.futureDate = futureDate;
        this.countdown.display    = `${diff.D} <span class="accent0">days, </span>${diff.H} <span class="accent0">hrs, </span>${diff.M} <span class="accent0">min, </span>${diff.S} <span class="accent0">sec`;
        this.countdown.enabled    = true;
    }

    countdownDiff(compareDate) {
        var ms = compareDate - new Date();
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

    countdownTick() {
        if (this.countdown.enabled) {
            var diff = this.countdownDiff(this.countdown.futureDate);

            if (diff.D == 0 && diff.H == 0 && diff.M == 0 && diff.S == 0) {
                const {Howl} = require('howler');
                const sound  = new Howl({ src: ['sound/countdown.mp3'] });
                sound.play();

                this.countdown.enabled = false;
            } else {
                this.countdown.display = `${diff.D} <span class="accent0">days, </span>${diff.H} <span class="accent0">hrs, </span>${diff.M} <span class="accent0">min, </span>${diff.S} <span class="accent0">sec`;
            }
        }
    }

    /*[ Other ]*********************************************************************/

    click(ev) {
        if (ev.button == 0) { this.initSettings(); } 
        if (ev.button == 2) { this.reset();        } 
    }

    reset() { 
        instance.setDisplay = function() {
            mainContent.innerHTML   = instance.updateTime();
            footerContent.innerHTML = instance.modes.display()();
        }
     
        this.countdown.enabled = false;
    }
}

module.exports = {Countdown};
