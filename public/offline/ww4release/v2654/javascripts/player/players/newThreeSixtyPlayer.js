define(["jquery", "underscore", "AbstractPlayer", "DeviceOrientationModule", "pubsub", "globals", "modernizr", "LogEvent", "apiService", "require-shim", "libpannellum2", "pannellum2", "iphone-inline-video"], function ($, _, AbstractPlayer, DeviceOrientationModule, PubSub, globals, Modernizr, LogEvent, apiService, requireShim, libpannellum2, pannellum2, makeVideoPlayableInline) {
    "use strict";

    //  24/07/2018 - Henry
    //  new 360 player

    var self;
    var Player = AbstractPlayer.extend({

        init: function (videoElementContainer, updateScrubFn, playerOptions, readyCallback, errorCallback, videoData) {
            this._super(videoElementContainer, updateScrubFn, playerOptions, readyCallback, errorCallback, videoData);
            self = this;

            /* SET ALL INIT CONFIGS */
            self.refreshRate = globals.IS_IPHONE ? 5 : 0; // smaller number = faster

            self.vidId = $(videoElementContainer).attr('data-vidid');
            self.stallLoopCount = 0;
            self.lastCheckedStallTime = 0;
            self.has360Controls = !(globals.CLICK_EVENT === 'touchend');
            self.has360Radar = true;
            self.canUpdate360View = true;
            self.renditionCodes = videoData.renditionCodes;
            self.touchesInAction = {};
            // dragDisabled will allow the video to continue playing but stop the view moving by click & drag, touch & drag or device move
            self.dragDisabled = false;

            if (window.wirewax.vidOverride) {
                self.vidId = window.wirewax.vidOverride;
            }

            self.posterUrl = window.wirewax.cdnUrl + 'vidData/' + self.vidId + '/poster/poster.jpg';

            if (window.wirewax.blackPoster) {
                self.posterUrl = '//edge-assets.wirewax.com/creativeData/pureblack.jpg';
            }else if (window.wirewax.posterUrl) {
                self.posterUrl = window.wirewax.posterUrl;
            }

            globals.PREVENT_VIDEO_CLICK = true;
            globals.ENABLE_360_METRICS = true;

            self.forceVideoElementContainerAsResizeReference = true;
            self._time = 0;
            self.config = {
                hfov: globals.HFOV,
                minHfov: 50,
                maxHfov: 120,
                pitch: 0,
                minPitch: -85,
                maxPitch: 85,
                yaw: videoData.startingYaw360 || globals.STARTING_YAW,
                minYaw: -180,
                maxYaw: 180,
                haov: 360,
                vaov: 180,
                vOffset: 0,
                autoRotate: false,
                autoRotateInactivityDelay: -1,
                type: 'equirectangular',
                northOffset: 0,
                dynamic: true,
                debug: window.wirewax.debug
            };
            self.deviceConfig = {
                deviceYaw: 0,
                devicePitch: 0,
                deviceYawDefice: 0,
                devicePitchDefice: 0
            };

            self.videoElement = $('<div id="wireWaxVideo"></div>');

            if(videoData.fixedImage360) {
                self.fixedImage360 = videoData.fixedImage360;
                globals.ENABLE_IMAGE_SOURCE = true;
            }

            if(globals.IS_IE_11 || globals.IS_EDGE){
                // IE11 workaround since webgl doesn't accept video
                // https://connect.microsoft.com/IE/feedbackdetail/view/941984/webgl-video-upload-to-texture-not-supported
                globals.ENABLE_VIDEO_CANVAS_SOURCE = true;
            }

            // if (globals.IS_SAFARI || globals.IS_IPAD || globals.IS_IE_11 || globals.IS_IPHONE) {
            //     globals.ENABLE_ALT_VIDEO_SOURCE = true;
            // }
            //
            // if(globals.ENABLE_ALT_VIDEO_SOURCE && !window.wirewax.offline){
            //     self.cdnURL = window.location.href.indexOf('wirewax.tv') > -1 ? '//embed.wirewax.tv/' : '//embed.wirewax.com/';
            // }

            self.overrideGlobalRendition();
            self.create360Video(videoElementContainer, readyCallback);

            self.buildTurnPhonePanel();
            self.setOrientationChangeListenner();

            if (!globals.IS_DESKTOP){
                self.deviceOrientationModule = new DeviceOrientationModule(function (deviceOrientation) {
                    self.update360ViewByDeviceOrientation(deviceOrientation.alpha, deviceOrientation.gamma, null);
                });
            }

            PubSub.subscribe(globals.WIDGET_SHOWN, function (e) {
                self.canUpdate360View = false;
            });
            PubSub.subscribe(globals.WIDGET_CLOSED, function (e) {
                self.canUpdate360View = true;
            });

            PubSub.subscribe(globals.ENABLE_AUDIO, self.enableAudio);
        },
        create360Video: function(videoElementContainer, readyCallback){
            var mp4VidUrl4K = '';
            var webmidUrl4k = '';

            if(globals.IS_DESKTOP && globals.BANDWIDTH_PREFERRED_RENDITION === "4k"){
                mp4VidUrl4K = self.cdnURL + 'vidData/' + self.vidId + '/' + self.vidId + '_' + '4k' + '.mp4';
                // 31 is the enum for 4k vp9 but uses .webm extension
                // 30 is for .webm
                if (self.renditionCodes && (_.contains(self.renditionCodes.split(','), "31") || _.contains(self.renditionCodes.split(','), "30"))){
                    webmidUrl4k = self.cdnURL + 'vidData/' + self.vidId + '/' + self.vidId + '_4k.webm';
                }
            }

            var mp4VidUrl = self.cdnURL + 'vidData/' + self.vidId + '/' + self.vidId + '_' + globals.RENDITION + '.mp4';
            var webmVidUrl = self.cdnURL + 'vidData/' + self.vidId + '/' + self.vidId + '_' + globals.RENDITION + '.webm';

            self.internalVideoElement = self.createVideoElement(self.posterUrl, mp4VidUrl, webmVidUrl, mp4VidUrl4K, webmidUrl4k);
            self.setupLoadTimeEvent();

            if(globals.ENABLE_IMAGE_SOURCE){
                self.createImageSource();
                self.config.dynamic = false;
            }if(globals.ENABLE_VIDEO_CANVAS_SOURCE){
                self.createVideoInCanvasSource();
            }else{
                self.source360 = self.internalVideoElement;
            }

            try {
                self.renderer = new libpannellum2.renderer(self.videoElement[0], self.source360, self.config.type, self.config.dynamic);

                window.setTimeout(function(){
                    readyCallback(self.videoElement);
                }, 50);


            } catch (event) {
                if (event.type == 'webgl error' || event.type == 'no webgl') {
                    PubSub.publish(globals.ERROR, new LogEvent(globals.ERROR, globals.ERRORS['5004']));
                } else if (event.type == 'webgl size error') {
                    PubSub.publish(globals.ERROR, new LogEvent(globals.ERROR, globals.ERRORS['5003']));
                }
            }

            $(videoElementContainer).append(self.videoElement);

        },
        setOrientationChangeListenner: function(){
            if (window != window.top) {
                PubSub.subscribe(globals.DEVICE_SCREEN_ORIENTATION, function (eventName, screenOrientation) {
                    self.screenOrientation = screenOrientation;
                    self.handleScreenOrientation();
                });
            } else {
                self.screenOrientation = window.orientation;
                window.addEventListener("orientationchange", function () {
                    self.screenOrientation = window.orientation;
                    self.handleScreenOrientation();
                }, false);
            }
        },

        getYawAndPitch: function() {
            return {
                yaw: self.config.yaw,
                pitch: self.config.pitch
            };
        },
        handleScreenOrientation: function () {
            if (!globals.IS_DESKTOP && !window.wirewax.allow360Portrait && self.controlEventsAttached) {
                switch (self.screenOrientation) {
                    case 0:
                    case 180:
                        self.showTurnPhonePanel();
                        break;
                    case -90:
                    case 90:
                        self.config.forceUpdate = true;
                        self.hideTurnPhonePanel();
                        break;
                    default:
                        break;
                }
            }
        },
        buildTurnPhonePanel: function () {
            self.turnPhonePanel = $('<img class="turn-phone-message" src="https://edge-assets.wirewax.com/creativeData/360/360message-01.svg">');
            $('#control-overlay').append(self.turnPhonePanel);
        },
        showTurnPhonePanel: function () {
            $(self.turnPhonePanel).show();
            $('#tag-overlay').hide();
        },
        hideTurnPhonePanel: function () {
            $(self.turnPhonePanel).hide();
            $('#tag-overlay').show();
        },

        attachControlEvents: function (element) {
            if (self.controlEventsAttached) {
                return;
            }
            element.addEventListener('mousemove', _.throttle(this.onMouseMove.bind(this), 40), false);
            element.addEventListener('mousedown', this.onMouseDown.bind(this), false);
            element.addEventListener('mouseup', this.onMouseUp.bind(this), false);
            $(document)[0].addEventListener('keydown', _.throttle(this.onKeyDown.bind(this), 40), false);
            // 360 with touch
            element.addEventListener("touchstart", self.touchStartHandler, false);
            element.addEventListener("touchmove", self.touchMoveHandler, false);
            element.addEventListener("touchend", self.touchEndHandler, false);

            self.controlEventsAttached = true;
            self.handleScreenOrientation();
        },

        touchStartHandler: function (event) {
            if (self.dragDisabled === false) {
                if (event.target.id === "tag-overlay") {
                    var touches = event.changedTouches;
                    self.touchesInAction["$" + touches[0].identifier] = {
                        identifier: touches[0].identifier,
                        pageX: touches[0].pageX,
                        pageY: touches[0].pageY,
                        yaw: self.config.yaw,
                        pitch: self.config.pitch
                    };
                    if (globals.IS_IPHONE || globals.IS_IPAD) {
                        //Note: IOS doesnt recognise the dblclick event so we need to set this
                        self.checkDoubletap();
                    }

                    event.stopPropagation();
                }
            }
        },

        checkDoubletap: function () {
            var now = new Date().getTime();
            var timesince = now - self.mylatesttap;
            if ((timesince < 400) && (timesince > 0) && (!globals.DISABLE_MOBILE_DOUBLE_TAP || globals.IS_DESKTOP)) {
                if(!globals.PREVENT_VIDEO_DOUBLE_CLICK) {
                    self.playPause();
                }
            }
            self.mylatesttap = new Date().getTime();
        },

        touchMoveHandler: function (event) {
            if (event.target.id === "tag-overlay") {
                event.preventDefault();
                var touches = event.changedTouches;
                var theTouchInfo = self.touchesInAction["$" + touches[0].identifier];
                var canvas = self.renderer.getCanvas();
                var yaw = ((Math.atan(theTouchInfo.pageX / canvas.width * 2 - 1) - Math.atan(touches[0].pageX / canvas.width * 2 - 1)) * 180 / Math.PI * self.config.hfov / 30) + theTouchInfo.yaw;
                self.config.yaw = yaw % 360;

                var vfov = 2 * Math.atan(Math.tan(self.config.hfov / 360 * Math.PI) * canvas.height / canvas.width) * 180 / Math.PI;

                var pitch = ((Math.atan(touches[0].pageY / canvas.height * 2 - 1) - Math.atan(theTouchInfo.pageY / canvas.height * 2 - 1)) * 180 / Math.PI * vfov / 45) + theTouchInfo.pitch;
                self.config.pitch = pitch % 360;

                self.setDeviceOrientationStartPosition(self.config.yaw, self.config.pitch);
                self.onLoopUpdate();
            }
        },
        touchEndHandler: function(){
            self.touchesInAction = {};
        },

        valBetween: function (v, min, max) {
            return (Math.min(max, Math.max(min, v)));
        },

        setDeviceOrientationStartPosition: function(newYaw, newPitch){
            self.deviceConfig.deviceYawDefice = self.deviceConfig.deviceYaw - newYaw;
            self.deviceConfig.devicePitchDefice = self.deviceConfig.devicePitch - newPitch;
        },

        update360ViewByDeviceOrientation: function (newYaw, newPitch) {
            if (self.dragDisabled === false && $.isEmptyObject(self.touchesInAction)) {
                var maxPitchView = 45;
                var minPitchView = -45;

                self.deviceConfig.deviceYaw = newYaw % 360;
                self.deviceConfig.devicePitch = newPitch;
                newYaw = newYaw - self.deviceConfig.deviceYawDefice % 360;
                newPitch = newPitch - self.deviceConfig.devicePitchDefice;
                var yawChange = (self.config.yaw - newYaw) % 360;
                var pitchChange = (self.config.pitch - newPitch) % 360;
                if (self.checkYawThresholds(yawChange) || self.config.forceUpdate) {
                    self.config.yaw = newYaw;
                }

                if ((self.config.forceUpdate || self.checkPitchThresholds(pitchChange)) && newPitch <= maxPitchView && newPitch >= minPitchView) {
                    self.config.pitch = newPitch;
                }

                self.config.forceUpdate = false;
                self.onLoopUpdate();
            }
        },
        checkYawThresholds: function (yawChange) {
            var minYawView = 0;
            var maxYawView = 360;
            var maxYawDiff = 40;
            var minYawView_PositiveThreshold = minYawView + maxYawDiff;
            var minYawView_NegativeThreshold = minYawView - maxYawDiff;
            var maxPositiveYawView_NegativeThreshold = maxYawView - maxYawDiff;
            var maxNegativeYawView_PositiveThreshold = maxYawDiff - maxYawView;
            return ((yawChange < minYawView_PositiveThreshold && yawChange > minYawView_NegativeThreshold) || ( yawChange < maxNegativeYawView_PositiveThreshold && yawChange >= (maxYawView * -1) ) || ( yawChange > maxPositiveYawView_NegativeThreshold && yawChange <= maxYawView ));
        },
        checkPitchThresholds: function (pitchChange) {
            var threshold = 40;
            return (pitchChange < threshold && pitchChange > -threshold);
        },
        onKeyDown: function (event) {
            switch (event.keyCode) {
                case 37:
                    self.goLeft();
                    break;
                case 38:
                    self.goDown();
                    break;
                case 39:
                    self.goRight();
                    break;
                case 40:
                    self.goUp();
                    break;
            }

            event.stopPropagation();
        },
        goLeft: function (factor) {
            factor = factor || 1;
            self.config.yaw = (self.config.yaw - factor) % 360;

            if (!self.playing()) {
                self.onLoopUpdate();
            }
        },
        goRight: function (factor) {
            factor = factor || 1;
            self.config.yaw = (self.config.yaw + factor) % 360;

            if (!self.playing()) {
                self.onLoopUpdate();
            }
        },
        goUp: function (factor) {
            factor = factor || 1;
            self.config.pitch = Math.max(self.config.pitch - factor, -85);

            if (!self.playing()) {
                self.onLoopUpdate();
            }
        },
        goDown: function (factor) {
            factor = factor || 1;
            self.config.pitch = Math.min(self.config.pitch + factor, 85);

            if (!self.playing()) {
                self.onLoopUpdate();
            }
        },
        onMouseMove: function (event) {
            if (self.dragDisabled === false) {
                if (self.isUserInteracting) {
                    self.latestInteraction = Date.now();
                    var canvas = self.renderer.getCanvas();
                    var pos = self.mousePosition(event);
                    var yaw = ((Math.atan(self.onPointerDownPointerX / canvas.width * 2 - 1) - Math.atan(pos.x / canvas.width * 2 - 1)) * 180 / Math.PI * self.config.hfov / 30) + self.onPointerDownYaw;
                    self.yawSpeed = (yaw - self.config.yaw) % 360 * 0.2;
                    self.config.yaw = yaw;

                    var vfov = 2 * Math.atan(Math.tan(self.config.hfov / 360 * Math.PI) * canvas.height / canvas.width) * 180 / Math.PI;

                    var pitch = ((Math.atan(pos.y / canvas.height * 2 - 1) - Math.atan(self.onPointerDownPointerY / canvas.height * 2 - 1)) * 180 / Math.PI * vfov / 45) + self.onPointerDownPitch;
                    self.pitchSpeed = (pitch - self.config.pitch) * 0.2;
                    self.config.pitch = pitch;

                    if (!self.playing()) {
                        self.onLoopUpdate();
                    }
                }
            }
        },
        mousePosition: function (event) {
            var bounds = $('#waxxer')[0].getBoundingClientRect();
            var pos = {};
            pos.x = event.clientX - bounds.left;
            pos.y = event.clientY - bounds.top;
            return pos;
        },
        mouseEventToCoords: function (event) {
            var pos = self.mousePosition(event);
            var canvas = self.renderer.getCanvas();
            var x = pos.x / canvas.width * 2 - 1;
            var y = (1 - pos.y / canvas.height * 2) * canvas.height / canvas.width;
            var focal = 1 / Math.tan(self.config.hfov * Math.PI / 360);
            var s = Math.sin(self.config.pitch * Math.PI / 180);
            var c = Math.cos(self.config.pitch * Math.PI / 180);
            var a = focal * c - y * s;
            var root = Math.sqrt(x * x + a * a);
            var pitch = Math.atan((y * c + focal * s) / root) * 180 / Math.PI;
            var yaw = Math.atan2(x / root, a / root) * 180 / Math.PI + self.config.yaw;
            return [pitch, yaw];
        },
        onMouseDown: function (event) {
            event.preventDefault();
            if(self.canUpdate360View){
                // Calculate mouse position relative to top left of viewer container
                var pos = self.mousePosition(event);

                self.isUserInteracting = true;
                self.latestInteraction = Date.now();

                self.onPointerDownPointerX = pos.x;
                self.onPointerDownPointerY = pos.y;

                self.onPointerDownYaw = self.config.yaw;
                self.onPointerDownPitch = self.config.pitch;
            }
        },
        onMouseUp: function (event) {
            if (!self.isUserInteracting) {
                return;
            }
            self.isUserInteracting = false;
            if (Date.now() - self.latestInteraction > 15) {
                // Prevents jump when user rapidly moves mouse, stops, and then
                // releases the mouse button
                self.pitchSpeed = self.yawSpeed = 0;
            }
        },
        overrideGlobalRendition: function () {
            if (globals.FORCE_RENDITION) {
                globals.RENDITION = globals.FORCE_RENDITION;
            }
            else if (globals.IS_IPHONE) {
                globals.RENDITION = '1080';
            }
        },
        onResize: function (width, height) {
            self.renderer.resize();
        },
        onLoopUpdate: function () {
            if(self.canUpdate360View){
                this.render();
            }
        },
        render: function () {
            if(!self.rendererInit) {
                return;
            }

            if (self.config.yaw > 180) {
                self.config.yaw -= 360;
            } else if (self.config.yaw < -180) {
                self.config.yaw += 360;
            }

            // Ensure the yaw is within min and max allowed
            self.config.yaw = Math.max(self.config.minYaw, Math.min(self.config.maxYaw, self.config.yaw));

            // Ensure the calculated pitch is within min and max allowed
            self.config.pitch = Math.max(self.config.minPitch, Math.min(self.config.maxPitch, self.config.pitch));

            if(globals.ENABLE_VIDEO_CANVAS_SOURCE){
                if (!self.internalVideoElement.paused && !self.internalVideoElement.ended) {
                    self.ie11canvas.context.drawImage(self.internalVideoElement, 0, 0, self.ie11canvas.width, self.ie11canvas.height);
                }
            }
            self.renderer.render(self.config.pitch * Math.PI / 180, self.config.yaw * Math.PI / 180, self.config.hfov * Math.PI / 180);
        },
        retryInit: function(attemptNo, callback) {
            var MAX_ATTEMPTS = 3;
            try {
                self.rendererInit = true;

                var haov = self.config.haov * Math.PI / 180;
                var vaov = self.config.vaov * Math.PI / 180;
                var voffset = self.config.vOffset * Math.PI / 180;
                var params = {};
                var _image = self.source360;
                var _imageType = self.config.type;
                var _dynamic = self.config.dynamic;

                self.renderer.init( _image, _imageType, _dynamic, haov, vaov, voffset, callback, params );

                // self.rendererInit = true;
                PubSub.publish(globals.HIDE_LOADER);

            } catch (e) {
                if (attemptNo++ < MAX_ATTEMPTS) {
                    setTimeout(self.retryInit.bind(self, attemptNo, callback), 1000)
                } else {
                    // usually a problem with the video loading. subscribe to this to display a fail message in a module.
                    PubSub.publish(globals.HIDE_LOADER);
                    PubSub.publish(globals.WEBGLERROR, 'webglerror');
                    PubSub.publish(globals.ERROR, new LogEvent(globals.ERROR, globals.ERRORS['5033']));
                    callback(globals.WEBGLERROR);
                }
            } finally {
                if (self.rendererInit) {
                    callback();
                }
            }
        },
        initRenderer: function (callback) {
            if (!self.rendererInit) {
                PubSub.publish(globals.SHOW_LOADER);
                self.retryInit(0, callback);
            } else {
                callback();
            }
        },
        checkForStall: function () {
            // Reset if we're in the middle of a seeking stall check
            if(self.stallCheckTimeout) {
                self.stallLoopCount = 0;
                return;
            }

            if(!self.playing() && self.stalled) {
                self.stalled = false;
                PubSub.publish(globals.HIDE_LOADER);
            }

            if(self.stallLoopCount > 30) {
                self.stallLoopCount = 0;
                var currentTime = self.getCurrentTime();

                if(!self.stalled && currentTime === self.lastCheckedStallTime) {
                    // Stalled
                    self.stalled = true;
                    PubSub.publish(globals.SHOW_LOADER);
                }
                else if(self.stalled && currentTime !== self.lastCheckedStallTime) {
                    self.stalled = false;
                    PubSub.publish(globals.HIDE_LOADER);
                }

                self.lastCheckedStallTime = currentTime;
            }
            else {
                self.stallLoopCount = self.stallLoopCount+1;
            }
        },
        /**
         * Enable audio. This should only be called by user initiated callbacks. This will only do anything if
         * globals.AUDIO_DISABLED is true (or force is true).
         * @param eventName - PubSub stuff
         * @param force - should only be true when this is called from setVolume.
         */
        enableAudio: function(eventName, force) {
            if (globals.AUDIO_DISABLED || force) {
                self.internalVideoElement.muted = false;
                globals.AUDIO_DISABLED = false;
                PubSub.publish(globals.VOLUME_CHANGE, globals.VOLUME);
            }
        },
        disableAudio: function() {
            self.internalVideoElement.muted = true;
            PubSub.publish(globals.VOLUME_CHANGE, 0);
        },
        createVideoElement: function (posterUrl, mp4VidUrl, webmVidUrl, mp4VidUrl4K, webmidUrl4k) {
            window.wirewax.onVideoError = function () {
                self.onError(arguments);
            };
            var videoElement;

            if (globals.REQUIRES_BAGEL) {
                videoElement = $('<video preload="auto" src="' + mp4VidUrl + '" crossorigin="anonymous" webkit-playsinline playsinline id="wireWaxVideo"></video>')[0];
                self.iphonePlayer = makeVideoPlayableInline(videoElement, self.refreshRate);
            }
            // 2017-08-18: In the current iOS 11 Beta, <source> tags don't work.
            // Hopefully this will be fixed before final release. ¯\_(ツ)_/¯
            // 2017-09-22: Safari new version throws an error if webm is one of the possible sources.
            else if (globals.IOS_VERSION > 10 || (globals.IS_DESKTOP && globals.IS_SAFARI)) {
                videoElement = $('<video preload="auto" src="' + mp4VidUrl + '" crossorigin="anonymous" webkit-playsinline playsinline id="wireWaxVideo"></video>')[0];
            }
            else {
                videoElement = $('<video preload="auto" crossorigin="anonymous" webkit-playsinline playsinline id="wireWaxVideo">' +
                    '<source src="' + mp4VidUrl4K + '" type="video/mp4" >' +
                    '<source src="' + webmidUrl4k + '" type="video/webm" >' +
                    '<source src="' + mp4VidUrl + '" type="video/mp4"  >' +
                    '<source src="' + webmVidUrl + '" type="video/webm" onerror="window.wirewax.onVideoError(parentNode)" >' +
                    '</video>')[0];
            }

            if (posterUrl) {
                var posterElement = $('<img style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 100; cursor: pointer;" class="fallback-poster-image" src="' + posterUrl + '"/>');
                posterElement.bind(globals.CLICK_EVENT, function (e) {
                    globals.PLAY_FUNCTION();
                    setTimeout(function() {
                        self.setCurrentTime('boo', 0);
                    }, 50);
                });
                $('#tag-overlay').append(posterElement);
            }
            return videoElement;
        },
        createImageSource: function () {
            var videoImage = $('<img src="' + self.fixedImage360 + '"/>');
            videoImage.attr('crossOrigin', "anonymous");
            self.source360 = videoImage[0];
        },
        createVideoInCanvasSource: function () {
            var videoHeight = globals.RENDITION;
            if(globals.IS_DESKTOP && globals.BANDWIDTH_PREFERRED_RENDITION === "4k"){
                videoHeight = 2160;
            }
            var videoWidth = (videoHeight * 16) / 9;
            self.source360 = document.createElement("canvas");
            self.source360.width = videoWidth;
            self.source360.height = videoHeight;
            self.ie11canvas = {
                width: videoWidth,
                height: videoHeight,
                context: self.source360.getContext("2d")
            };
        },
        setupLoadTimeEvent: function () {
            var loadTimeStart = new Date().getTime();
            $(self.internalVideoElement).bind('canplaythrough', function () {
                PubSub.publish(globals.LOAD_METRIC, {
                    type: 8,
                    urls: [self.internalVideoElement.currentSrc],
                    loadTime: new Date().getTime() - loadTimeStart
                });
                $(self.internalVideoElement).unbind('canplaythrough');
            });
        },
        getAvailableRenditions: function () {
            return ['1080', '720', '540', '360', '180'];
        },
        switchRendition: function (eventName, rendition) {
            var vidId = self.vidId;
            PubSub.publish(globals.SHOW_LOADER);
            self.pause(true);
            var curTime = self.getCurrentTime();
            $(self.internalVideoElement).children('source').remove();
            var sourceWebm = document.createElement('source');
            sourceWebm['src'] = self.cdnURL + 'vidData/' + vidId + '/' + vidId + '_' + rendition + '.webm';
            $(self.internalVideoElement).append(sourceWebm);
            var sourceMp4 = document.createElement('source');
            sourceMp4['src'] = self.cdnURL + 'vidData/' + vidId + '/' + vidId + '_' + rendition + '.mp4';
            $(self.internalVideoElement).append(sourceMp4);


            var loadedmetadataAfterRenditionChange = function () {
                var seekedAfterRenditionChange = function (){
                    window.setTimeout(function () {
                        self.play(true);
                        globals.RENDITION = rendition;
                        PubSub.publish(globals.RENDITION_CHANGED);
                        PubSub.publish(globals.HIDE_LOADER);
                        $(self.internalVideoElement).unbind('seeked', seekedAfterRenditionChange);
                    }, 1000);
                };
                $(self.internalVideoElement).unbind('loadedmetadata', loadedmetadataAfterRenditionChange);
                $(self.internalVideoElement).bind('seeked', seekedAfterRenditionChange);
                self.internalVideoElement.currentTime = curTime;
            };

            $(self.internalVideoElement).unbind('loadedmetadata').bind('loadedmetadata', loadedmetadataAfterRenditionChange);
            self.internalVideoElement.load();

        },
        getCurrentRendition: function () {
            var vidId = self.vidId;
            var currentSrc = self.internalVideoElement.currentSrc;
            var rendStart = currentSrc.indexOf(vidId.toString() + '_') + vidId.toString().length;
            var rendEnd = currentSrc.substring(rendStart).indexOf('.');
            var rend = currentSrc.substring(rendStart + 1, rendStart + rendEnd);
            return rend;
        },
        getVolume: function () {
            return self.internalVideoElement.volume;
        },
        setVolume: function (volume) {
            if (volume) {
                self.enableAudio('lol', true);
            } else {
                self.disableAudio();
            }
            self.internalVideoElement.volume = volume;
            this._super(volume);
        },
        play: function (hide) {
            var superFn = this._super;
            self.initRenderer(function(err) {
                if (err) {
                    return;
                }

                if (!globals.ENABLE_VIDEO_CANVAS_SOURCE) {
                    var canvas = self.renderer.getCanvas();
                    if (globals.IS_SAFARI || globals.IS_IPHONE) {
                        var ctx = canvas.getContext('webgl');
                    } else {
                        var ctx = canvas.getContext('webgl');
                    }
                    ctx.mozImageSmoothingEnabled = true;
                    ctx.webkitImageSmoothingEnabled = true;
                    ctx.msImageSmoothingEnabled = true;
                    ctx.imageSmoothingEnabled = true;
                }

                self.attachControlEvents($('#tag-overlay')[0]);
                self.internalVideoElement.play();

                // Fix for MAC Chromes video element resetting to the last clip whenever playback starts
                if (globals.IS_MAC && globals.IS_CHROME && self.timecode) {
                    var timecodeInterval = window.setInterval(function () {
                        self.timecode.renderCode();
                        if (self.getFrame() >= self.timecode.getFrame()) {
                            superFn(hide);
                            window.clearInterval(timecodeInterval);
                        }
                    }, 40);
                }
                else {
                    superFn(hide);
                }
            });
        },
        pause: function (hide) {
            if (self.playing()) {
                self.internalVideoElement.pause();
                this._super(hide);
            }
        },
        seeking: function () {
            return self.iphonePlayer ? false : self.internalVideoElement.seeking;
        },
        VideoData: function (videoData) {
            this._super(videoData);
        },
        getAvailableSubtitles: function () {
            this._super();
            return self.videoData ? self.videoData.subtitles : [];
        },
        seekToFrame: function (frame) {
            self.setCurrentTime('junk', parseFloat(frame / self.videoData.fps) + 0.0001);
        },
        frameForward: function (verificationFn) {
            if (!self.playing()) {
                self.pauseOnSeek = true;
                var wantedFrame = self.getFrame() + 1;
                var wantedTime = (wantedFrame - 1) / self.videoData.fps + 0.0001;
                var retryFn = function (isRetry) {
                    if (verificationFn) {
                        var verification = function () {
                            if (!isRetry || self.getCurrentTime() === wantedTime) {
                                $(self.internalVideoElement).unbind('seeked', verification);
                                verificationFn(retryFn);
                            }
                        };
                        $(self.internalVideoElement).bind('seeked', verification)
                        //self.setCurrentTime('junk', wantedFrame / self.videoData.fps + 0.0001);
                    }
                    self.setCurrentTime('junk', wantedTime);
                };
                retryFn(false);
            }
        },
        frameBack: function (verificationFn) {
            if (!self.playing()) {
                self.pauseOnSeek = true;
                var wantedFrame = self.getFrame() - 1;
                var wantedTime = (wantedFrame - 1) / self.videoData.fps + 0.0001;
                var retryFn = function (isRetry) {
                    if (verificationFn) {
                        var verification = function () {
                            if (!isRetry || self.getCurrentTime() === wantedTime) {
                                $(self.internalVideoElement).unbind('seeked', verification);
                                verificationFn(retryFn);
                            }
                        };
                        $(self.internalVideoElement).bind('seeked', verification)
                        self.setCurrentTime('junk', wantedFrame / self.videoData.fps + 0.0001);
                    }
                    self.setCurrentTime('junk', wantedTime);
                };
                retryFn(false);
            }
        },
        getFrame: function () {
            return Math.floor((self.internalVideoElement.currentTime + 0.0001) * self.videoData.fps) + 1;
        },
        setFrame: function (frame) {
            var goToFrame = frame - 25;
            var time = (self.videoData.fps * (goToFrame - 1)) + 0.0001;
            self.setCurrentTime('junk', time);
        },
        goToTag: function (tag, skipWidget) {
            if (tag) {
                if(!skipWidget) {
                    window.setTimeout(function(){
                        globals.PLAY_FUNCTION();
                    }, 100);
                }

                window.setTimeout(function(){
                    PubSub.publish(globals.HIDE_LOADER);
                    PubSub.publish(globals.DO_SEEK, tag.tagStartTime);

                    if(!skipWidget) {
                        tag.tagClick();
                    }

                }, 1000);
            }
        },
        getCurrentTime: function (frame) {
            return self.internalVideoElement.currentTime;
        },
        setCurrentTime: function (eventName, currentTime) {
            if (isNaN(currentTime)) {
                return;
            }
            try {
                this._super(eventName, currentTime);

                if (self.iphonePlayer) {
                    self.iphonePlayer.setTime.call(self.iphonePlayer, currentTime, true);
                    self.render();
                    self.seeked();
                } else {
                    self.internalVideoElement.currentTime = currentTime;
                }
            }
            catch (err) {
                console.log('Invalid current time ' + currentTime);
            }
        },
        getBuffered: function () {
            var buffered = 0;
            var bufferAmt = self.internalVideoElement.buffered;
            if (bufferAmt.length > 0) {
                var maxBuffer = 0;
                for (var i = 0; i < bufferAmt.length; i++) {
                    if (bufferAmt.end(i) > maxBuffer) {
                        maxBuffer = parseFloat(bufferAmt.end(i));
                    }
                }
                buffered = maxBuffer;
            } else {
                if (self.internalVideoElement.readyState === 4) {
                    buffered = self.internalVideoElement.duration;
                    if (isNaN(buffered)) {
                        buffered = 0;
                    }
                } else {
                    buffered = 0;
                }
            }
            return buffered;
        },
        getNetworkState: function () {
            return self.internalVideoElement.networkState;
        },
        playing: function () {
            if (self.internalVideoElement.paused) {
                return false;
            } else {
                return self.startedPlaying;
            }
        },
        paused: function () {
            return self.internalVideoElement.paused;
        },
        playPause: function () {
            if (self.internalVideoElement.paused) {
                self.play();
            } else {
                self.pause();
            }
        },
        getReadyState: function () {
            var state = self.internalVideoElement.readyState;
            if (state < 2) {
                return 0;
            }
            if (state >= 2 && state < 4) {
                return 2;
            }
            if (state >= 4) {
                return 4;
            }
        },
        load: function () {
            self.internalVideoElement.load();
        },
        onError: function () {
            if (self.getNetworkState() === 3) {
                PubSub.publish(globals.ERROR, new LogEvent(globals.ERROR, globals.ERRORS['5018']));
            }
            else {
                PubSub.publish(globals.ERROR, new LogEvent(globals.ERROR, globals.ERRORS['5024']));
            }
        },
        preSeekStallCheck: function () {
            if (self.stallCheckTimeout) {
                window.clearTimeout(self.stallCheckTimeout);
            }

            self.stallCheckTimeout = window.setTimeout(function () {
                self.stallCheckTimeout = null;
                PubSub.publish(globals.SHOW_LOADER);
                PubSub.publish(globals.STARTED_BUFFERING);
            }, 1000);
        },
        postSeekStallCheck: function () {
            self.render();
            if (self.stallCheckTimeout) {
                window.clearTimeout(self.stallCheckTimeout);
            }
            else {
                PubSub.publish(globals.ENDED_BUFFERING);
                PubSub.publish(globals.HIDE_LOADER);
            }
        },
        initialise: function () {
            $(self.internalVideoElement).bind("seeked", this.seeked);
            $(self.internalVideoElement).bind("ended", self.onEnd);


            // Remove the posterFrame so that we don't see it on seek
            var posterRemoveSubscriber = PubSub.subscribe(globals.HAS_PLAYED, function () {

                //Note: trigger resize so the scrubber gets the correct width
                $(window).resize();
                PubSub.unsubscribe(posterRemoveSubscriber);
                self.internalVideoElement.removeAttribute('poster');
                $('#tag-overlay').find('.fallback-poster-image').remove();
            });

            if (globals.ENABLE_STALL_DETECTION) {
                PubSub.subscribe(globals.DO_SEEK, self.preSeekStallCheck);
                PubSub.subscribe(globals.HAS_SEEKED, self.postSeekStallCheck);
            }
            if(!globals.IS_IPHONE && !globals.IS_IPAD){
                //Note: IOS doesnt recognise the dblclick event so we only set this up for the rest
                //For IOS check the function "checkDoubletap" in this player
                $('#tag-overlay').on('dblclick', function () {
                    if(!globals.PREVENT_VIDEO_DOUBLE_CLICK) {
                        self.playPause();
                    }
                });
            }

            self.mainLoop();
            this._super();

            var isMobileAndCanAutoplay = !globals.IS_DESKTOP && globals.CAN_AUTOPLAY;
            var isChromeAbove66 = globals.IS_DESKTOP && globals.IS_CHROME && globals.IS_CHROME_VERSION >= 66;

            if (isMobileAndCanAutoplay || isChromeAbove66) {
                self.disableAudio();
                globals.AUDIO_DISABLED = true;
            }
        }
    });
    return Player;
});
