;(function(root, factory) {
    'use strict';
    /*global define,module*/

    if (typeof module === 'object' && typeof module.exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory(root, document);
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define([], function () { return factory(root, document); });
    } else {
        // Browser globals (root is window)
        root.vimeovideo = factory(root, document);
    }
}(typeof window !== 'undefined' ? window : this, function(window, document) {
    'use strict';

    // Globals
    var fullscreen,
    scroll = { x: 0, y: 0 },

    // Default config
    defaults = {
        enabled:                true,
        debug:                  false,
        autoplay:               false,
        loop:                   true,
        seekTime:               10,
        volume:                 10,
        volumeMin:              0,
        volumeMax:              10,
        volumeStep:             10,
        duration:               null,
        displayDuration:        true,
        loadSprite:             false,
        iconPrefix:             'vimeovideo',
        iconUrl:                '',
        clickToPlay:            true,
        hideControls:           false,
        showPosterOnEnd:        false,
        disableContextMenu:     true,
        keyboardShorcuts:       {
            focused:            false,
            global:             false
        },
        tooltips: {
            controls:           false,
            seek:               false
        },
        selectors: {
            html5:              'video, audio',
            embed:              '[data-type]',
            editable:           'input, textarea, select, [contenteditable]',
            container:          '.vimeovideo',
            controls: {
                container:      null,
                wrapper:        '.vimeovideo-controls'
            },
            labels:             '[data-vimeovideo]',
            buttons: {
                seek:           '[data-vimeovideo="seek"]',
                play:           '[data-vimeovideo="play"]',
                pause:          '[data-vimeovideo="pause"]',
                restart:        '[data-vimeovideo="restart"]',
                rewind:         '[data-vimeovideo="rewind"]',
                forward:        '[data-vimeovideo="fast-forward"]',
                mute:           '[data-vimeovideo="mute"]',
                captions:       '[data-vimeovideo="captions"]',
                fullscreen:     '[data-vimeovideo="fullscreen"]'
            },
            volume: {
                input:          '[data-vimeovideo="volume"]',
                display:        '.vimeovideo-volume-display'
            },
            progress: {
                container:      '.vimeovideo-progress',
                buffer:         '.vimeovideo-progress-buffer',
                played:         '.vimeovideo-progress-played'
            },
            captions:           '.vimeovideo-captions',
            currentTime:        '.vimeovideo-time-current',
            duration:           '.vimeovideo-time-duration'
        },
        classes: {
            setup:              'vimeovideo-setup',
            ready:              'vimeovideo-ready',
            videoWrapper:       'vimeovideo-video-wrapper',
            embedWrapper:       'vimeovideo-video-embed',
            type:               'vimeovideo-{0}',
            stopped:            'vimeovideo-stopped',
            playing:            'vimeovideo-playing',
            muted:              'vimeovideo-muted',
            loading:            'vimeovideo-loading',
            hover:              'vimeovideo-hover',
            tooltip:            'vimeovideo-tooltip',
            hidden:             'vimeovideo-sr-only',
            hideControls:       'vimeovideo-hide-controls',
            isIos:              'vimeovideo-is-ios',
            isTouch:            'vimeovideo-is-touch',
            captions: {
                enabled:        'vimeovideo-captions-enabled',
                active:         'vimeovideo-captions-active'
            },
            fullscreen: {
                enabled:        'vimeovideo-fullscreen-enabled',
                active:         'vimeovideo-fullscreen-active'
            },
            tabFocus:           'tab-focus'
        },
        captions: {
            defaultActive:      false
        },
        fullscreen: {
            enabled:            false,
            fallback:           false,
            allowAudio:         false
        },
        storage: {
            enabled:            true,
            key:                'vimeovideo'
        },
        controls:               ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'fullscreen'],
        i18n: {
            restart:            'Restart',
            rewind:             'Rewind {seektime} secs',
            play:               'Play',
            pause:              'Pause',
            forward:            'Forward {seektime} secs',
            played:             'played',
            buffered:           'buffered',
            currentTime:        'Current time',
            duration:           'Duration',
            volume:             'Volume',
            toggleMute:         'Toggle Mute',
            toggleCaptions:     'Toggle Captions',
            toggleFullscreen:   'Toggle Fullscreen',
            frameTitle:         'Player for {title}'
        },
        types: {
            embed:              ['vimeo'],
            html5:              ['video', 'audio']
        },
        // URLs
        urls: {
            vimeo: {
                api:            'https://player.vimeo.com/api/player.js',
            },
        },
        // Custom control listeners
        listeners: {
            seek:               null,
            play:               null,
            pause:              null,
            restart:            null,
            rewind:             null,
            forward:            null,
            mute:               null,
            volume:             null,
            captions:           null,
            fullscreen:         null
        },
        // Events to watch on HTML5 media elements
        events:                 ['ready', 'loaded', 'ended', 'progress', 'stalled', 'playing', 'waiting', 'canplay', 'canplaythrough', 'loadstart', 'loadeddata', 'loadedmetadata', 'timeupdate', 'volumechange', 'play', 'pause', 'error', 'seeking', 'seeked', 'emptied'],
        // Logging
        logPrefix:              '[vimeovideo]'
    };

    // Credits: http://paypal.github.io/accessible-html5-video-player/
    // Unfortunately, due to mixed support, UA sniffing is required
    function _browserSniff() {
        var ua = navigator.userAgent,
            name = navigator.appName,
            fullVersion = '' + parseFloat(navigator.appVersion),
            majorVersion = parseInt(navigator.appVersion, 10),
            nameOffset,
            verOffset,
            ix,
            isIE = false,
            isFirefox = false,
            isChrome = false,
            isSafari = false;

        if ((navigator.appVersion.indexOf('Windows NT') !== -1) && (navigator.appVersion.indexOf('rv:11') !== -1)) {
            // MSIE 11
            isIE = true;
            name = 'IE';
            fullVersion = '11';
        } else if ((verOffset = ua.indexOf('MSIE')) !== -1) {
            // MSIE
            isIE = true;
            name = 'IE';
            fullVersion = ua.substring(verOffset + 5);
        } else if ((verOffset = ua.indexOf('Chrome')) !== -1) {
            // Chrome
            isChrome = true;
            name = 'Chrome';
            fullVersion = ua.substring(verOffset + 7);
        } else if ((verOffset = ua.indexOf('Safari')) !== -1) {
            // Safari
            isSafari = true;
            name = 'Safari';
            fullVersion = ua.substring(verOffset + 7);
            if ((verOffset = ua.indexOf('Version')) !== -1) {
                fullVersion = ua.substring(verOffset + 8);
            }
        } else if ((verOffset = ua.indexOf('Firefox')) !== -1) {
            // Firefox
            isFirefox = true;
            name = 'Firefox';
            fullVersion = ua.substring(verOffset + 8);
        } else if ((nameOffset = ua.lastIndexOf(' ') + 1) < (verOffset = ua.lastIndexOf('/'))) {
            // In most other browsers, 'name/version' is at the end of userAgent
            name = ua.substring(nameOffset,verOffset);
            fullVersion = ua.substring(verOffset + 1);

            if (name.toLowerCase() === name.toUpperCase()) {
                name = navigator.appName;
            }
        }

        // Trim the fullVersion string at semicolon/space if present
        if ((ix = fullVersion.indexOf(';')) !== -1) {
            fullVersion = fullVersion.substring(0, ix);
        }
        if ((ix = fullVersion.indexOf(' ')) !== -1) {
            fullVersion = fullVersion.substring(0, ix);
        }

        // Get major version
        majorVersion = parseInt('' + fullVersion, 10);
        if (isNaN(majorVersion)) {
            fullVersion = '' + parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion, 10);
        }

        // Return data
        return {
            name:       name,
            version:    majorVersion,
            isIE:       isIE,
            isFirefox:  isFirefox,
            isChrome:   isChrome,
            isSafari:   isSafari,
            isIos:      /(iPad|iPhone|iPod)/g.test(navigator.platform),
            isIphone:   /(iPhone|iPod)/g.test(navigator.userAgent),
            isTouch:    'ontouchstart' in document.documentElement
        };
    }

    // Check for mime type support against a player instance
    // Credits: http://diveintohtml5.info/everything.html
    // Related: http://www.leanbackvimeovideo.com/test/h5mt.html
    function _supportMime(vimeovideo, mimeType) {
        var media = vimeovideo.media;

        if (vimeovideo.type === 'video') {
            // Check type
            switch (mimeType) {
                case 'video/webm':   return !!(media.canPlayType && media.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/no/, ''));
                case 'video/mp4':    return !!(media.canPlayType && media.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/no/, ''));
                case 'video/ogg':    return !!(media.canPlayType && media.canPlayType('video/ogg; codecs="theora"').replace(/no/, ''));
            }
        } else if (vimeovideo.type === 'audio') {
            // Check type
            switch (mimeType) {
                case 'audio/mpeg':   return !!(media.canPlayType && media.canPlayType('audio/mpeg;').replace(/no/, ''));
                case 'audio/ogg':    return !!(media.canPlayType && media.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''));
                case 'audio/wav':    return !!(media.canPlayType && media.canPlayType('audio/wav; codecs="1"').replace(/no/, ''));
            }
        }

        // If we got this far, we're stuffed
        return false;
    }

    // Inject a script
    function _injectScript(source) {
        if (document.querySelectorAll('script[src="' + source + '"]').length) {
            return;
        }

        var tag = document.createElement('script');
        tag.src = source;
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    // Element exists in an array
    function _inArray(haystack, needle) {
        return Array.prototype.indexOf && (haystack.indexOf(needle) !== -1);
    }

    // Replace all
    function _replaceAll(string, find, replace) {
        return string.replace(new RegExp(find.replace(/([.*+?\^=!:${}()|\[\]\/\\])/g, '\\$1'), 'g'), replace);
    }

    // Wrap an element
    function _wrap(elements, wrapper) {
        // Convert `elements` to an array, if necessary.
        if (!elements.length) {
            elements = [elements];
        }

        // Loops backwards to prevent having to clone the wrapper on the
        // first element (see `child` below).
        for (var i = elements.length - 1; i >= 0; i--) {
            var child   = (i > 0) ? wrapper.cloneNode(true) : wrapper;
            var element = elements[i];

            // Cache the current parent and sibling.
            var parent  = element.parentNode;
            var sibling = element.nextSibling;

            // Wrap the element (is automatically removed from its current
            // parent).
            child.appendChild(element);

            // If the element had a sibling, insert the wrapper before
            // the sibling to maintain the HTML structure; otherwise, just
            // append it to the parent.
            if (sibling) {
                parent.insertBefore(child, sibling);
            } else {
                parent.appendChild(child);
            }

            return child;
        }
    }

    // Unwrap an element
    // http://plainjs.com/javascript/manipulation/unwrap-a-dom-element-35/
    /*function _unwrap(wrapper) {
        // Get the element's parent node
        var parent = wrapper.parentNode;

        // Move all children out of the element
        while (wrapper.firstChild) {
            parent.insertBefore(wrapper.firstChild, wrapper);
        }

        // Remove the empty element
        parent.removeChild(wrapper);
    }*/

    // Remove an element
    function _remove(element) {
        if (!element) {
            return;
        }
        element.parentNode.removeChild(element);
    }

    // Prepend child
    function _prependChild(parent, element) {
        parent.insertBefore(element, parent.firstChild);
    }

    // Set attributes
    function _setAttributes(element, attributes) {
        for (var key in attributes) {
            element.setAttribute(key, (_is.boolean(attributes[key]) && attributes[key]) ? '' : attributes[key]);
        }
    }

    // Insert a HTML element
    function _insertElement(type, parent, attributes) {
        // Create a new <element>
        var element = document.createElement(type);

        // Set all passed attributes
        _setAttributes(element, attributes);

        // Inject the new element
        _prependChild(parent, element);
    }

    // Get a classname from selector
    function _getClassname(selector) {
        return selector.replace('.', '');
    }

    // Toggle class on an element
    function _toggleClass(element, className, state) {
        if (element) {
            if (element.classList) {
                element.classList[state ? 'add' : 'remove'](className);
            } else {
                var name = (' ' + element.className + ' ').replace(/\s+/g, ' ').replace(' ' + className + ' ', '');
                element.className = name + (state ? ' ' + className : '');
            }
        }
    }

    // Has class name
    function _hasClass(element, className) {
        if (element) {
            if (element.classList) {
                return element.classList.contains(className);
            } else {
                return new RegExp('(\\s|^)' + className + '(\\s|$)').test(element.className);
            }
        }
        return false;
    }

    // Element matches selector
    function _matches(element, selector) {
        var p = Element.prototype;

        var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s) {
            return [].indexOf.call(document.querySelectorAll(s), this) !== -1;
        };

        return f.call(element, selector);
    }

    // Bind along with custom handler
    function _proxyListener(element, eventName, userListener, defaultListener, useCapture) {
        _on(element, eventName, function(event) {
            if (userListener) {
                userListener.apply(element, [event]);
            }
            defaultListener.apply(element, [event]);
        }, useCapture);
    }

    // Toggle event listener
    function _toggleListener(element, events, callback, toggle, useCapture) {
        var eventList = events.split(' ');

        // Whether the listener is a capturing listener or not
        // Default to false
        if (!_is.boolean(useCapture)) {
            useCapture = false;
        }

        // If a nodelist is passed, call itself on each node
        if (element instanceof NodeList) {
            for (var x = 0; x < element.length; x++) {
                if (element[x] instanceof Node) {
                    _toggleListener(element[x], arguments[1], arguments[2], arguments[3]);
                }
            }
            return;
        }

        // If a single node is passed, bind the event listener
        for (var i = 0; i < eventList.length; i++) {
            element[toggle ? 'addEventListener' : 'removeEventListener'](eventList[i], callback, useCapture);
        }
    }

    // Bind event
    function _on(element, events, callback, useCapture) {
        if (element) {
            _toggleListener(element, events, callback, true, useCapture);
        }
    }

    // Unbind event
    /*function _off(element, events, callback, useCapture) {
        if (element) {
            _toggleListener(element, events, callback, false, useCapture);
        }
    }*/

    // Trigger event
    function _event(element, type, bubbles, properties) {
        // Bail if no element
        if (!element || !type) {
            return;
        }

        // Default bubbles to false
        if (!_is.boolean(bubbles)) {
            bubbles = false;
        }

        // Create and dispatch the event
        var event = new CustomEvent(type, {
            bubbles:    bubbles,
            detail:     properties
        });

        // Dispatch the event
        element.dispatchEvent(event);
    }

    // Toggle aria-pressed state on a toggle button
    // http://www.ssbbartgroup.com/blog/how-not-to-misuse-aria-states-properties-and-roles
    function _toggleState(target, state) {
        // Bail if no target
        if (!target) {
            return;
        }

        // Get state
        state = (_is.boolean(state) ? state : !target.getAttribute('aria-pressed'));

        // Set the attribute on target
        target.setAttribute('aria-pressed', state);

        return state;
    }

    // Get percentage
    function _getPercentage(current, max) {
        if (current === 0 || max === 0 || isNaN(current) || isNaN(max)) {
            return 0;
        }
        return ((current / max) * 100).toFixed(2);
    }

    // Deep extend/merge destination object with N more objects
    // http://andrewdupont.net/2009/08/28/deep-extending-objects-in-javascript/
    // Removed call to arguments.callee (used explicit function name instead)
    function _extend() {
        // Get arguments
        var objects = arguments;

        // Bail if nothing to merge
        if (!objects.length) {
            return;
        }

        // Return first if specified but nothing to merge
        if (objects.length === 1) {
            return objects[0];
        }

        // First object is the destination
        var destination = Array.prototype.shift.call(objects),
            length      = objects.length;

        // Loop through all objects to merge
        for (var i = 0; i < length; i++) {
            var source = objects[i];

            for (var property in source) {
                if (source[property] && source[property].constructor && source[property].constructor === Object) {
                    destination[property] = destination[property] || {};
                    _extend(destination[property], source[property]);
                } else {
                    destination[property] = source[property];
                }
            }
        }

        return destination;
    }

    // Check variable types
    var _is = {
        object: function(input) {
            return input !== null && typeof(input) === 'object';
        },
        array: function(input) {
            return input !== null && (typeof(input) === 'object' && input.constructor === Array);
        },
        number: function(input) {
            return input !== null && (typeof(input) === 'number' && !isNaN(input - 0) || (typeof input === 'object' && input.constructor === Number));
        },
        string: function(input) {
            return input !== null && (typeof input === 'string' || (typeof input === 'object' && input.constructor === String));
        },
        boolean: function(input) {
            return input !== null && typeof input === 'boolean';
        },
        nodeList: function(input) {
            return input !== null && input instanceof NodeList;
        },
        htmlElement: function(input) {
            return input !== null && input instanceof HTMLElement;
        },
        function: function(input) {
            return input !== null && typeof input === 'function';
        },
        undefined: function(input) {
            return input !== null && typeof input === 'undefined';
        }
    };

    // Parse Vimeo ID from url
    function _parseVimeoId(url) {
        var regex = /^.*(vimeo.com\/|video\/)(\d+).*/;
        return (url.match(regex)) ? RegExp.$2 : url;
    }

    // Fullscreen API
    function _fullscreen() {
        var fullscreen = {
                supportsFullScreen: false,
                isFullScreen: function() { return false; },
                requestFullScreen: function() {},
                cancelFullScreen: function() {},
                fullScreenEventName: '',
                element: null,
                prefix: ''
            },
            browserPrefixes = 'webkit o moz ms khtml'.split(' ');

        // Check for native support
        if (!_is.undefined(document.cancelFullScreen)) {
            fullscreen.supportsFullScreen = true;
        } else {
            // Check for fullscreen support by vendor prefix
            for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
                fullscreen.prefix = browserPrefixes[i];

                if (!_is.undefined(document[fullscreen.prefix + 'CancelFullScreen'])) {
                    fullscreen.supportsFullScreen = true;
                    break;
                } else if (!_is.undefined(document.msExitFullscreen) && document.msFullscreenEnabled) {
                    // Special case for MS (when isn't it?)
                    fullscreen.prefix = 'ms';
                    fullscreen.supportsFullScreen = true;
                    break;
                }
            }
        }

        // Update methods to do something useful
        if (fullscreen.supportsFullScreen) {
            // Yet again Microsoft awesomeness,
            // Sometimes the prefix is 'ms', sometimes 'MS' to keep you on your toes
            fullscreen.fullScreenEventName = (fullscreen.prefix === 'ms' ? 'MSFullscreenChange' : fullscreen.prefix + 'fullscreenchange');

            fullscreen.isFullScreen = function(element) {
                if (_is.undefined(element)) {
                    element = document.body;
                }
                switch (this.prefix) {
                    case '':
                        return document.fullscreenElement === element;
                    case 'moz':
                        return document.mozFullScreenElement === element;
                    default:
                        return document[this.prefix + 'FullscreenElement'] === element;
                }
            };
            fullscreen.requestFullScreen = function(element) {
                if (_is.undefined(element)) {
                    element = document.body;
                }
                return (this.prefix === '') ? element.requestFullScreen() : element[this.prefix + (this.prefix === 'ms' ? 'RequestFullscreen' : 'RequestFullScreen')]();
            };
            fullscreen.cancelFullScreen = function() {
                return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + (this.prefix === 'ms' ? 'ExitFullscreen' : 'CancelFullScreen')]();
            };
            fullscreen.element = function() {
                return (this.prefix === '') ? document.fullscreenElement : document[this.prefix + 'FullscreenElement'];
            };
        }

        return fullscreen;
    }

    // Local storage
    var _storage = {
        supported: (function() {
            if (!('localStorage' in window)) {
                return false;
            }

            // Try to use it (it might be disabled, e.g. user is in private/porn mode)
            // see: https://github.com/Selz/vimeovideo/issues/131
            try {
                // Add test item
                window.localStorage.setItem('-_test', 'OK');

                // Get the test item
                var result = window.localStorage.getItem('-_test');

                // Clean up
                window.localStorage.removeItem('-_test');

                // Check if value matches
                return (result === 'OK');
            }
            catch (e) {
                return false;
            }

            return false;
        })()
    };

    // Player instance
    function vimeovideo(media, config) {
        var vimeovideo = this,
        timers = {},
        api;

        // Set media
        vimeovideo.media = media;
        var original = media.cloneNode(true);

        // Trigger events, with vimeovideo instance passed
        function _triggerEvent(element, type, bubbles, properties) {
            _event(element, type, bubbles, _extend({}, properties, {
                vimeovideo: api
            }));
        }

        // Debugging
        function _console(type, args) {
            if (config.debug && window.console) {
                args = Array.prototype.slice.call(args);

                if (_is.string(config.logPrefix) && config.logPrefix.length) {
                    args.unshift(config.logPrefix);
                }

                console[type].apply(console, args);
            }
        }
        var _log = function() { _console('log', arguments) },
            _warn = function() { _console('warn', arguments) };

        // Log config options
        _log('Config', config);

        // Get icon URL
        function _getIconUrl() {
            return {
                url:        config.iconUrl,
                absolute:   (config.iconUrl.indexOf("http") === 0) || vimeovideo.browser.isIE
            };
        }

        // Build the default HTML
        function _buildControls() {
            // Create html array
            var html        = [],
                iconUrl     = _getIconUrl(),
                iconPath    = (!iconUrl.absolute ? iconUrl.url : '') + '#' + config.iconPrefix;

            // Larger overlaid play button
            if (_inArray(config.controls, 'play-large')) {
                html.push(
                    '<button type="button" data-vimeovideo="play" class="vimeovideo-play-large"><span>',
                    '</span></button>'
                );
            }

            html.push('<div class="vimeovideo-controls">');

            // Restart button
            if (_inArray(config.controls, 'restart')) {
                html.push(
                    '<button type="button" data-vimeovideo="restart">',
                        '<span class="vimeovideo-sr-only">' + config.i18n.restart + '</span>',
                    '</button>'
                );
            }

            // Rewind button
            if (_inArray(config.controls, 'rewind')) {
                html.push(
                    '<button type="button" data-vimeovideo="rewind">',
                        '<span class="vimeovideo-sr-only">' + config.i18n.rewind + '</span>',
                    '</button>'
                );
            }

            // Play Pause button
            // TODO: This should be a toggle button really?
            if (_inArray(config.controls, 'play')) {
                html.push(
                    '<button type="button" data-vimeovideo="play">',
                        '<span class="vimeovideo-sr-only">' + config.i18n.play + '</span>',
                    '</button>',
                    '<button type="button" data-vimeovideo="pause">',
                        '<span class="vimeovideo-sr-only">' + config.i18n.pause + '</span>',
                    '</button>'
                );
            }

            // Fast forward button
            if (_inArray(config.controls, 'fast-forward')) {
                html.push(
                    '<button type="button" data-vimeovideo="fast-forward">',
                        '<span class="vimeovideo-sr-only">' + config.i18n.forward + '</span>',
                    '</button>'
                );
            }

            // Progress
            if (_inArray(config.controls, 'progress')) {
                // Create progress
                html.push('<span class="vimeovideo-progress">',
                    '<label for="seek{id}" class="vimeovideo-sr-only">Seek</label>',
                    '<input id="seek{id}" class="vimeovideo-progress-seek" type="range" min="0" max="100" step="0.1" value="0" data-vimeovideo="seek">',
                    '<progress class="vimeovideo-progress-played" max="100" value="0" role="presentation"></progress>',
                    '<progress class="vimeovideo-progress-buffer" max="100" value="0">',
                        '<span>0</span>% ' + config.i18n.buffered,
                    '</progress>');

                // Seek tooltip
                if (config.tooltips.seek) {
                    html.push('<span class="vimeovideo-tooltip">00:00</span>');
                }

                // Close
                html.push('</span>');
            }

            // Media current time display
            if (_inArray(config.controls, 'current-time')) {
                html.push(
                    '<span class="vimeovideo-time">',
                        '<span class="vimeovideo-sr-only">' + config.i18n.currentTime + '</span>',
                        '<span class="vimeovideo-time-current">00:00</span>',
                    '</span>'
                );
            }

            // Media duration display
            if (_inArray(config.controls, 'duration')) {
                html.push(
                    '<span class="vimeovideo-time">',
                        '<span class="vimeovideo-sr-only">' + config.i18n.duration + '</span>',
                        '<span class="vimeovideo-time-duration">00:00</span>',
                    '</span>'
                );
            }

            // Toggle mute button
            if (_inArray(config.controls, 'mute')) {
                html.push(
                    '<button type="button" data-vimeovideo="mute">',
                        '<span class="vimeovideo-sr-only">' + config.i18n.toggleMute + '</span>',
                    '</button>'
                );
            }

            // Volume range control
            if (_inArray(config.controls, 'volume')) {
                html.push(
                    '<span class="vimeovideo-volume">',
                        '<label for="volume{id}" class="vimeovideo-sr-only">' + config.i18n.volume + '</label>',
                        '<input id="volume{id}" class="vimeovideo-volume-input" type="range" min="' + config.volumeMin + '" max="' + config.volumeMax + '" value="' + config.volume + '" data-vimeovideo="volume">',
                        '<progress class="vimeovideo-volume-display" max="' + config.volumeMax + '" value="' + config.volumeMin + '" role="presentation"></progress>',
                    '</span>'
                );
            }

            // Toggle captions button
            if (_inArray(config.controls, 'captions')) {
                html.push(
                    '<button type="button" data-vimeovideo="captions">',
                        '<span class="vimeovideo-sr-only">' + config.i18n.toggleCaptions + '</span>',
                    '</button>'
                );
            }

            // Toggle fullscreen button
            if (_inArray(config.controls, 'fullscreen')) {
                html.push(
                    '<button type="button" data-vimeovideo="fullscreen">',
                        '<span class="vimeovideo-sr-only">' + config.i18n.toggleFullscreen + '</span>',
                    '</button>'
                );
            }

            // Close everything
            html.push('</div>');

            return html.join('');
        }

        // Setup fullscreen
        function _setupFullscreen() {
            if (!vimeovideo.supported.full) {
                return;
            }

            if ((vimeovideo.type !== 'audio' || config.fullscreen.allowAudio) && config.fullscreen.enabled) {
                // Check for native support
                var nativeSupport = fullscreen.supportsFullScreen;

                if (nativeSupport || (config.fullscreen.fallback && !_inFrame())) {
                    _log((nativeSupport ? 'Native' : 'Fallback') + ' fullscreen enabled');

                    // Add styling hook
                    _toggleClass(vimeovideo.container, config.classes.fullscreen.enabled, true);
                } else {
                    _log('Fullscreen not supported and fallback disabled');
                }

                // Toggle state
                if (vimeovideo.buttons && vimeovideo.buttons.fullscreen) {
                    _toggleState(vimeovideo.buttons.fullscreen, false);
                }

                // Setup focus trap
                _focusTrap();
            }
        }

        // Setup captions
        function _setupCaptions() {
            // Bail if not HTML5 video
            if (vimeovideo.type !== 'video') {
                return;
            }

            // Inject the container
            if (!_getElement(config.selectors.captions)) {
                vimeovideo.videoContainer.insertAdjacentHTML('afterbegin', '<div class="' + _getClassname(config.selectors.captions) + '"></div>');
            }

            // Determine if HTML5 textTracks is supported
            vimeovideo.usingTextTracks = false;
            if (vimeovideo.media.textTracks) {
                vimeovideo.usingTextTracks = true;
            }

            // Get URL of caption file if exists
            var captionSrc = '',
                kind,
                children = vimeovideo.media.childNodes;

            for (var i = 0; i < children.length; i++) {
                if (children[i].nodeName.toLowerCase() === 'track') {
                    kind = children[i].kind;
                    if (kind === 'captions' || kind === 'subtitles') {
                        captionSrc = children[i].getAttribute('src');
                    }
                }
            }

            // Record if caption file exists or not
            vimeovideo.captionExists = true;
            if (captionSrc === '') {
                vimeovideo.captionExists = false;
                _log('No caption track found');
            } else {
                _log('Caption track found; URI: ' + captionSrc);
            }

            // If no caption file exists, hide container for caption text
            if (!vimeovideo.captionExists) {
                _toggleClass(vimeovideo.container, config.classes.captions.enabled);
            } else {
                // Turn off native caption rendering to avoid double captions
                // This doesn't seem to work in Safari 7+, so the <track> elements are removed from the dom below
                var tracks = vimeovideo.media.textTracks;
                for (var x = 0; x < tracks.length; x++) {
                    tracks[x].mode = 'hidden';
                }

                // Enable UI
                _showCaptions(vimeovideo);

                // Disable unsupported browsers than report false positive
                // Firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1033144
                if ((vimeovideo.browser.isIE && vimeovideo.browser.version >= 10) ||
                    (vimeovideo.browser.isFirefox && vimeovideo.browser.version >= 31)) {

                    // Debugging
                    _log('Detected browser with known TextTrack issues - using manual fallback');

                    // Set to false so skips to 'manual' captioning
                    vimeovideo.usingTextTracks = false;
                }

                // Rendering caption tracks
                // Native support required - http://caniuse.com/webvtt
                if (vimeovideo.usingTextTracks) {
                    _log('TextTracks supported');

                    for (var y = 0; y < tracks.length; y++) {
                        var track = tracks[y];

                        if (track.kind === 'captions' || track.kind === 'subtitles') {
                            _on(track, 'cuechange', function() {
                                // Display a cue, if there is one
                                if (this.activeCues[0] && 'text' in this.activeCues[0]) {
                                    _setCaption(this.activeCues[0].getCueAsHTML());
                                } else {
                                    _setCaption();
                                }
                            });
                        }
                    }
                } else {
                    // Caption tracks not natively supported
                    _log('TextTracks not supported so rendering captions manually');

                    // Render captions from array at appropriate time
                    vimeovideo.currentCaption = '';
                    vimeovideo.captions = [];

                    if (captionSrc !== '') {
                        // Create XMLHttpRequest Object
                        var xhr = new XMLHttpRequest();

                        xhr.onreadystatechange = function() {
                            if (xhr.readyState === 4) {
                                if (xhr.status === 200) {
                                    var captions = [],
                                        caption,
                                        req = xhr.responseText;

                                    //According to webvtt spec, line terminator consists of one of the following
                                    // CRLF (U+000D U+000A), LF (U+000A) or CR (U+000D)
                                    var lineSeparator = '\r\n';
                                    if(req.indexOf(lineSeparator+lineSeparator) === -1) {
                                        if(req.indexOf('\r\r') !== -1){
                                            lineSeparator = '\r';
                                        } else {
                                            lineSeparator = '\n';
                                        }
                                    }

                                    captions = req.split(lineSeparator+lineSeparator);

                                    for (var r = 0; r < captions.length; r++) {
                                        caption = captions[r];
                                        vimeovideo.captions[r] = [];

                                        // Get the parts of the captions
                                        var parts = caption.split(lineSeparator),
                                            index = 0;

                                        // Incase caption numbers are added
                                        if (parts[index].indexOf(":") === -1) {
                                            index = 1;
                                        }

                                        vimeovideo.captions[r] = [parts[index], parts[index + 1]];
                                    }

                                    // Remove first element ('VTT')
                                    vimeovideo.captions.shift();

                                    _log('Successfully loaded the caption file via AJAX');
                                } else {
                                    _warn(config.logPrefix + 'There was a problem loading the caption file via AJAX');
                                }
                            }
                        };

                        xhr.open('get', captionSrc, true);

                        xhr.send();
                    }
                }
            }
        }

        // Set the current caption
        function _setCaption(caption) {
            /* jshint unused:false */
            var container = _getElement(config.selectors.captions),
                content = document.createElement('span');

            // Empty the container
            container.innerHTML = '';

            // Default to empty
            if (_is.undefined(caption)) {
                caption = '';
            }

            // Set the span content
            if (_is.string(caption)) {
                content.innerHTML = caption.trim();
            } else {
                content.appendChild(caption);
            }

            // Set new caption text
            container.appendChild(content);

            // Force redraw (for Safari)
            var redraw = container.offsetHeight;
        }

        // Captions functions
        // Seek the manual caption time and update UI
        function _seekManualCaptions(time) {
            // Utilities for caption time codes
            function _timecodeCommon(tc, pos) {
                var tcpair = [];
                tcpair = tc.split(' --> ');
                for(var i = 0; i < tcpair.length; i++) {
                    // WebVTT allows for extra meta data after the timestamp line
                    // So get rid of this if it exists
                    tcpair[i] = tcpair[i].replace(/(\d+:\d+:\d+\.\d+).*/, "$1");
                }
                return _subTcSecs(tcpair[pos]);
            }
            function _timecodeMin(tc) {
                return _timecodeCommon(tc, 0);
            }
            function _timecodeMax(tc) {
                return _timecodeCommon(tc, 1);
            }
            function _subTcSecs(tc) {
                if (tc === null || tc === undefined) {
                    return 0;
                } else {
                    var tc1 = [],
                        tc2 = [],
                        seconds;
                    tc1 = tc.split(',');
                    tc2 = tc1[0].split(':');
                    seconds = Math.floor(tc2[0]*60*60) + Math.floor(tc2[1]*60) + Math.floor(tc2[2]);
                    return seconds;
                }
            }

            // If it's not video, or we're using textTracks, bail.
            if (vimeovideo.usingTextTracks || vimeovideo.type !== 'video' || !vimeovideo.supported.full) {
                return;
            }

            // Reset subcount
            vimeovideo.subcount = 0;

            // Check time is a number, if not use currentTime
            // IE has a bug where currentTime doesn't go to 0
            // https://twitter.com/Sam_Potts/status/573715746506731521
            time = _is.number(time) ? time : vimeovideo.media.currentTime;

            // If there's no subs available, bail
            if (!vimeovideo.captions[vimeovideo.subcount]) {
                return;
            }

            while (_timecodeMax(vimeovideo.captions[vimeovideo.subcount][0]) < time.toFixed(1)) {
                vimeovideo.subcount++;
                if (vimeovideo.subcount > vimeovideo.captions.length - 1) {
                    vimeovideo.subcount = vimeovideo.captions.length - 1;
                    break;
                }
            }

            // Check if the next caption is in the current time range
            if (vimeovideo.media.currentTime.toFixed(1) >= _timecodeMin(vimeovideo.captions[vimeovideo.subcount][0]) &&
                vimeovideo.media.currentTime.toFixed(1) <= _timecodeMax(vimeovideo.captions[vimeovideo.subcount][0])) {
                    vimeovideo.currentCaption = vimeovideo.captions[vimeovideo.subcount][1];

                // Render the caption
                _setCaption(vimeovideo.currentCaption);
            } else {
                _setCaption();
            }
        }

        // Display captions container and button (for initialization)
        function _showCaptions() {
            // If there's no caption toggle, bail
            if (!vimeovideo.buttons.captions) {
                return;
            }

            _toggleClass(vimeovideo.container, config.classes.captions.enabled, true);

            // Try to load the value from storage
            var active = vimeovideo.storage.captionsEnabled;

            // Otherwise fall back to the default config
            if (!_is.boolean(active)) {
                active = config.captions.defaultActive;
            }

            if (active) {
                _toggleClass(vimeovideo.container, config.classes.captions.active, true);
                _toggleState(vimeovideo.buttons.captions, true);
            }
        }

        // Find all elements
        function _getElements(selector) {
            return vimeovideo.container.querySelectorAll(selector);
        }

        // Find a single element
        function _getElement(selector) {
            return _getElements(selector)[0];
        }

        // Determine if we're in an iframe
        function _inFrame() {
            try {
                return window.self !== window.top;
            }
            catch (e) {
                return true;
            }
        }

        // Trap focus inside container
        function _focusTrap() {
            var tabbables   = _getElements('input:not([disabled]), button:not([disabled])'),
                first       = tabbables[0],
                last        = tabbables[tabbables.length - 1];

            function _checkFocus(event) {
                // If it is TAB
                if (event.which === 9 && vimeovideo.isFullscreen) {
                    if (event.target === last && !event.shiftKey) {
                        // Move focus to first element that can be tabbed if Shift isn't used
                        event.preventDefault();
                        first.focus();
                    } else if (event.target === first && event.shiftKey) {
                        // Move focus to last element that can be tabbed if Shift is used
                        event.preventDefault();
                        last.focus();
                    }
                }
            }

            // Bind the handler
            _on(vimeovideo.container, 'keydown', _checkFocus);
        }

        // Add elements to HTML5 media (source, tracks, etc)
        function _insertChildElements(type, attributes) {
            if (_is.string(attributes)) {
               _insertElement(type, vimeovideo.media, { src: attributes });
            } else if (attributes.constructor === Array) {
                for (var i = attributes.length - 1; i >= 0; i--) {
                    _insertElement(type, vimeovideo.media, attributes[i]);
                }
            }
        }

        // Insert controls
        function _injectControls() {
            // Sprite
            if (config.loadSprite) {
                var iconUrl = _getIconUrl();

                // Only load external sprite using AJAX
                if (iconUrl.absolute) {
                    _log('AJAX loading absolute SVG sprite' + (vimeovideo.browser.isIE ? ' (due to IE)' : ''));
                    loadSprite(iconUrl.url, "sprite-vimeovideo");
                } else {
                    _log('Sprite will be used as external resource directly');
                }
            }

            // Make a copy of the html
            var html = config.html;

            // Insert custom video controls
            _log('Injecting custom controls');

            // If no controls are specified, create default
            if (!html) {
                html = _buildControls();
            }

            // Replace seek time instances
            html = _replaceAll(html, '{seektime}', config.seekTime);

            // Replace all id references with random numbers
            html = _replaceAll(html, '{id}', Math.floor(Math.random() * (10000)));

            // Controls container
            var target;

            // Inject to custom location
            if (_is.string(config.selectors.controls.container)) {
                target = document.querySelector(config.selectors.controls.container);
            }

            // Inject into the container by default
            if (!_is.htmlElement(target)) {
                target = vimeovideo.container
            }

            // Inject controls HTML
            target.insertAdjacentHTML('beforeend', html);

            // Setup tooltips
            if (config.tooltips.controls) {
                var labels = _getElements([config.selectors.controls.wrapper, ' ', config.selectors.labels, ' .', config.classes.hidden].join(''));

                for (var i = labels.length - 1; i >= 0; i--) {
                    var label = labels[i];

                    _toggleClass(label, config.classes.hidden, false);
                    _toggleClass(label, config.classes.tooltip, true);
                }
            }
        }

        // Find the UI controls and store references
        function _findElements() {
            try {
                vimeovideo.controls                 = _getElement(config.selectors.controls.wrapper);

                // Buttons
                vimeovideo.buttons = {};
                vimeovideo.buttons.seek             = _getElement(config.selectors.buttons.seek);
                vimeovideo.buttons.play             = _getElements(config.selectors.buttons.play);
                vimeovideo.buttons.pause            = _getElement(config.selectors.buttons.pause);
                vimeovideo.buttons.restart          = _getElement(config.selectors.buttons.restart);
                vimeovideo.buttons.rewind           = _getElement(config.selectors.buttons.rewind);
                vimeovideo.buttons.forward          = _getElement(config.selectors.buttons.forward);
                vimeovideo.buttons.fullscreen       = _getElement(config.selectors.buttons.fullscreen);

                // Inputs
                vimeovideo.buttons.mute             = _getElement(config.selectors.buttons.mute);
                vimeovideo.buttons.captions         = _getElement(config.selectors.buttons.captions);

                // Progress
                vimeovideo.progress = {};
                vimeovideo.progress.container       = _getElement(config.selectors.progress.container);

                // Progress - Buffering
                vimeovideo.progress.buffer          = {};
                vimeovideo.progress.buffer.bar      = _getElement(config.selectors.progress.buffer);
                vimeovideo.progress.buffer.text     = vimeovideo.progress.buffer.bar && vimeovideo.progress.buffer.bar.getElementsByTagName('span')[0];

                // Progress - Played
                vimeovideo.progress.played          = _getElement(config.selectors.progress.played);

                // Seek tooltip
                vimeovideo.progress.tooltip         = vimeovideo.progress.container && vimeovideo.progress.container.querySelector('.' + config.classes.tooltip);

                // Volume
                vimeovideo.volume                   = {};
                vimeovideo.volume.input             = _getElement(config.selectors.volume.input);
                vimeovideo.volume.display           = _getElement(config.selectors.volume.display);

                // Timing
                vimeovideo.duration                 = _getElement(config.selectors.duration);
                vimeovideo.currentTime              = _getElement(config.selectors.currentTime);
                vimeovideo.seekTime                 = _getElements(config.selectors.seekTime);

                return true;
            }
            catch(e) {
                _warn('It looks like there is a problem with your controls HTML');

                // Restore native video controls
                _toggleNativeControls(true);

                return false;
            }
        }

        // Toggle style hook
        function _toggleStyleHook() {
            _toggleClass(vimeovideo.container, config.selectors.container.replace('.', ''), vimeovideo.supported.full);
        }

        // Toggle native controls
        function _toggleNativeControls(toggle) {
            if (toggle && _inArray(config.types.html5, vimeovideo.type)) {
                vimeovideo.media.setAttribute('controls', '');
            } else {
                vimeovideo.media.removeAttribute('controls');
            }
        }

        // Setup aria attribute for play and iframe title
        function _setTitle(iframe) {
            // Find the current text
            var label = config.i18n.play;

            // If there's a media title set, use that for the label
            if (_is.string(config.title) && config.title.length) {
                label += ', ' + config.title;

                // Set container label
                vimeovideo.container.setAttribute('aria-label', config.title);
            }

            // If there's a play button, set label
            if (vimeovideo.supported.full && vimeovideo.buttons.play) {
                for (var i = vimeovideo.buttons.play.length - 1; i >= 0; i--) {
                    vimeovideo.buttons.play[i].setAttribute('aria-label', label);
                }
            }

            // Set iframe title
            // https://github.com/Selz/vimeovideo/issues/124
            if (_is.htmlElement(iframe)) {
                iframe.setAttribute('title', config.i18n.frameTitle.replace('{title}', config.title));
            }
        }

        // Setup localStorage
        function _setupStorage() {
            var value = null;
            vimeovideo.storage = {};

            // Bail if we don't have localStorage support or it's disabled
            if (!_storage.supported || !config.storage.enabled) {
                return;
            }

            // Clean up old volume
            // https://github.com/Selz/vimeovideo/issues/171
            window.localStorage.removeItem('vimeovideo-volume');

            // load value from the current key
            value = window.localStorage.getItem(config.storage.key);

            if (!value) {
                // Key wasn't set (or had been cleared), move along
                return;
            } else if (/^\d+(\.\d+)?$/.test(value)) {
                // If value is a number, it's probably volume from an older
                // version of vimeovideo. See: https://github.com/Selz/vimeovideo/pull/313
                // Update the key to be JSON
                _updateStorage({volume: parseFloat(value)});
            } else {
                // Assume it's JSON from this or a later version of vimeovideo
                vimeovideo.storage = JSON.parse(value);
            }
        }

        // Save a value back to local storage
        function _updateStorage(value) {
            // Bail if we don't have localStorage support or it's disabled
            if (!_storage.supported || !config.storage.enabled) {
                return;
            }

            // Update the working copy of the values
            _extend(vimeovideo.storage, value);

            // Update storage
            window.localStorage.setItem(config.storage.key, JSON.stringify(vimeovideo.storage));
        }

        // Setup media
        function _setupMedia() {
            // If there's no media, bail
            if (!vimeovideo.media) {
                _warn('No media element found!');
                return;
            }

            if (vimeovideo.supported.full) {
                // Add type class
                _toggleClass(vimeovideo.container, config.classes.type.replace('{0}', vimeovideo.type), true);

                // Add video class for embeds
                // This will require changes if audio embeds are added
                if (_inArray(config.types.embed, vimeovideo.type)) {
                    _toggleClass(vimeovideo.container, config.classes.type.replace('{0}', 'video'), true);
                }

                // If there's no autoplay attribute, assume the video is stopped and add state class
                _toggleClass(vimeovideo.container, config.classes.stopped, config.autoplay);

                // Add iOS class
                _toggleClass(vimeovideo.container, config.classes.isIos, vimeovideo.browser.isIos);

                // Add touch class
                _toggleClass(vimeovideo.container, config.classes.isTouch, vimeovideo.browser.isTouch);

                // Inject the player wrapper
                if (vimeovideo.type === 'video') {
                    // Create the wrapper div
                    var wrapper = document.createElement('div');
                    wrapper.setAttribute('class', config.classes.videoWrapper);

                    // Wrap the video in a container
                    _wrap(vimeovideo.media, wrapper);

                    // Cache the container
                    vimeovideo.videoContainer = wrapper;
                }
            }

            // Embeds
            if (_inArray(config.types.embed, vimeovideo.type)) {
                _setupEmbed();
            }
        }

        // Setup YouTube/Vimeo
        function _setupEmbed() {
            var container = document.createElement('div'),
                mediaId,
                id = vimeovideo.type + '-' + Math.floor(Math.random() * (10000));

            // Parse IDs from URLs if supplied
            switch (vimeovideo.type) {
                case 'vimeo':
                    mediaId = _parseVimeoId(vimeovideo.embedId);
                    break;

                default:
                    mediaId = vimeovideo.embedId;
            }

            // Remove old containers
            var containers = _getElements('[id^="' + vimeovideo.type + '-"]');
            for (var i = containers.length - 1; i >= 0; i--) {
                _remove(containers[i]);
            }

            // Add embed class for responsive
            _toggleClass(vimeovideo.media, config.classes.videoWrapper, true);
            _toggleClass(vimeovideo.media, config.classes.embedWrapper, true);

			if (vimeovideo.type === 'vimeo') {
                // Vimeo needs an extra div to hide controls on desktop (which has full support)
                if (vimeovideo.supported.full) {
                    vimeovideo.media.appendChild(container);
                } else {
                    container = vimeovideo.media;
                }

                // Set ID
                container.setAttribute('id', id);

                // Load the API if not already
                if (!_is.object(window.Vimeo)) {
                    _injectScript(config.urls.vimeo.api);

                    // Wait for fragaloop load
                    var vimeoTimer = window.setInterval(function() {
                        if (_is.object(window.Vimeo)) {
                            window.clearInterval(vimeoTimer);
                            _vimeoReady(mediaId, container);
                        }
                    }, 50);
                } else {
                    _vimeoReady(mediaId, container);
                }
            };
        }

        // When embeds are ready
        function _embedReady() {
            // Setup the UI and call ready if full support
            if (vimeovideo.supported.full) {
                _setupInterface();
                _ready();
            }

            // Set title
            _setTitle(_getElement('iframe'));
        }

        // Vimeo ready
        function _vimeoReady(mediaId, container) {
            // Setup instance
            // https://github.com/vimeo/player.js
            vimeovideo.embed = new window.Vimeo.Player(container, {
                id:         parseInt(mediaId),
                loop:       config.loop,
                autoplay:   config.autoplay,
                byline:     false,
                autopause:  false,
                portrait:   true,
                title:      false
            });

            // Create a faux HTML5 API using the Vimeo API
            vimeovideo.media.play = function() {
                vimeovideo.embed.play();
                vimeovideo.media.paused = false;
            };
            vimeovideo.media.pause = function() {
                vimeovideo.embed.pause();
                vimeovideo.media.paused = true;
            };
            vimeovideo.media.stop = function() {
                vimeovideo.embed.stop();
                vimeovideo.media.paused = true;
            };

            vimeovideo.media.paused = true;
            vimeovideo.media.currentTime = 0;

            // Update UI
            _embedReady();

            vimeovideo.embed.getCurrentTime().then(function(value) {
                vimeovideo.media.currentTime = value;

                // Trigger timeupdate
                _triggerEvent(vimeovideo.media, 'timeupdate');
            });

            vimeovideo.embed.getDuration().then(function(value) {
                vimeovideo.media.duration = value;

                // Trigger timeupdate
                _triggerEvent(vimeovideo.media, 'durationchange');
            });

            // TODO: Captions
            /*if (config.captions.defaultActive) {
                vimeovideo.embed.enableTextTrack('en');
            }*/

            vimeovideo.embed.on('loaded', function() {
                // Fix keyboard focus issues
                // https://github.com/Selz/vimeovideo/issues/317
                if (_is.htmlElement(vimeovideo.embed.element) && vimeovideo.supported.full) {
                    vimeovideo.embed.element.setAttribute('tabindex', '-1');
                }
            });

            vimeovideo.embed.on('play', function() {
                vimeovideo.media.paused = false;
                _triggerEvent(vimeovideo.media, 'play');
                _triggerEvent(vimeovideo.media, 'playing');
            });

            vimeovideo.embed.on('pause', function() {
                vimeovideo.media.paused = true;
                _triggerEvent(vimeovideo.media, 'pause');
            });

            vimeovideo.embed.on('timeupdate', function(data) {
                vimeovideo.media.seeking = false;
                vimeovideo.media.currentTime = data.seconds;
                _triggerEvent(vimeovideo.media, 'timeupdate');
            });

            vimeovideo.embed.on('progress', function(data) {
                vimeovideo.media.buffered = data.percent;
                _triggerEvent(vimeovideo.media, 'progress');

                if (parseInt(data.percent) === 1) {
                    // Trigger event
                    _triggerEvent(vimeovideo.media, 'canplaythrough');
                }
            });

            vimeovideo.embed.on('seeked', function() {
                vimeovideo.media.seeking = false;
                _triggerEvent(vimeovideo.media, 'seeked');
                _triggerEvent(vimeovideo.media, 'play');
            });

            vimeovideo.embed.on('ended', function() {
                vimeovideo.media.paused = true;
                _triggerEvent(vimeovideo.media, 'ended');
            });

        }

        // Play media
        function _play() {
            if ('play' in vimeovideo.media) {
                vimeovideo.media.play();
            }
        }

        // Pause media
        function _pause() {
            if ('pause' in vimeovideo.media) {
                vimeovideo.media.pause();
            }
        }

        // Toggle playback
        function _togglePlay(toggle) {
            // True toggle
            if (!_is.boolean(toggle)) {
                toggle = vimeovideo.media.paused;
            }

            if (toggle) {
                _play();
            } else {
                _pause();
            }

            return toggle;
        }

        // Rewind
        function _rewind(seekTime) {
            // Use default if needed
            if (!_is.number(seekTime)) {
                seekTime = config.seekTime;
            }
            _seek(vimeovideo.media.currentTime - seekTime);
        }

        // Fast forward
        function _forward(seekTime) {
            // Use default if needed
            if (!_is.number(seekTime)) {
                seekTime = config.seekTime;
            }
            _seek(vimeovideo.media.currentTime + seekTime);
        }

        // Seek to time
        // The input parameter can be an event or a number
        function _seek(input) {
            var targetTime  = 0,
                paused      = vimeovideo.media.paused,
                duration    = _getDuration();

            if (_is.number(input)) {
                targetTime = input;
            } else if (_is.object(input) && _inArray(['input', 'change'], input.type)) {
                // It's the seek slider
                // Seek to the selected time
                targetTime = ((input.target.value / input.target.max) * duration);
            }

            // Normalise targetTime
            if (targetTime < 0) {
                targetTime = 0;
            } else if (targetTime > duration) {
                targetTime = duration;
            }

            // Update seek range and progress
            _updateSeekDisplay(targetTime);

            // Set the current time
            // Try/catch incase the media isn't set and we're calling seek() from source() and IE moans
            try {
                vimeovideo.media.currentTime = targetTime.toFixed(4);
            }
            catch(e) {}

            // Embeds
            if (_inArray(config.types.embed, vimeovideo.type)) {
                switch(vimeovideo.type) {
                    case 'vimeo':
                        // Round to nearest second for vimeo
                        vimeovideo.embed.setCurrentTime(targetTime.toFixed(0));
                        break;
                }

                if (paused) {
                    _pause();
                }

                // Trigger timeupdate
                _triggerEvent(vimeovideo.media, 'timeupdate');

                // Set seeking flag
                vimeovideo.media.seeking = true;

                // Trigger seeking
                _triggerEvent(vimeovideo.media, 'seeking');
            }

            // Logging
            _log('Seeking to ' + vimeovideo.media.currentTime + ' seconds');

            // Special handling for 'manual' captions
            _seekManualCaptions(targetTime);
        }

        // Get the duration (or custom if set)
        function _getDuration() {
            // It should be a number, but parse it just incase
            var duration = parseInt(config.duration),

            // True duration
            mediaDuration = 0;

            // Only if duration available
            if (vimeovideo.media.duration !== null && !isNaN(vimeovideo.media.duration)) {
                mediaDuration = vimeovideo.media.duration;
            }

            // If custom duration is funky, use regular duration
            return (isNaN(duration) ? mediaDuration : duration);
        }

        // Check playing state
        function _checkPlaying() {
            _toggleClass(vimeovideo.container, config.classes.playing, !vimeovideo.media.paused);

            _toggleClass(vimeovideo.container, config.classes.stopped, vimeovideo.media.paused);

            _toggleControls(vimeovideo.media.paused);
        }

        // Save scroll position
        function _saveScrollPosition() {
            scroll = {
                x: window.pageXOffset || 0,
                y: window.pageYOffset || 0
            };
        }

        // Restore scroll position
        function _restoreScrollPosition() {
            window.scrollTo(scroll.x, scroll.y);
        }

        // Toggle fullscreen
        function _toggleFullscreen(event) {
            // Check for native support
            var nativeSupport = fullscreen.supportsFullScreen;

            if (nativeSupport) {
                // If it's a fullscreen change event, update the UI
                if (event && event.type === fullscreen.fullScreenEventName) {
                    _saveScrollPosition();
                    vimeovideo.isFullscreen = fullscreen.isFullScreen(vimeovideo.container);
                } else {
                    // Else it's a user request to enter or exit
                    if (!fullscreen.isFullScreen(vimeovideo.container)) {
                        // Save scroll position
                        _saveScrollPosition();

                        // Request full screen
                        fullscreen.requestFullScreen(vimeovideo.container);
                    } else {
                        // Bail from fullscreen
                        fullscreen.cancelFullScreen();
                    }

                    // Check if we're actually full screen (it could fail)
                    vimeovideo.isFullscreen = fullscreen.isFullScreen(vimeovideo.container);

                    return;
                }
            } else {
                // Otherwise, it's a simple toggle
                vimeovideo.isFullscreen = !vimeovideo.isFullscreen;

                // Bind/unbind escape key
                document.body.style.overflow = vimeovideo.isFullscreen ? 'hidden' : '';
            }

            // Set class hook
            _toggleClass(vimeovideo.container, config.classes.fullscreen.active, vimeovideo.isFullscreen);

            // Trap focus
            _focusTrap(vimeovideo.isFullscreen);

            // Set button state
            if (vimeovideo.buttons && vimeovideo.buttons.fullscreen) {
                _toggleState(vimeovideo.buttons.fullscreen, vimeovideo.isFullscreen);
            }

            // Trigger an event
            _triggerEvent(vimeovideo.container, vimeovideo.isFullscreen ? 'enterfullscreen' : 'exitfullscreen', true);

            // Restore scroll position
            if (!vimeovideo.isFullscreen && nativeSupport) {
                _restoreScrollPosition();
            }
        }

        // Mute
        function _toggleMute(muted) {
            // If the method is called without parameter, toggle based on current value
            if (!_is.boolean(muted)) {
                muted = !vimeovideo.media.muted;
            }

            // Set button state
            _toggleState(vimeovideo.buttons.mute, muted);

            // Set mute on the player
            vimeovideo.media.muted = muted;

            // If volume is 0 after unmuting, set to default
            if (vimeovideo.media.volume === 0) {
                _setVolume(config.volume);
            }

            // Embeds
            if (_inArray(config.types.embed, vimeovideo.type)) {
                // YouTube
                switch(vimeovideo.type) {
                    case 'vimeo':
                        vimeovideo.embed.setVolume(vimeovideo.media.muted ? 0 : parseFloat(config.volume / config.volumeMax));
                        break;
                }

                // Trigger volumechange for embeds
                _triggerEvent(vimeovideo.media, 'volumechange');
            }
        }

        // Set volume
        function _setVolume(volume) {
            var max = config.volumeMax,
                min = config.volumeMin;

            // Load volume from storage if no value specified
            if (_is.undefined(volume)) {
                volume = vimeovideo.storage.volume;
            }

            // Use config if all else fails
            if (volume === null || isNaN(volume)) {
                volume = config.volume;
            }

            // Maximum is volumeMax
            if (volume > max) {
                volume = max;
            }
            // Minimum is volumeMin
            if (volume < min) {
                volume = min;
            }

            // Set the player volume
            vimeovideo.media.volume = parseFloat(volume / max);

            // Set the display
            if (vimeovideo.volume.display) {
                vimeovideo.volume.display.value = volume;
            }

            // Embeds
            if (_inArray(config.types.embed, vimeovideo.type)) {
                switch(vimeovideo.type) {
                    case 'vimeo':
                        vimeovideo.embed.setVolume(vimeovideo.media.volume);
                        break;
                }

                // Trigger volumechange for embeds
                _triggerEvent(vimeovideo.media, 'volumechange');
            }

            // Toggle muted state
            if (volume === 0) {
                vimeovideo.media.muted = true;
            } else if (vimeovideo.media.muted && volume > 0) {
                _toggleMute();
            }
        }

        // Increase volume
        function _increaseVolume(step) {
            var volume = vimeovideo.media.muted ? 0 : (vimeovideo.media.volume * config.volumeMax);

            if (!_is.number(step)) {
                step = config.volumeStep;
            }

            _setVolume(volume + step);
        }

        // Decrease volume
        function _decreaseVolume(step) {
            var volume = vimeovideo.media.muted ? 0 : (vimeovideo.media.volume * config.volumeMax);

            if (!_is.number(step)) {
                step = config.volumeStep;
            }

            _setVolume(volume - step);
        }

        // Update volume UI and storage
        function _updateVolume() {
            // Get the current volume
            var volume = vimeovideo.media.muted ? 0 : (vimeovideo.media.volume * config.volumeMax);

            // Update the <input type="range"> if present
            if (vimeovideo.supported.full) {
                if (vimeovideo.volume.input) {
                    vimeovideo.volume.input.value = volume;
                }
                if (vimeovideo.volume.display) {
                    vimeovideo.volume.display.value = volume;
                }
            }

            // Update the volume in storage
            _updateStorage({volume: volume});

            // Toggle class if muted
            _toggleClass(vimeovideo.container, config.classes.muted, (volume === 0));

            // Update checkbox for mute state
            if (vimeovideo.supported.full && vimeovideo.buttons.mute) {
                _toggleState(vimeovideo.buttons.mute, (volume === 0));
            }
        }

        // Toggle captions
        function _toggleCaptions(show) {
            // If there's no full support, or there's no caption toggle
            if (!vimeovideo.supported.full || !vimeovideo.buttons.captions) {
                return;
            }

            // If the method is called without parameter, toggle based on current value
            if (!_is.boolean(show)) {
                show = (vimeovideo.container.className.indexOf(config.classes.captions.active) === -1);
            }

            // Set global
            vimeovideo.captionsEnabled = show;

            // Toggle state
            _toggleState(vimeovideo.buttons.captions, vimeovideo.captionsEnabled);

            // Add class hook
            _toggleClass(vimeovideo.container, config.classes.captions.active, vimeovideo.captionsEnabled);

            // Trigger an event
            _triggerEvent(vimeovideo.container, vimeovideo.captionsEnabled ? 'captionsenabled' : 'captionsdisabled', true);

            // Save captions state to localStorage
            _updateStorage({captionsEnabled: vimeovideo.captionsEnabled});
        }

        // Check if media is loading
        function _checkLoading(event) {
            var loading = (event.type === 'waiting');

            // Clear timer
            clearTimeout(timers.loading);

            // Timer to prevent flicker when seeking
            timers.loading = setTimeout(function() {
                // Toggle container class hook
                _toggleClass(vimeovideo.container, config.classes.loading, loading);

                // Show controls if loading, hide if done
                _toggleControls(loading);
            }, (loading ? 250 : 0));
        }

        // Update <progress> elements
        function _updateProgress(event) {
            if (!vimeovideo.supported.full) {
                return;
            }

            var progress    = vimeovideo.progress.played,
                value       = 0,
                duration    = _getDuration();

            if (event) {
                switch (event.type) {
                    // Video playing
                    case 'timeupdate':
                    case 'seeking':
                        if (vimeovideo.controls.pressed) {
                            return;
                        }

                        value = _getPercentage(vimeovideo.media.currentTime, duration);

                        // Set seek range value only if it's a 'natural' time event
                        if (event.type === 'timeupdate' && vimeovideo.buttons.seek) {
                            vimeovideo.buttons.seek.value = value;
                        }

                        break;

                    // Check buffer status
                    case 'playing':
                    case 'progress':


                        progress    = vimeovideo.progress.buffer;
                        value       = (function() {
                            var buffered = vimeovideo.media.buffered;

                            if (buffered && buffered.length) {
                                // HTML5
                                return _getPercentage(buffered.end(0), duration);
                            } else if (_is.number(buffered)) {
                                // YouTube returns between 0 and 1



                                if ($(vimeovideo.container).find('.video-holder').children('div').css('opacity') == '0') 
                                    setTimeout(function() {
                                        $(vimeovideo.container).find('.video-holder').children('div').css('opacity', '1')
                                    }, 20)





















































                                return (buffered * 100);
                            }

                            return 0;
                        })();

                        break;
                }
            }

            // Set values
            _setProgress(progress, value);
        }

        // Set <progress> value
        function _setProgress(progress, value) {
            if (!vimeovideo.supported.full) {
                return;
            }

            // Default to 0
            if (_is.undefined(value)) {
                value = 0;
            }
            // Default to buffer or bail
            if (_is.undefined(progress)) {
                if (vimeovideo.progress && vimeovideo.progress.buffer) {
                    progress = vimeovideo.progress.buffer;
                } else {
                    return;
                }
            }

            // One progress element passed
            if (_is.htmlElement(progress)) {
                progress.value = value;
            } else if (progress) {
                // Object of progress + text element
                if (progress.bar) {
                    progress.bar.value = value;
                }
                if (progress.text) {
                    progress.text.innerHTML = value;
                }
            }
        }

        // Update the displayed time
        function _updateTimeDisplay(time, element) {
            // Bail if there's no duration display
            if (!element) {
                return;
            }

            // Fallback to 0
            if (isNaN(time)) {
                time = 0;
            }

            vimeovideo.secs = parseInt(time % 60);
            vimeovideo.mins = parseInt((time / 60) % 60);
            vimeovideo.hours = parseInt(((time / 60) / 60) % 60);

            // Do we need to display hours?
            var displayHours = (parseInt(((_getDuration() / 60) / 60) % 60) > 0);

            // Ensure it's two digits. For example, 03 rather than 3.
            vimeovideo.secs = ('0' + vimeovideo.secs).slice(-2);
            vimeovideo.mins = ('0' + vimeovideo.mins).slice(-2);

            // Render
            element.innerHTML = (displayHours ? vimeovideo.hours + ':' : '') + vimeovideo.mins + ':' + vimeovideo.secs;
        }

        // Show the duration on metadataloaded
        function _displayDuration() {
            if (!vimeovideo.supported.full) {
                return;
            }

            // Determine duration
            var duration = _getDuration() || 0;

            // If there's only one time display, display duration there
            if (!vimeovideo.duration && config.displayDuration && vimeovideo.media.paused) {
                _updateTimeDisplay(duration, vimeovideo.currentTime);
            }

            // If there's a duration element, update content
            if (vimeovideo.duration) {
                _updateTimeDisplay(duration, vimeovideo.duration);
            }

            // Update the tooltip (if visible)
            _updateSeekTooltip();
        }

        // Handle time change event
        function _timeUpdate(event) {
            // Duration
            _updateTimeDisplay(vimeovideo.media.currentTime, vimeovideo.currentTime);

            // Ignore updates while seeking
            if (event && event.type === 'timeupdate' && vimeovideo.media.seeking) {
                return;
            }

            // Playing progress
            _updateProgress(event);
        }

        // Update seek range and progress
        function _updateSeekDisplay(time) {
            // Default to 0
            if (!_is.number(time)) {
                time = 0;
            }

            var duration    = _getDuration(),
                value       = _getPercentage(time, duration);

            // Update progress
            if (vimeovideo.progress && vimeovideo.progress.played) {
                vimeovideo.progress.played.value = value;
            }

            // Update seek range input
            if (vimeovideo.buttons && vimeovideo.buttons.seek) {
                vimeovideo.buttons.seek.value = value;
            }
        }

        // Update hover tooltip for seeking
        function _updateSeekTooltip(event) {
            var duration = _getDuration();

            // Bail if setting not true
            if (!config.tooltips.seek || !vimeovideo.progress.container || duration === 0) {
                return;
            }

            // Calculate percentage
            var clientRect  = vimeovideo.progress.container.getBoundingClientRect(),
                percent     = 0,
                visible     = config.classes.tooltip + '-visible';

            // Determine percentage, if already visible
            if (!event) {
                if (_hasClass(vimeovideo.progress.tooltip, visible)) {
                    percent = vimeovideo.progress.tooltip.style.left.replace('%', '');
                } else {
                    return;
                }
            } else {
                percent = ((100 / clientRect.width) * (event.pageX - clientRect.left));
            }

            // Set bounds
            if (percent < 0) {
                percent = 0;
            } else if (percent > 100) {
                percent = 100;
            }

            // Display the time a click would seek to
            _updateTimeDisplay(((duration / 100) * percent), vimeovideo.progress.tooltip);

            // Set position
            vimeovideo.progress.tooltip.style.left = percent + "%";

            // Show/hide the tooltip
            // If the event is a moues in/out and percentage is inside bounds
            if (event && _inArray(['mouseenter', 'mouseleave'], event.type)) {
                _toggleClass(vimeovideo.progress.tooltip, visible, (event.type === 'mouseenter'));
            }
        }

        // Show the player controls in fullscreen mode
        function _toggleControls(toggle) {
            // Don't hide if config says not to, it's audio, or not ready or loading
            if (!config.hideControls || vimeovideo.type === 'audio') {
                return;
            }

            var delay = 0,
                isEnterFullscreen = false,
                show = toggle,
                loading = _hasClass(vimeovideo.container, config.classes.loading);

            // Default to false if no boolean
            if (!_is.boolean(toggle)) {
                if (toggle && toggle.type) {
                    // Is the enter fullscreen event
                    isEnterFullscreen = (toggle.type === 'enterfullscreen');

                    // Whether to show controls
                    show = _inArray(['mousemove', 'touchstart', 'mouseenter', 'focus'], toggle.type);

                    // Delay hiding on move events
                    if (_inArray(['mousemove', 'touchmove'], toggle.type)) {
                        delay = 2000;
                    }

                    // Delay a little more for keyboard users
                    if (toggle.type === 'focus') {
                        delay = 3000;
                    }
                } else {
                    show = _hasClass(vimeovideo.container, config.classes.hideControls);
                }
            }

            // Clear timer every movement
            window.clearTimeout(timers.hover);

            // If the mouse is not over the controls, set a timeout to hide them
            if (show || vimeovideo.media.paused || loading) {
                _toggleClass(vimeovideo.container, config.classes.hideControls, false);

                // Always show controls when paused or if touch
                if (vimeovideo.media.paused || loading) {
                    return;
                }

                // Delay for hiding on touch
                if (vimeovideo.browser.isTouch) {
                    delay = 3000;
                }
            }

            // If toggle is false or if we're playing (regardless of toggle),
            // then set the timer to hide the controls
            if (!show || !vimeovideo.media.paused) {
                timers.hover = window.setTimeout(function() {
                    // If the mouse is over the controls (and not entering fullscreen), bail
                    if ((vimeovideo.controls.pressed || vimeovideo.controls.hover) && !isEnterFullscreen) {
                        return;
                    }

                    _toggleClass(vimeovideo.container, config.classes.hideControls, true);
                }, delay);
            }
        }

        // Add common function to retrieve media source
        function _source(source) {
            // If not null or undefined, parse it
            if (!_is.undefined(source)) {
                _updateSource(source);
                return;
            }

            // Return the current source
            var url;
            switch(vimeovideo.type) {
                case 'vimeo':
                    vimeovideo.embed.getVideoUrl.then(function (value) {
                        url = value;
                    });
                    break;
                default:
                    url = vimeovideo.media.currentSrc;
                    break;
            }

            return url || '';
        }

        // Update source
        // Sources are not checked for support so be careful
        function _updateSource(source) {
            if (!_is.object(source) || !('sources' in source) || !source.sources.length) {
                _warn('Invalid source format');
                return;
            }

            // Remove ready class hook
            _toggleClass(vimeovideo.container, config.classes.ready, false);

            // Pause playback
            _pause();

            // Update seek range and progress
            _updateSeekDisplay();

            // Reset buffer progress
            _setProgress();

            // Cancel current network requests
            _cancelRequests();

            // Setup new source
            function setup() {
                // Remove embed object
                vimeovideo.embed = null;

                // Remove the old media
                _remove(vimeovideo.media);

                // Remove video container
                if (vimeovideo.type === 'video' && vimeovideo.videoContainer) {
                    _remove(vimeovideo.videoContainer);
                }

                // Reset class name
                if (vimeovideo.container) {
                    vimeovideo.container.removeAttribute('class');
                }

                // Set the type
                if ('type' in source) {
                    vimeovideo.type = source.type;

                    // Get child type for video (it might be an embed)
                    if (vimeovideo.type === 'video') {
                        var firstSource = source.sources[0];

                        if ('type' in firstSource && _inArray(config.types.embed, firstSource.type)) {
                            vimeovideo.type = firstSource.type;
                        }
                    }
                }

                // Check for support
                vimeovideo.supported = supported(vimeovideo.type);

                // Create new markup
                switch(vimeovideo.type) {
                    case 'video':
                        vimeovideo.media = document.createElement('video');
                        break;

                    case 'audio':
                        vimeovideo.media = document.createElement('audio');
                        break;

                    case 'vimeo':
                        vimeovideo.media = document.createElement('div');
                        vimeovideo.embedId = source.sources[0].src;
                        break;
                }

                // Inject the new element
                _prependChild(vimeovideo.container, vimeovideo.media);

                // Autoplay the new source?
                if (_is.boolean(source.autoplay)) {
                    config.autoplay = source.autoplay;
                }

                // Set attributes for audio and video
                if (_inArray(config.types.html5, vimeovideo.type)) {
                    if (config.crossorigin) {
                        vimeovideo.media.setAttribute('crossorigin', '');
                    }
                    if (config.autoplay) {
                        vimeovideo.media.setAttribute('autoplay', '');
                    }
                    if ('poster' in source) {
                        vimeovideo.media.setAttribute('poster', source.poster);
                    }
                    if (config.loop) {
                        vimeovideo.media.setAttribute('loop', '');
                    }
                }

                // Restore class hooks
                _toggleClass(vimeovideo.container, config.classes.fullscreen.active, vimeovideo.isFullscreen);
                _toggleClass(vimeovideo.container, config.classes.captions.active, vimeovideo.captionsEnabled);
                _toggleStyleHook();

                // Set new sources for html5
                if (_inArray(config.types.html5, vimeovideo.type)) {
                    _insertChildElements('source', source.sources);
                }

                // Set up from scratch
                _setupMedia();

                // HTML5 stuff
                if (_inArray(config.types.html5, vimeovideo.type)) {
                    // Setup captions
                    if ('tracks' in source) {
                        _insertChildElements('track', source.tracks);
                    }

                    // Load HTML5 sources
                    vimeovideo.media.load();
                }

                // If HTML5 or embed but not fully supported, setupInterface and call ready now
                if (_inArray(config.types.html5, vimeovideo.type) || (_inArray(config.types.embed, vimeovideo.type) && !vimeovideo.supported.full)) {
                    // Setup interface
                    _setupInterface();

                    // Call ready
                    _ready();
                }

                // Set aria title and iframe title
                config.title = source.title;
                _setTitle();
            }

            // Destroy instance adn wait for callback
            // Vimeo throws a wobbly if you don't wait
            _destroy(setup, false);
        }

        // Update poster
        function _updatePoster(source) {
            if (vimeovideo.type === 'video') {
                vimeovideo.media.setAttribute('poster', source);
            }
        }

        // Listen for control events
        function _controlListeners() {
            // IE doesn't support input event, so we fallback to change
            var inputEvent = (vimeovideo.browser.isIE ? 'change' : 'input');

            // Click play/pause helper
            function togglePlay() {
                var play = _togglePlay();

                // Determine which buttons
                var trigger = vimeovideo.buttons[play ? 'play' : 'pause'],
                    target = vimeovideo.buttons[play ? 'pause' : 'play'];

                // Get the last play button to account for the large play button
                if (target && target.length > 1) {
                    target = target[target.length - 1];
                } else {
                    target = target[0];
                }

                // Setup focus and tab focus
                if (target) {
                    var hadTabFocus = _hasClass(trigger, config.classes.tabFocus);

                    setTimeout(function() {
                        target.focus();

                        if (hadTabFocus) {
                            _toggleClass(trigger, config.classes.tabFocus, false);
                            _toggleClass(target, config.classes.tabFocus, true);
                        }
                    }, 100);
                }
            }

            // Get the focused element
            function getFocusElement() {
                var focused = document.activeElement;

                if (!focused || focused === document.body) {
                    focused = null;
                } else {
                    focused = document.querySelector(':focus');
                }

                return focused;
            }

            // Get the key code for an event
            function getKeyCode(event) {
                return event.keyCode ? event.keyCode : event.which;
            }

            // Detect tab focus
            function checkTabFocus(focused) {
                for (var button in vimeovideo.buttons) {
                    var element = vimeovideo.buttons[button];

                    if (_is.nodeList(element)) {
                        for (var i = 0; i < element.length; i++) {
                            _toggleClass(element[i], config.classes.tabFocus, (element[i] === focused));
                        }
                    } else {
                        _toggleClass(element, config.classes.tabFocus, (element === focused));
                    }
                }
            }

            // Keyboard shortcuts
            if (config.keyboardShorcuts.focused) {
                var last = null;

                // Handle global presses
                if (config.keyboardShorcuts.global) {
                    _on(window, 'keydown keyup', function(event) {
                        var code = getKeyCode(event),
                        focused = getFocusElement(),
                        allowed = [48,49,50,51,52,53,54,56,57,75,77,70,67],
                        count   = get().length;

                        // Only handle global key press if there's only one player
                        // and the key is in the allowed keys
                        // and if the focused element is not editable (e.g. text input)
                        // and any that accept key input http://webaim.org/techniques/keyboard/
                        if (count === 1 && _inArray(allowed, code) && (!_is.htmlElement(focused) || !_matches(focused, config.selectors.editable))) {
                            handleKey(event);
                        }
                    });
                }

                // Handle presses on focused
                _on(vimeovideo.container, 'keydown keyup', handleKey);
            }

            function handleKey(event) {
                var code = getKeyCode(event),
                    pressed = event.type === 'keydown',
                    held = pressed && code === last;

                // If the event is bubbled from the media element
                // Firefox doesn't get the keycode for whatever reason
                if (!_is.number(code)) {
                    return;
                }

                // Seek by the number keys
                function seekByKey() {
                    // Get current duration
                    var duration = vimeovideo.media.duration;

                    // Bail if we have no duration set
                    if (!_is.number(duration)) {
                        return;
                    }

                    // Divide the max duration into 10th's and times by the number value
                    _seek((duration / 10) * (code - 48));
                }

                // Handle the key on keydown
                // Reset on keyup
                if (pressed) {
                    // Which keycodes should we prevent default
                    var preventDefault = [48,49,50,51,52,53,54,56,57,32,75,38,40,77,39,37,70,67];

                    // If the code is found prevent default (e.g. prevent scrolling for arrows)
                    if (_inArray(preventDefault, code)) {
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    switch(code) {
                        // 0-9
                        case 48:
                        case 49:
                        case 50:
                        case 51:
                        case 52:
                        case 53:
                        case 54:
                        case 55:
                        case 56:
                        case 57: if (!held) { seekByKey(); } break;
                        // Space and K key
                        case 32:
                        case 75: if (!held) { _togglePlay(); } break;
                        // Arrow up
                        case 38: _increaseVolume(); break;
                        // Arrow down
                        case 40: _decreaseVolume(); break;
                        // M key
                        case 77: if (!held) { _toggleMute() } break;
                        // Arrow forward
                        case 39: _forward(); break;
                        // Arrow back
                        case 37: _rewind(); break;
                        // F key
                        case 70: _toggleFullscreen(); break;
                        // C key
                        case 67: if (!held) { _toggleCaptions(); } break;
                    }

                    // Escape is handle natively when in full screen
                    // So we only need to worry about non native
                    if (!fullscreen.supportsFullScreen && vimeovideo.isFullscreen && code === 27) {
                        _toggleFullscreen();
                    }

                    // Store last code for next cycle
                    last = code;
                } else {
                    last = null;
                }
            }

            // Focus/tab management
            _on(window, 'keyup', function(event) {
                var code = getKeyCode(event),
                    focused = getFocusElement();

                if (code === 9) {
                    checkTabFocus(focused);
                }
            });
            _on(document.body, 'click', function() {
                _toggleClass(_getElement('.' + config.classes.tabFocus), config.classes.tabFocus, false);
            });
            for (var button in vimeovideo.buttons) {
                var element = vimeovideo.buttons[button];

                _on(element, 'blur', function() {
                    _toggleClass(element, 'tab-focus', false);
                });
            }

            // Play
            _proxyListener(vimeovideo.buttons.play, 'click', config.listeners.play, togglePlay);

            // Pause
            _proxyListener(vimeovideo.buttons.pause, 'click', config.listeners.pause, togglePlay);

            // Restart
            _proxyListener(vimeovideo.buttons.restart, 'click', config.listeners.restart, _seek);

            // Rewind
            _proxyListener(vimeovideo.buttons.rewind, 'click', config.listeners.rewind, _rewind);

            // Fast forward
            _proxyListener(vimeovideo.buttons.forward, 'click', config.listeners.forward, _forward);

            // Seek
            _proxyListener(vimeovideo.buttons.seek, inputEvent, config.listeners.seek, _seek);

            // Set volume
            _proxyListener(vimeovideo.volume.input, inputEvent, config.listeners.volume, function() {
                _setVolume(vimeovideo.volume.input.value);
            });

            // Mute
            _proxyListener(vimeovideo.buttons.mute, 'click', config.listeners.mute, _toggleMute);

            // Fullscreen
            _proxyListener(vimeovideo.buttons.fullscreen, 'click', config.listeners.fullscreen, _toggleFullscreen);

            // Handle user exiting fullscreen by escaping etc
            if (fullscreen.supportsFullScreen) {
                _on(document, fullscreen.fullScreenEventName, _toggleFullscreen);
            }

            // Captions
            _on(vimeovideo.buttons.captions, 'click', _toggleCaptions);

            // Seek tooltip
            _on(vimeovideo.progress.container, 'mouseenter mouseleave mousemove', _updateSeekTooltip);

            // Toggle controls visibility based on mouse movement
            if (config.hideControls) {
                // Toggle controls on mouse events and entering fullscreen
                _on(vimeovideo.container, 'mouseenter mouseleave mousemove touchstart touchend touchcancel touchmove enterfullscreen', _toggleControls);

                // Watch for cursor over controls so they don't hide when trying to interact
                _on(vimeovideo.controls, 'mouseenter mouseleave', function(event) {
                    vimeovideo.controls.hover = event.type === 'mouseenter';
                });

                 // Watch for cursor over controls so they don't hide when trying to interact
                _on(vimeovideo.controls, 'mousedown mouseup touchstart touchend touchcancel', function(event) {
                    vimeovideo.controls.pressed = _inArray(['mousedown', 'touchstart'], event.type);
                });

                // Focus in/out on controls
                _on(vimeovideo.controls, 'focus blur', _toggleControls, true);
            }

            // Adjust volume on scroll
            _on(vimeovideo.volume.input, 'wheel', function(event) {
                event.preventDefault();

                // Detect "natural" scroll - suppored on OS X Safari only
                // Other browsers on OS X will be inverted until support improves
                var inverted = event.webkitDirectionInvertedFromDevice,
                    step = (config.volumeStep / 5);

                // Scroll down (or up on natural) to decrease
                if (event.deltaY < 0 || event.deltaX > 0) {
                    if (inverted) {
                        _decreaseVolume(step);
                    } else {
                        _increaseVolume(step);
                    }
                }

                // Scroll up (or down on natural) to increase
                if (event.deltaY > 0 || event.deltaX < 0) {
                    if (inverted) {
                        _increaseVolume(step);
                    } else {
                        _decreaseVolume(step);
                    }
                }
            });
        }

        // Listen for media events
        function _mediaListeners() {
            // Time change on media
            _on(vimeovideo.media, 'timeupdate seeking', _timeUpdate);

            // Update manual captions
            _on(vimeovideo.media, 'timeupdate', _seekManualCaptions);

            // Display duration
            _on(vimeovideo.media, 'durationchange loadedmetadata', _displayDuration);

            // Handle the media finishing
            _on(vimeovideo.media, 'ended', function() {
                // Show poster on end
                if (vimeovideo.type === 'video' && config.showPosterOnEnd) {
                    // Clear
                    if (vimeovideo.type === 'video') {
                        _setCaption();
                    }

                    // Restart
                    _seek();

                    // Re-load media
                    vimeovideo.media.load();
                }
            });

            // Check for buffer progress
            _on(vimeovideo.media, 'progress playing', _updateProgress);

            // Handle native mute
            _on(vimeovideo.media, 'volumechange', _updateVolume);

            // Handle native play/pause
            _on(vimeovideo.media, 'play pause ended', _checkPlaying);

            // Loading
            _on(vimeovideo.media, 'waiting canplay seeked', _checkLoading);

            // Click video
            if (config.clickToPlay && vimeovideo.type !== 'audio') {
                // Re-fetch the wrapper
                var wrapper = _getElement('.' + config.classes.videoWrapper);

                // Bail if there's no wrapper (this should never happen)
                if (!wrapper) {
                    return;
                }

                // Set cursor
                wrapper.style.cursor = "pointer";

                // On click play, pause ore restart
                _on(wrapper, 'click', function() {
                    // Touch devices will just show controls (if we're hiding controls)
                    if (config.hideControls && vimeovideo.browser.isTouch && !vimeovideo.media.paused) {
                        return;
                    }

                    if (vimeovideo.media.paused) {
                        _play();
                    } else if (vimeovideo.media.ended) {
                        _seek();
                        _play();
                    } else {
                        _pause();
                    }
                });
            }

            // Disable right click
            if (config.disableContextMenu) {
                _on(vimeovideo.media, 'contextmenu', function(event) { event.preventDefault(); });
            }

            // Proxy events to container
            // Bubble up key events for Edge
            _on(vimeovideo.media, config.events.concat(['keyup', 'keydown']).join(' '), function(event) {
                _triggerEvent(vimeovideo.container, event.type, true);
            });
        }

        // Cancel current network requests
        // See https://github.com/Selz/vimeovideo/issues/174
        function _cancelRequests() {
            if (!_inArray(config.types.html5, vimeovideo.type)) {
                return;
            }

            // Remove child sources
            var sources = vimeovideo.media.querySelectorAll('source');
            for (var i = 0; i < sources.length; i++) {
                _remove(sources[i]);
            }

            // Set blank video src attribute
            // This is to prevent a MEDIA_ERR_SRC_NOT_SUPPORTED error
            // Info: http://stackoverflow.com/questions/32231579/how-to-properly-dispose-of-an-html5-video-and-close-socket-or-connection
            vimeovideo.media.setAttribute('src', 'https://cdn.selz.com/vimeovideo/blank.mp4');

            // Load the new empty source
            // This will cancel existing requests
            // See https://github.com/Selz/vimeovideo/issues/174
            vimeovideo.media.load();

            // Debugging
            _log('Cancelled network requests');
        }

        // Destroy an instance
        // Event listeners are removed when elements are removed
        // http://stackoverflow.com/questions/12528049/if-a-dom-element-is-removed-are-its-listeners-also-removed-from-memory
        function _destroy(callback, restore) {
            // Bail if the element is not initialized
            if (!vimeovideo.init) {
                return null;
            }

            // Type specific stuff
            switch (vimeovideo.type) {
                case 'vimeo':
                    // Destroy Vimeo API
                    // then clean up (wait, to prevent postmessage errors)
                    vimeovideo.embed.unload().then(cleanUp);

                    // Vimeo does not always return
                    timers.cleanUp = window.setTimeout(cleanUp, 200);

                    break;

                case 'video':
                case 'audio':
                    // Restore native video controls
                    _toggleNativeControls(true);

                    // Clean up
                    cleanUp();

                    break;
            }

            function cleanUp() {
                clearTimeout(timers.cleanUp);

                // Default to restore original element
                if (!_is.boolean(restore)) {
                    restore = true;
                }

                // Callback
                if (_is.function(callback)) {
                    callback.call(original);
                }

                // Bail if we don't need to restore the original element
                if (!restore) {
                    return;
                }

                // Remove init flag
                vimeovideo.init = false;

                // Replace the container with the original element provided
                vimeovideo.container.parentNode.replaceChild(original, vimeovideo.container);

                // Allow overflow (set on fullscreen)
                document.body.style.overflow = '';

                // Event
                _triggerEvent(original, 'destroyed', true);
            }
        }

        // Setup a player
        function _init() {
            // Bail if the element is initialized
            if (vimeovideo.init) {
                return null;
            }

            // Setup the fullscreen api
            fullscreen = _fullscreen();

            // Sniff out the browser
            vimeovideo.browser = _browserSniff();

            // Bail if nothing to setup
            if (!_is.htmlElement(vimeovideo.media)) {
                return;
            }

            // Load saved settings from localStorage
            _setupStorage();

            // Set media type based on tag or data attribute
            // Supported: video, audio, vimeo, youtube
            var tagName = media.tagName.toLowerCase();
            if (tagName === 'div') {
                vimeovideo.type     = media.getAttribute('data-type');
                vimeovideo.embedId  = media.getAttribute('data-video-id');

                // Clean up
                media.removeAttribute('data-type');
                media.removeAttribute('data-video-id');
            } else {
                vimeovideo.type           = tagName;
                config.crossorigin  = (media.getAttribute('crossorigin') !== null);
                config.autoplay     = (config.autoplay || (media.getAttribute('autoplay') !== null));
                config.loop         = (config.loop || (media.getAttribute('loop') !== null));
            }

            // Check for support
            vimeovideo.supported = supported(vimeovideo.type);

            // If no native support, bail
            if (!vimeovideo.supported.basic) {
                return;
            }

            // Wrap media
            vimeovideo.container = _wrap(media, document.createElement('div'));

            // Allow focus to be captured
            vimeovideo.container.setAttribute('tabindex', 0);

            // Add style hook
            _toggleStyleHook();

            // Debug info
            _log('' + vimeovideo.browser.name + ' ' + vimeovideo.browser.version);

            // Setup media
            _setupMedia();

            // Setup interface
            // If embed but not fully supported, setupInterface (to avoid flash of controls) and call ready now
            if (_inArray(config.types.html5, vimeovideo.type) || (_inArray(config.types.embed, vimeovideo.type) && !vimeovideo.supported.full)) {
                // Setup UI
                _setupInterface();

                // Call ready
                _ready();

                // Set title on button and frame
                _setTitle();
            }

            // Successful setup
            vimeovideo.init = true;
        }

        // Setup the UI
        function _setupInterface() {
            // Don't setup interface if no support
            if (!vimeovideo.supported.full) {
                _warn('Basic support only', vimeovideo.type);

                // Remove controls
                _remove(_getElement(config.selectors.controls.wrapper));

                // Remove large play
                _remove(_getElement(config.selectors.buttons.play));

                // Restore native controls
                _toggleNativeControls(true);

                // Bail
                return;
            }

            // Inject custom controls if not present
            var controlsMissing = !_getElements(config.selectors.controls.wrapper).length;
            if (controlsMissing) {
                // Inject custom controls
                _injectControls();
            }

            // Find the elements
            if (!_findElements()) {
                return;
            }

            // If the controls are injected, re-bind listeners for controls
            if (controlsMissing) {
                _controlListeners();
            }

            // Media element listeners
            _mediaListeners();

            // Remove native controls
            _toggleNativeControls();

            // Setup fullscreen
            _setupFullscreen();

            // Captions
            _setupCaptions();

            // Set volume
            _setVolume();
            _updateVolume();

            // Reset time display
            _timeUpdate();

            // Update the UI
            _checkPlaying();

            var color = $('.single-holder').data('controls');
            
            $('.vimeovideo-play-large').css('border-color', color);
            $('.vimeovideo-play-large span').css({'borderLeftColor': color});
            $('.vimeovideo-progress-played').css({'color': color});

        }

        api = {
            getOriginal:        function() { return original; },
            getContainer:       function() { return vimeovideo.container },
            getEmbed:           function() { return vimeovideo.embed; },
            getMedia:           function() { return vimeovideo.media; },
            getType:            function() { return vimeovideo.type; },
            getDuration:        _getDuration,
            getCurrentTime:     function() { return vimeovideo.media.currentTime; },
            getVolume:          function() { return vimeovideo.media.volume; },
            isMuted:            function() { return vimeovideo.media.muted; },
            isReady:            function() { return _hasClass(vimeovideo.container, config.classes.ready); },
            isLoading:          function() { return _hasClass(vimeovideo.container, config.classes.loading); },
            isPaused:           function() { return vimeovideo.media.paused; },
            on:                 function(event, callback) { _on(vimeovideo.container, event, callback); return this; },
            play:               _play,
            pause:              _pause,
            stop:               function() { _pause(); _seek(); },
            restart:            _seek,
            rewind:             _rewind,
            forward:            _forward,
            seek:               _seek,
            source:             _source,
            poster:             _updatePoster,
            setVolume:          _setVolume,
            togglePlay:         _togglePlay,
            toggleMute:         _toggleMute,
            toggleCaptions:     _toggleCaptions,
            toggleFullscreen:   _toggleFullscreen,
            toggleControls:     _toggleControls,
            isFullscreen:       function() { return vimeovideo.isFullscreen || false; },
            support:            function(mimeType) { return _supportMime(vimeovideo, mimeType); },
            destroy:            _destroy
        };

        // Everything done
        function _ready() {
            // Ready event at end of execution stack
            window.setTimeout(function() {
                _triggerEvent(vimeovideo.media, 'ready');
            }, 0);

            // Set class hook on media element
            _toggleClass(vimeovideo.media, defaults.classes.setup, true);

            // Set container class for ready
            _toggleClass(vimeovideo.container, config.classes.ready, true);

            // Store a refernce to instance
            vimeovideo.media.vimeovideo = api;

            // Autoplay
            if (config.autoplay) {
                _play();
            }
        }

        // Initialize instance
        _init();

        // If init failed, return null
        if (!vimeovideo.init) {
            return null;
        }

        return api;
    }

    // Load a sprite
    function loadSprite(url, id) {
        var x = new XMLHttpRequest();

        // If the id is set and sprite exists, bail
        if (_is.string(id) && _is.htmlElement(document.querySelector('#' + id))) {
            return;
        }

        // Create placeholder (to prevent loading twice)
        var container = document.createElement('div');
        container.setAttribute('hidden', '');
        if (_is.string(id)) {
            container.setAttribute('id', id);
        }
        document.body.insertBefore(container, document.body.childNodes[0]);

        // Check for CORS support
        if ('withCredentials' in x) {
            x.open('GET', url, true);
        } else {
            return;
        }

        // Inject hidden div with sprite on load
        x.onload = function() {
            container.innerHTML = x.responseText;
        }

        x.send();
    }

    // Check for support
    function supported(type) {
        var browser     = _browserSniff(),
            isOldIE     = (browser.isIE && browser.version <= 9),
            isIos       = browser.isIos,
            isIphone    = browser.isIphone,
            audioSupport = !!document.createElement('audio').canPlayType,
            videoSupport = !!document.createElement('video').canPlayType,
            basic       = false,
            full        = false;

        switch (type) {
            case 'video':
                basic = videoSupport;
                full  = (basic && (!isOldIE && !isIphone));
                break;

            case 'audio':
                basic = audioSupport;
                full  = (basic && !isOldIE);
                break;

            // Vimeo does not seem to be supported on iOS via API
            // Issue raised https://github.com/vimeo/player.js/issues/87
            case 'vimeo':
                basic = true;
                full = (!isOldIE && !isIos);
                break;

            default:
                basic = (audioSupport && videoSupport);
                full  = (basic && !isOldIE);
        }

        return {
            basic:  basic,
            full:   full
        };
    }

    // Setup function
    function setup(targets, options) {
        // Get the players
        var players     = [],
            instances   = [],
            selector    = [defaults.selectors.html5, defaults.selectors.embed].join(',');

        // Select the elements
        if (_is.string(targets)) {
            // String selector passed
            targets = document.querySelectorAll(targets);
        }  else if (_is.htmlElement(targets)) {
            // Single HTMLElement passed
            targets = [targets];
        }  else if (!_is.nodeList(targets) && !_is.array(targets) && !_is.string(targets))  {
            // No selector passed, possibly options as first argument
            // If options are the first argument
            if (_is.undefined(options) && _is.object(targets)) {
                options = targets;
            }

            // Use default selector
            targets = document.querySelectorAll(selector);
        }

        // Convert NodeList to array
        if (_is.nodeList(targets)) {
            targets = Array.prototype.slice.call(targets);
        }

        // Bail if disabled or no basic support
        // You may want to disable certain UAs etc
        if (!supported().basic || !targets.length) {
            return false;
        }

        // Add to container list
        function add(target, media) {
            if (!_hasClass(media, defaults.classes.hook)) {
                players.push({
                    // Always wrap in a <div> for styling
                    //container:  _wrap(media, document.createElement('div')),
                    // Could be a container or the media itself
                    target:     target,
                    // This should be the <video>, <audio> or <div> (YouTube/Vimeo)
                    media:      media
                });
            }
        }

        // Check if the targets have multiple media elements
        for (var i = 0; i < targets.length; i++) {
            var target = targets[i];

            // Get children
            var children = target.querySelectorAll(selector);

            // If there's more than one media element child, wrap them
            if (children.length) {
                for (var x = 0; x < children.length; x++) {
                    add(target, children[x]);
                }
            } else if (_matches(target, selector)) {
                // Target is media element
                add(target, target);
            }
        }

        // Create a player instance for each element
        players.forEach(function(player) {
            var element     = player.target,
                media       = player.media,
                match       = false;

            // The target element can also be the media element
            if (media === element) {
                match = true;
            }

            // Setup a player instance and add to the element
            // Create instance-specific config
            var data = {};

            // Try parsing data attribute config
            try { data = JSON.parse(element.getAttribute('data-vimeovideo')); }
            catch(e) { }

            var config = _extend({}, defaults, options, data);

            // Bail if not enabled
            if (!config.enabled) {
                return null;
            }

            // Create new instance
            var instance = new vimeovideo(media, config);

            // Go to next if setup failed
            if (!_is.object(instance)) {
                return;
            }

            // Listen for events if debugging
            if (config.debug) {
                var events = config.events.concat(['setup', 'statechange', 'enterfullscreen', 'exitfullscreen', 'captionsenabled', 'captionsdisabled']);

                _on(instance.getContainer(), events.join(' '), function(event) {
                    console.log([config.logPrefix, 'event:', event.type].join(' '), event.detail.vimeovideo);
                });
            }

            // Callback
            _event(instance.getContainer(), 'setup', true, {
                vimeovideo: instance
            });

            // Add to return array even if it's already setup
            instances.push(instance);
        });

        return instances;
    }

    // Get all instances within a provided container
    function get(container) {
        if (_is.string(container)) {
            // Get selector if string passed
            container = document.querySelector(container);
        } else if (_is.undefined(container)) {
            // Use body by default to get all on page
            container = document.body;
        }

        // If we have a HTML element
        if (_is.htmlElement(container)) {
            var elements = container.querySelectorAll('.' + defaults.classes.setup),
                instances = [];

            Array.prototype.slice.call(elements).forEach(function(element) {
                if (_is.object(element.vimeovideo)) {
                    instances.push(element.vimeovideo);
                }
            });

            return instances;
        }

        return [];
    }

    return {
        setup:      setup,
        supported:  supported,
        loadSprite: loadSprite,
        get:        get
    };
}));

// Custom event polyfill
// https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
(function () {
    if (typeof window.CustomEvent === 'function') {
        return;
    }

    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
})();
