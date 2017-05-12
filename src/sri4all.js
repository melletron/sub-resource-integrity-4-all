"use strict";

if (!Array.from) {
    Array.from = function (object) {
        'use strict';
        return [].slice.call(object);
    };
}

// This is minified 318 kB, so it needs lazy loading...
// I we have native SRI we don't need this file ...
import sha256 from "js-sha256";

import cssChecker from "./css-check";
import jsChecker from "./js-check";

/**
 * We want to have two custom events for triggering the
 * integrity checkers - we have them as events because that way
 * we can keep the integrity chekers themselves isolated.
 */
const spawnEvent = eventName => {
    let event;
    if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent(eventName, true, true);
    } else {
        event = document.createEventObject();
        event.eventType = eventName;
    }
    event.eventName = eventName;
    return event;
};

(function () {

    /**
     * As soon as we have a DOM node, we want to add event listeners
     * Since we'll be injecting this in the head, that's the node we'll
     * be using
     */
    document.head.addEventListener("sri-css", () => {
        cssChecker(sha256);
    });
    document.head.addEventListener("sri-js", () => {
        jsChecker(sha256);
    });

    /**
     *
     * Can't escape a global for now...
     */
    window.SRI4ALL = {
        /**
         * I am using an event system because I want the checkers not to by publicly accesible.
         * I want to make absolutely sure the integrity checkers cannot be overwritten.
         */
        css: () => document.head.dispatchEvent(spawnEvent("sri-css")),
        js: () => document.head.dispatchEvent(spawnEvent("sri-js"))
    };
}());
