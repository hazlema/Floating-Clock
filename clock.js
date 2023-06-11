const path        = require('path');
const {Modes}     = require(path.join(__dirname, 'modes.js'));
const {Once}      = require(path.join(__dirname, 'once.js'));
const {Stopwatch} = require(path.join(__dirname, 'stopwatch.js'));
const {Countdown} = require(path.join(__dirname, 'countdown.js'));

var modes       = new Modes();
var stopwatch   = new Stopwatch();
var countdown   = new Countdown();

global.instance      = this;
var animationRunning = false;  // Process / Suspend ticks
var setDisplay       = function(){};

/*[ Helper: Avoid jQuery ]*******************************************
* Searches the HTML for a class or id
* @param  {String} search string representation of the HTML query
* @return {Object}
 */
function $(search){
    return document.querySelector(search);
}

/*[ HTML: Time ]*****************************************************
* Returns an HTML string with the current time
* @return {String}
 */
function updateTime() {
    var time = new Date();
    var amt  = "am";
    var hrs  = time.getHours().toString();
    var min  = time.getMinutes().toString();
    var sec  = time.getSeconds().toString();
    var ndx  = time.getSeconds() % 2;

    if (time.getHours() > 12) {
        amt = "pm";
        hrs = (time.getHours()-12).toString();
    }

    if (hrs == "0") hrs = "12";
    if (min.length == 1) min = '0' + min;
    if (sec.length == 1) sec = '0' + sec;
    
    return `${hrs}<span class="accent${ndx}">:</span>${min}<span class="accent${ndx}">.</span>${sec} <span class="${amt}">${amt}</span>`;
}

/*[ HTML: Date ]*****************************************************
* Returns an HTML string with the current date
* @return {String}
 */
function updateDate() {
    var date = new Date();
    var mth  = (date.getMonth()+1).toString();
    var day  = date.getDate().toString();
    var yer  = date.getFullYear().toString();
    var ndx  = date.getSeconds() % 2;

    return `${mth}<span class="accent${ndx}">-</span>${day}<span class="accent${ndx}">-</span>${yer}`;
}

/*[ Transition: Promises ]*******************************************
* Transition an objects opacity
* @param  {Number} op The opacity you want to transition to
* @param  {Number} delay Wait x microseconds after the animation
* @return {Promise}
 */
function transition(op, delay=0) {
    var ele = $('#mainContent');
    var set = (op == 1) ? [1, 0] : [0, 1];

    return new Promise(function(resolve) {
        ele.velocity({opacity: set}, {
            duration: 250,
            complete: function() { 
                setTimeout(function() {
                    resolve(ele); 
                }, 250 + delay);
            }
        });
    });
}

/*[ Transition: Change the display ]*********************************
* Execute a function that changes the on-screen display in a transition
* @param  {Number} fn Function to execute
 */
function mainTransition(fn) {
    var fnSave = setDisplay;

    if (!animationRunning) {
        animationRunning = true;
        $('#mainContent').style.cursor = "wait";
        $('#footer').style.cursor = "wait";
        transition(0).then(function(ele) {
            setDisplay = fn;
            transition(1, 1500).then(function() {
                transition(0).then(function(ele) {
                    setDisplay = fnSave;
                    transition(1);
                    animationRunning = false;
                    $('#mainContent').style.cursor = "pointer";
                    $('#footer').style.cursor = "pointer";
                });
            })
        })
    }
}

/*[ Transition: Change the mode ]************************************
* Fancy Transition functions to use when changing display modes
*/
function changeMode() {
    var mainContent   = $('#mainContent');
    var footer        = $('#footer');
    var footerContent = $('#footerContent');

    // Animations & Change the mode
    var hideFooter = new Once(function() {
        mainContent.velocity({lineHeight: ["120px", "90px"]}, {duration:250});
        footer.velocity({top: ["120px", "90px"]}, {delay:250, duration:250});
        footerContent.velocity({left: ["-340px", "0px"]}, {duration:250, complete: function() { modes.next(); }});
    });

    var showFooter = new Once(function() {
        modes.next();
        mainContent.velocity({lineHeight: ["90px", "120px"]}, {duration:250});
        footer.velocity({top: ["90px", "120px"]}, {delay:250, duration:250});
        footerContent.velocity({left: ["0px", "-340px"]}, {delay:250, duration:250});
    });

    var changeFooter = new Once(function() {
        footerContent.velocity({left: ["340px", "0px"]}, { 
            delay:250, 
            duration:250, 
            complete: function() { 
                modes.next(); 
                footerContent.velocity({left: ["0px", "340px"]}, { delay:250, duration:250 });
            }
        });
    });

    // Preview the next mode index (don't change it yet)
    var index = modes.previewNextIndex();

    // What animation to use
    var once = changeFooter;
    if (index == 1) once = showFooter;
    if (index == 0) once = hideFooter;

    // Execute 
    mainTransition(function() {
        once.exec();
        mainContent.innerHTML = `<span class="modes">${modes.name(index)}</span>`;
        footerContent.innerHTML = modes.display()();
    });
}

/*[ Start Here ]******************************************/

document.addEventListener('DOMContentLoaded', function() {
    var mainContent   = $('#mainContent');
    var footer        = $('#footer');
    var footerContent = $('#footerContent');

    // Add Display Modes
    modes.addMode([
        {
            name:    "Stopwatch", 
            reset:   function()   { },
            click:   function(ev) { stopwatch.click(ev) },
            display: function()   { return stopwatch.display() }
        },{
            name:    "Countdown", 
            reset:   function()   { },
            click:   function(ev) { countdown.click(ev) },
            display: function()   { return countdown.display() }
        }
    ]);

    // Display function, What to display on-screen
    setDisplay = function() {
        mainContent.innerHTML   = updateTime();
        footerContent.innerHTML = modes.display()();
    }

    // Listener : Update the date
    mainContent.addEventListener("click", function(){ 
        if (!animationRunning)
            mainTransition(function() {
                mainContent.innerHTML   = updateDate();
                footerContent.innerHTML = modes.display()();
            });
    });

    // Listener : Change the Display Mode
    mainContent.addEventListener("contextmenu", function(ev){
        ev.preventDefault(); 
        if (!animationRunning)
            changeMode();
    });
    
    // Listener : Footer Clicks
    footer.addEventListener("mouseup", function(ev){
        ev.preventDefault();
        if (!animationRunning)
            modes.click()(ev); 
    });

    // Update the display every ms
    setInterval(function() { setDisplay() }, 1);
}, false);
