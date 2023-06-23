// Title: Sphere (javascript with knitout module)
// Include knitout module:
const knitout = require('knitout');
const K = new knitout.Writer({ carriers:['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] });
K.addHeader('Machine', 'SWGN2');

// ------------------Parameters-------------------
// Pattern Parameters: 
// Pat: defines pattern in terms of delta increases per section of the row.

// For hard-coded sphere-like object use:
// let pat = [2, 2, 0, 2, 0, 2, 0, 2, 0,2,0,2,0,-2,0,-2, 0, -2, 0, -2, 0,-2, 0, -2]
let pat = [2,2,2,2,2,2,2,2,-2,-2,-2,-2,-2,-2,-2,-2];
let heights = [2,3,4,5,6,6,7,8,8,7,6,6,5,4,3,2];

let caston_height = pat[0];
// For turd-like spheroid object:
// let pat = [10, 2, 0, 2, 0, 2, 0, 2, 0,-2, 0, -2, 0, -2, 0,-2, 0, -2, -2, 0, 2, 0,2,2, 0,-2, 0, -2, -2, -2,-2,-0,2, 2,0, -2, -2, -2,-2,-2,-2]

// Inc_offset determines where we should start reading the pattern to determine increases.
// As the bottom of sphere will be looser than the top. 
let inc_offset = 4; 

// Rows: # of rows/delta change within the pattern itself. 
let rows = pat.length; 

// Sections: # of "peels" for the "orange" (sphere). 
// I.e. if we have three sections, then there will be a total of 6 sections in the object.
let sections = 5; 

// Machine Parameters:
let carrier = "3"; 

// TODO: Ensure code also works for quarter gauge, specifically bindoff sequence. 
let gauge = 2; 
let min = 1; 

// Max: Needle number of right edge, always must be even. 
// In other words, this defines the size of one section of the sphere. 
// The code will adjust this number to account for all of the spheres.
let max = 2*pat[0] +2*Math.floor((1/2)); 

// ------------------- Helper functions --------------------
/* Bindoff for the front bed of tube. 

 * min: the needle to start the bindoff on. 
 * max: the needle to stop the bindoff on. 
 * g: gauge
 */
function bindoff_front(min, max, slack, g, tube){
    for (let i = max; i > min + 1; i -= 1) {
        if ((i % 2 == 0)||(!tube)) {
            K.tuck("+", "b" + (i + g*slack), carrier); 
            K.rack(g);
            K.xfer("f" + i, 'b' + (i - g));
            K.rack(0);
            K.xfer("b" + (i - g), "f" + (i - g)); 
            K.knit("-", "f" + (i - g), carrier)
        }
    }
}

/* Bindoff for the back bed of half-gauge tube. 

 * min: the needle to start the bindoff on. 
 * max: the needle to stop the bindoff on. 
 * g: gauge
 */
function bindoff_back(min, max, slack, g, tube){
    for (let i = min; i < max - 1; i += 1) {
        if ((i % 2 != 0)||(!tube)) {
            K.tuck("-", "f" + (i - g*slack), carrier); 
            K.rack(g);
            K.xfer("b" + (i), 'f' + (i + g));
            K.rack(0);
            K.xfer("f" + (i + g), "b" + (i + g)); 
            K.knit("+", "b" + (i + g), carrier);
        }
    }
}

/* Knits a tag on the last loop after the bindoff

 * last: the needle to start the tag on
 */
function tag(last) {
    // Knit small 3 x 3 tag. 
    // TODO: This could be modularized to use X wale, Y courses high stitches. 

    K.knit("+", "f" + (last), carrier);
    K.knit("-", "f" + (last + 2), carrier);
    K.knit("-", "f" + (last), carrier);
    K.knit("+", "f" + (last), carrier);
    K.knit("+", "f" + (last + 2), carrier);
    K.knit("-", "f" + (last + 4), carrier);
    K.knit("-", "f" + (last + 2), carrier);
    K.knit("-", "f" + (last), carrier);
    K.knit("+", "f" + (last), carrier);
    K.knit("+", "f" + (last + 2), carrier);
    K.knit("+", "f" + (last + 4), carrier);
    K.knit("-", "f" + (last + 4), carrier);
    K.knit("-", "f" + (last + 2), carrier);
    K.knit("-", "f" + (last), carrier);
    K.knit("+", "f" + (last), carrier);
    K.knit("+", "f" + (last + 2), carrier);
    K.knit("+", "f" + (last + 4), carrier);
    
    // Drop the three needles in use for the tag. 
    K.drop("f", (last));
    K.drop("f", (last + 2));
    K.drop("f", (last + 4));
}


/* This function performs a stretchy bind off on a tube, with tucks made on opposite bed
 * before xfers for every loop and dropped after knitting through them for stretchiness.
 * After the bindoff, a tag is knit.

 * min, max: the leftmost and rightmost needle numbers. 
 */
 function bindoff_tube(min, max) {
    // Knit front side of bindoff. 
    bindoff_front(min, max, 0, gauge, true);

    K.rack(1);
    K.xfer("f" + (min + 1), "b" + min);
    K.rack(0);
    K.knit("+", "b" + min, carrier);

    // Knit back side of bindoff.
    bindoff_back(min, max, 0, gauge, true);

    // Drop all needles used for the bindoff. 
    for (let i = max; i >= min; i--) {
        K.drop("f", i);
    }
    for (let i = min; i < max - 1; i++) {
        K.drop("b", i);
    }

    K.drop("b", max);

    // Tag. 
    K.xfer("b" + (max - 1), "f" + (max - 1));
    tag(max - 1, carrier);
}

/* This function performs a stretchy bind off that closes a tube.
 * After the bindoff, a tag is knit.

 * min, max: the leftmost and rightmost needle numbers. 
 */
function bindoff_closed(min, max) {
    // Xfer all back loops to front:
    for (let n = temp_min; n <= sections*max; n += gauge) {
        K.xfer('b' + n, 'f' + n);
    }

    // Knit front side of bindoff.
    bindoff_front(min - 1, max , 0, 1, false);

    // Drop all needles used for the bindoff. 
    for (let i = min; i < max; i++) {
        K.drop("b", i);
    }
    K.drop("b", max);

    // Tag. 
    K.xfer("f" + (max), "b" + (max));
    tag(min , carrier);

}

/* This function increases entire row in pattern by [pattern_offset] in each section. 
 *
 * Offset: represents delta change per section, i.e. increases [offset] after each section.
 */
function row_inc(pattern_offset, h) {
    for (let i = 1; i <= sections; i++){
        temp_min = min
        temp_max= (i)*max + (i)*pattern_offset - 1;
        
        // TODO: Reduce number of overall transfers in pattern.
        // First, xfer ALL stitches from back to front.
        for (let n = temp_min; n <sections*max + i*pattern_offset - 1; n += gauge) {
            K.xfer('b' + n, 'f' + n);
        }

        // Then, xfer ALL stitches back, from front to back with no offset
        for (let n = temp_min; n < temp_max; n += 1) {
            K.xfer('f' + n, 'b' + n);
        }

        // Apply offset to remaining stitches. 
        K.rack(-pattern_offset);
        for (let n = temp_max; n <  sections*max + i*pattern_offset - 1; n += 1) {
            n2= n + pattern_offset;
            K.xfer('f' + n, 'b' + n2);
        }
        K.rack(0);
        
        // xfer approp front stitches back to front with appropriate offsets per section. 
        for (let n = sections*max + i*pattern_offset; n >= min; n -= gauge) {
            K.xfer('b' + n, 'f' + n);
        }
    }

    // Secure row + Add split increases. 
    for (let i = sections; i >= 1; i--){
        temp_max = i*(max + pattern_offset);
        temp_min = (i - 1)*(max + pattern_offset);
        
        K.rack(-pattern_offset)
        K.split("-",  "f" + (temp_max - pattern_offset), "b" + (temp_max), carrier)
        K.rack(0)
        K.xfer("b" + (temp_max), "f" + (temp_max));
        
        for (let n = temp_max - pattern_offset - 2; n > temp_min; n -= gauge) {
            K.knit("-", 'f' + n, carrier);
        }
    }

    // Secure row + Add split increases on the back. 
    for (let i = 1; i <= sections; i++){
        temp_max = i*(max + pattern_offset) - 1;
        temp_min = (i - 1)*(max + pattern_offset) - 1;
        for (let n = temp_min + 2; n < temp_max - pattern_offset - 1; n += gauge) {
            K.knit("+", 'b' + n, carrier);
        }

        K.rack(pattern_offset);
        K.split("+",  "b" + (temp_max - pattern_offset), "f" + (temp_max), carrier)
        K.rack(0);
        K.xfer("f" + (temp_max), "b" + (temp_max));
    }


    // Secure increases by knitting through row [h] # of times.. 
    for (let s = 0; s < h; s++){
        temp_min = min;
        temp_max = max*sections + pattern_offset*(sections);
        for (let n = temp_max; n >= temp_min; n -= gauge) {
            K.knit("-", 'f' + n, carrier);
        }
        for (let n = temp_min; n <= temp_max; n += gauge) {
            K.knit("+", 'b' + n, carrier);
        } 
    }
    max = max + pattern_offset;
}

/* This function decreases entire row in pattern by [pattern_offset] in each section. 
 *
 * Offset: represents delta change per section, i.e. decreases [offset] after each section.
 */
function row_dec(pattern_offset, h) {
    for (let i = 1; i <= sections; i++){
        temp_min = min
        temp_max = (i)*max - (i)*pattern_offset;

        // TODO: Reduce number of overall transfers in pattern.
        // First, xfer ALL stitches from back to front.
        for (let n = temp_min; n <= sections*max + i*pattern_offset; n += gauge) {
            K.xfer('b' + n, 'f' + n);
        }

        // Then, xfer appropriate stitches for this section from front to back.
        // This starts by only doing the increases for the front row to prevent interlocking between beds. 
        for (let n = temp_min; n <= temp_max; n += gauge) {
            K.xfer('f' + n, 'b' + n);
        }

        // Begin process of decreases by offsetting the rest of the appropriate needles by 1. 
        K.rack(pattern_offset);
        for (let n = temp_max; n <= sections*max + i*pattern_offset; n += 1) {
            if ((sections*max - n) % gauge !== 0) {
                n2= n - pattern_offset; 
                K.xfer('f' + n, 'b' + n2);           
            }
        }
        K.rack(0);
        
        // Do the same for the needles corresponding to the back bed. 
        for (let n = temp_min + 1; n <= temp_max; n += gauge) {
            K.xfer('f' + n, 'b' + n);
        }

        K.rack(pattern_offset);
        for (let n = temp_max; n <= sections*max + i*pattern_offset; n += 1) {
            if ((sections*max - n) % gauge === 0) {
                n2= n - pattern_offset; 
                K.xfer('f' + n, 'b' + n2);           
            }
        }
        K.rack(0);

        for (let n = sections*max - i*pattern_offset; n >= min; n -= gauge) {
            K.xfer('b' + n, 'f' + n);
        }
    }

    // Secure decreases by knitting through row [h] # of times.. 
    for (let s = 0; s < h; s++){
        temp_min = min;
        temp_max = max*sections - pattern_offset*(sections);
        for (let n = temp_max; n >= temp_min; n -= gauge) {
            K.knit("-", 'f' + n, carrier);
        }
        for (let n = temp_min; n <= temp_max; n += gauge) {
            K.knit("+", 'b' + n, carrier);
        } 
    }
    
    max = max - pattern_offset;
}

/* This function simply knits a row accross tube.
 */

function row_no_offset(h){
    // Secure stitches by knitting through row [height] # of times.. 
    for (let s = 0; s < h; s++){
        temp_min = min;
        temp_max = max*sections;
        for (let n = temp_max; n >= temp_min; n -= gauge) {
            K.knit("-", 'f' + n, carrier);
        }
        for (let n = temp_min; n <= temp_max; n += gauge) {
            K.knit("+", 'b' + n, carrier);
        } 
    }
}

/* ------------------------------ CAST-ON ------------------------------ */
// Start tucking onto needles right-to-left:
function create_caston(){
    let temp_max, temp_min;
    for (let i = sections; i >= 1; i--){
        temp_max = i *max
        temp_min = (i - 1)*max + 1;
        for (let n = temp_max; n >= temp_min; n -= gauge) {
            //tuck alternating needles starting at the right edge:
            if ((sections*max - n) % 4*gauge === 0) {
                K.tuck("-", 'f' + n, carrier);
            }
        }
    }

    // ...continue clockwise around the tube to the back bed:
    for (let i = 1; i <= sections; i++){
        temp_min = (i-1)*max + 1;
        temp_max = (i)*max
        for (let n = temp_min; n <= temp_max; n += gauge) {
            //note that adding 1+max-min preserves the alternating-needles pattern:
            if ((1 + sections*max - min + n - min) % 4*gauge === 0) {
                K.tuck("+", 'b' + n, carrier);
            }
        }
    }

    // ...continue clockwise around the tube to the front bed and fill in needles missed the first time:
    for (let i = sections; i >= 1; i--){
        temp_max = i*max;
        temp_min = (i-1)*max + 1;
        for (let n = temp_max; n >= temp_min; n -= gauge) {
            if ((sections*max - n) % 4*gauge !== 0) {
                K.tuck("-", 'f' + n, carrier);
            }
        }
    }

    // ...finally, fill in the rest of the back bed:
    for (let i = 1; i <= sections; i++){
        temp_min = (i-1)*max + 1;
        temp_max = (i)*max
        for (let n = temp_min; n <= temp_max; n += gauge) {
            if ((1+sections*max-min + n - min) % 4*gauge !== 0) {
                K.tuck("+", 'b' + n, carrier);
            }
        }
    }


    // Secure cast-on below.
    for (let i = sections; i >= 1; i--){
        temp_max = i*max;
        temp_min = (i-1)*max + 1;
        for (let n = temp_max; n >= temp_min; n -= gauge) {
            K.knit("-", 'f' + n, carrier);
        }
    }

    // Send the yarn inserting hook out -- yarn should be well-enough held by the needles at this point.
    K.releasehook(carrier);
        

    // Finish the back of the row of plain knitting:
    for (let i = 1; i <= sections; i++){
        temp_min = (i-1)*max + 1;
        temp_max = (i)*max
        for (let n = temp_min; n <= temp_max; n += gauge) {
            K.knit("+", 'b' + n, carrier);
        }
    }
}

// Knit [caston_height] # of rows of plain knitting to let the cast-on stitches relax:
// This is mostly just to ensure the cast-on is extra secure for when we manually tighten the sphere. 
function secure_caston(h){
    let temp_max, temp_min;
    for (let k= 1; k < h; k++){
        for (let i = sections; i >= 1; i--){
            temp_max = i*max
            temp_min = (i-1)*max + 1
            for (let n = temp_max; n >= temp_min; n -= gauge) {
                K.knit("-", 'f' + n, carrier);
            }
        }

        // Back row.
        for (let i = 1; i <= sections; i++){
            temp_min = (i-1)*max + 1
            temp_max= (i)*max
            for (let n = temp_min; n <= temp_max; n += gauge) {
                K.knit("+", 'b' + n, carrier);
            }
        }
    }
}

/* ---------------------------------------------------------------------
   --------------------------------------------------------------------- 
   --------------------------------------------------------------------- */


/* ------------------------------ CAST-ON ------------------------------ */
K.inhook(carrier);
create_caston();
secure_caston(caston_height);

/* ------------------------------ PATTERN ------------------------------ */
for (let k = 1; k < rows; k++){ 
    let pattern_offset = pat[k];
    let pattern_height = heights[k];
    if (pattern_offset == 0) {
        row_no_offset(pattern_height);
    } else if (pattern_offset < 0){
        row_dec(-pattern_offset, pattern_height);
    } else{
        row_inc(pattern_offset, pattern_height);
    }
}

/* ----------------------------- BIND-OFF ------------------------------ */
// For tube/open bindoff: bindoff_tube(min, sections*max);
bindoff_closed(min, sections*max); 
//bindoff_tube(min, sections*max);
K.outhook(carrier);
K.write('sphere.k');