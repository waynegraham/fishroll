/** Start Google Chrome Canary with open -a Google\ Chrome\ Canary --args --enable-media-stream  OR enable the flag in about:flags **/

var App = {

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
            i;

        if (canvas.width === 0 || canvas.height === 0) {
            canvas.resizeCanvas();
            return;
        }

        // TODO: remove
        App.video.volume = 0;
        ctx.drawImage(video, 0, 0);

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
            setTimeout(function() { App.start(effect); }, 500);
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
                }, 500);
            });
        } else {
            App.playing = setInterval(function() {
                App.drawToCanvas(effect);
            }, 500);
        }
    },

    stop : function() {
        if (App.playing != null) {
            clearInterval(App.playing);
            delete App.playing;
        }
    },

    resizeCanvas : function() {
        var canvas = jQuery(App.canvas),
            w      = App.video.videoWidth,
            h      = App.video.videoHeight;

        canvas.height(h);
        canvas.width(w);
        App.canvas.height = h;
        App.canvas.width  = w;

        // Center it on the screen.
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
(function(a,b){a.unprefix||(a.URL||(a.URL=a.webkitURL||a.msURL||a.oURL),b.getUserMedia||(b.getUserMedia=b.webkitGetUserMedia||b.mozGetUserMedia||b.msGetUserMedia));var c=!0,d=b.getUserMedia;try{b.getUserMedia({video:!0,audio:!0},function(){})}catch(e){c=!1}b.getUserMedia=function(e,f,g){var h,i,j=Object.keys(e),k={video:1,audio:1};if(!c)i=j.filter(function(a){return this[a]&&k[a]},e).join(",");else{i={};for(h in e)i[h]=e[h]&&k[h]}d.call(b,i,function(b){var c;b.label&&b.readyState===1&&(c=a.URL.createObjectURL(b)),f(b,c)},g||function(){})}})(typeof window=="object"&&window||this,this.navigator||{})
