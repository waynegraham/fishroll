/** Start Google Chrome Canary with open -a Google\ Chrome\ Canary --args --enable-media-stream  OR enable the flag in about:flags **/

var App = {

    scale    : 1.5,
    interval : 50,

    // Run if we do have camera support
    successCallback : function(stream) {
        if (window.webkitURL) {
            App.video.src = window.webkitURL ? window.webkitURL.createObjectURL(stream) : stream;
        }
        else {
            App.video.src = stream;
        }
    },

    // run if we dont have camera support
    errorCallback : function(error) {
        alert('An error occurred while trying to get camera access (Your browser probably doesnt support getUserMedia() ): ' + error.code);
        return;
    },


    drawToCanvas : function(effect) {
        var video   = App.video,
            ctx     = App.ctx,
            canvas  = App.canvas,
            rp      = App.renderPos,
            i;

        if (canvas.width === 0 || canvas.height === 0 ||
            rp.width === 0 || rp.height === 0) {
            App.resizeCanvas();
            return;
        }

        // TODO: remove
        App.video.volume = 0;
        ctx.drawImage(
            video,
            0, 0, video.videoWidth, video.videoHeight,
            rp.left, rp.top, rp.width, rp.height
        );

        App.pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Hipstergram!

        if (effect === 'hipster') {

            for (i = 0; i < App.pixels.data.length; i=i+4) {
                App.pixels.data[i + 0] = App.pixels.data[i + 0] * 3 ;
                App.pixels.data[i + 1] = App.pixels.data[i + 1] * 2;
                App.pixels.data[i + 2] = App.pixels.data[i + 2] - 10;
            }

            ctx.putImageData(App.pixels,0,0);
        }

        // Blur!

        else if (effect === 'blur') {
            stackBlurCanvasRGBA('output',0,0,515,426,20);
        }

        // Green Screen

        else if (effect === 'greenscreen') {
            /* Selectors */
            var rmin = $('#red input.min').val();
            var gmin = $('#green input.min').val();
            var bmin = $('#blue input.min').val();
            var rmax = $('#red input.max').val();
            var gmax = $('#green input.max').val();
            var bmax = $('#blue input.max').val();

            for (i = 0; i < App.pixels.data.length; i=i+4) {
                red = App.pixels.data[i + 0];
                green = App.pixels.data[i + 1];
                blue = App.pixels.data[i + 2];
                alpha = App.pixels.data[i + 3];

                if (red >= rmin && green >= gmin && blue >= bmin && red <= rmax && green <= gmax && blue <= bmax ) {
                    App.pixels.data[i + 3] = 0;
                }
            }

            ctx.putImageData(App.pixels,0,0);

        // Glasses!

        } else if (effect === 'glasses') {
            App.face(App.glasses, canvas, ctx);
        } else if (effect === 'fish') {
            App.face(App.fish, canvas, ctx);
        }


    },

    face : function(img, canvas, ctx) {
        var comp = ccv.detect_objects({
            "canvas"        : ccv.pre(canvas),
            "cascade"       : cascade,
            "interval"      : 5,
            "min_neighbors" : 1
        });
        var c;

        // Draw glasses on everyone!
        for (i = 0; i < comp.length; i++) {
            c = comp[i];
            ctx.drawImage(
                img,
                Math.floor(c.x), Math.floor(c.y),
                Math.floor(c.width), Math.floor(c.height)
            );
        }
    },

    start : function(effect) {
        if (App.video == null) {
            setTimeout(function() { App.start(effect); }, App.interval);
            return;
        }

        if (App.playing) {
            clearInterval(App.playing);
        }

        App.resizeCanvas();

        // If it's paused or ended, we can stop.
        if (App.video.paused || App.video.ended) {
            $(App.video).on('play', function() {
                App.playing = setInterval(function() {
                    App.drawToCanvas(effect);
                }, App.interval);
            });
        } else {
            App.playing = setInterval(function() {
                App.drawToCanvas(effect);
            }, App.interval);
        }
    },

    stop : function() {
        if (App.playing != null) {
            clearInterval(App.playing);
            delete App.playing;
        }
    },

    resizeCanvas : function() {
        var w  = Math.floor(App.scale * App.video.videoWidth),
            h  = Math.floor(App.scale * App.video.videoHeight),
            ch = App.canvas.clientHeight,
            cw = App.canvas.clientWidth;

        App.canvas.height = ch;
        App.canvas.width  = cw;

        App.renderPos = {
            top    : Math.floor((ch - h) / 2),
            left   : Math.floor((cw - w) / 2),
            width  : w,
            height : h
        };
    },

    loadImg : function(path) {
        var img = new Image();
        img.src = path;
        return img;
    }
};

App.init = function() {
    // Prep the document
    App.video = document.querySelector('video');

    App.glasses = App.loadImg("images/glasses.png");
    App.fish    = App.loadImg("images/fish.png");

    App.canvas = document.querySelector("#output");
    App.ctx    = App.canvas.getContext("2d");

    // Finally Check if we can run this puppy and go!
    if (navigator.getUserMedia) {
        navigator.getUserMedia('video', App.successCallback, App.errorCallback);
    }
};


document.addEventListener("DOMContentLoaded", function() {
    App.init();
}, false);


/*! Navigator Getusermedia - v0.1.0 - 3/9/2012
* https://github.com/rwldrn/navigator.getusermedia
* Copyright (c) 2012 Rick Waldron <waldron.rick@gmail.com>; Licensed MIT */
(function(e,t){var i;e.unprefix||(e.URL||(e.URL=e.webkitURL||e.msURL||e.oURL),t.getUserMedia||(t.getUserMedia=t.webkitGetUserMedia||t.mozGetUserMedia||t.msGetUserMedia)),i=t.getUserMedia,t.getUserMedia=i?function(a,r,U){i.call(t,a,function(t){var i;t.label&&1===t.readyState&&(i=e.URL.createObjectURL(t)),(t.createObjectURL||void 0!==t.currentTime)&&(i=t),r(i,t)},U||function(){})}:void 0})("object"==typeof window&&window||this,this.navigator||{});

