// counter for search-cycles
let cycleCount = 0;

// flag for search-status
let searching = false;

// values to search through
let vals = [];

// delay between search-phases (minimum 1000 due to CSS transitions)
const delay = 1000;

function setStatusText(statusText) {
    jQuery(".status .text").text(statusText);
}

// map value to color
function valToColor(val) {
    return `hsl(${230 - val}, 100%, 50%)`;
}

function getElVal(el) {
    return parseInt(jQuery(el).text());
}

function unflagSearching() {
    searching = false;
    jQuery("main").removeClass('searching');
}

// restart with a new set of numbers
function newNumbers() {
    // generate a random counter between [valsCountMin] and [valsCountMax]
    const valsCountMin = 20;
    const valsCountMax = 40;
    const valsCount = Math.round(Math.random() * (valsCountMax - valsCountMin) + valsCountMin);

    // generate [valsCount] distinct random numbers, with values between 1 and [valMax]
    // using "Set" to ensure distinct values
    const valMax = 99;
    if (valsCount > valMax) {
        finishSearch();
        setStatusText('Invalid config!');
        return;
    }
    const valsSet = new Set();
    while (valsSet.size !== valsCount) {
        valsSet.add(Math.floor(Math.random() * valMax) + 1);
    }

    // sort the numbers as a TypedArray (i.e. numerical sort, not alphabetical sort)
    vals = new Uint8Array([...valsSet]).sort();

    // (re)generate DOM elements for each number
    cycleCount = 0;
    unflagSearching();
    jQuery(".container").empty();
    vals.forEach( val => {
        jQuery(".container").append(`<div id="${val}" class="val" style="height: ${(4 * val) + 20}px; background-color: ${valToColor(val)};">${val}</div>`);
    });
    setStatusText('Pick a number');
    jQuery("main").removeClass('finished');
}

// update DOM elements based on the remaining numbers
function updateNumbers() {
    jQuery(".container .val").each(function() {
        const val = getElVal(this);
        if (vals.indexOf(val) == -1 ) {
            jQuery(this).addClass('deleted');
            setTimeout(() => {
                jQuery(this).remove();
            }, delay);
        }
    });
}

// stop the search
function finishSearch() {
    unflagSearching();
    setStatusText(`Search finished`);
    jQuery("main").addClass('finished');
    jQuery("h1 .fa-recycle").addClass('fa-spin');
}

// run the actual search recursively
function runSearch(searchVal) {
    cycleCount++;
    setStatusText(`Search cycle #${cycleCount}`);
    halfCount = Math.round(vals.length / 2);
    midVal = vals[halfCount - 1];
    if (searchVal == midVal || vals.length == 1) {
        finishSearch();
    }
    else {
        jQuery(`.container #${midVal}`).addClass('checking');
        if (searchVal > midVal) {
            // keep the 2nd half
            vals = vals.slice(halfCount);
        }
        else {
            // keep the 1st half
            vals = vals.slice(0, halfCount - 1);
        }
        setTimeout(function() {
            updateNumbers();
        }, delay);
        setTimeout(function() {
            runSearch(searchVal);
        }, (delay * 2));
    }
}

// initialize the binary search
function initSearch(el) {
    searching = true;
    jQuery("main").addClass('searching');
    jQuery(el).addClass('selected');
    const searchVal = getElVal(el);
    setStatusText(`Searching`);
    setTimeout(function() {
        runSearch(searchVal);
    }, delay);
}

// init first set of numbers
newNumbers();

// attach behaviour to DOM elements
jQuery("h1").mouseover(function() {
    jQuery(this).find(".fa-recycle").addClass('fa-spin');
});
jQuery("h1").mouseout(function() {
    jQuery(this).find(".fa-recycle").removeClass('fa-spin');
});
jQuery("h1").click(function() {
    // do not restart with a new set of numbers during an ongoing search
    if (!searching) {
        newNumbers();
    }
});
jQuery("body").on('click', ".container .val", function() {
    // do not initialize a binary search during an existing search-session
    if (!searching && !jQuery("main").hasClass('finished')) {
        initSearch(this);
    }
});
