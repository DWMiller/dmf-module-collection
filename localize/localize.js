dmf.createModule('localize', function(c, config) {
    'use strict';

    var properties = {
        id: 'localize',
        listeners: {
            'language-change': changeLanguage
        }
    };

    var elements;

    var p_languages = {}; // will contain lazy loaded language data

    var language; // string representing key of currently active language (default 'en' for english)

    /************************** Module initialization *************************/

    function initialize(scope) {
        language = config.default_language;
        getLanguage();
    }

    function destroy() {
        elements = {};
    }

    function changeLanguage(data) {
        language = data.language;
        getLanguage();
    }

    /************************** Framework Listeners ***************************/

    /**
     * Retrieve language data for specific language
     * @return {[type]}      [description]
     */
    function getLanguage() {
        // If language is not loaded, retrieve it then update.
        // If language is already loaded, update only.

        if (!p_languages[language]) {
            $.getJSON(config.path + language + config.ext).done(function(response) {
                p_languages[language] = response;
                updateLanguage();
            });
        } else {
            updateLanguage();
        }
    }

    /************************** General functions *****************************/

    function updateLanguage() {
        console.log('Language changed to ' + language);

        c.extend(c.data, {
            language: p_languages[language]
        });

        translate();
    }

    /**
     * Convert all text to localized language values
     * @return {[type]} [description]
     */
    function translate() {
        var elements = document.querySelectorAll('[data-localize]');

        for (var i = 0; i < elements.length; i++) {
            translateElement(elements[i]);
        }
    }

    function translateElement(element) {
        var key = element.getAttribute("data-localize");

        var text = getLocalizedText(key);

        if (text) {
            switch (element.tagName) {
                case 'INPUT':
                    element.value = text;
                    break;
                default:
                    element.innerHTML = text;
            }
        } else {
            return false;
        }
    }

    function getLocalizedText(key) {
        if (c.data.language[key]) {
            return c.data.language[key];
        } else {
            return false;
        }
    }

    /**
     * Wires up an element for localization
     * @param  {[type]} element The element to localize
     * @param  {[type]} key     The language key referencing the localized string to use on this element
     * @return {[type]}         The updated element
     */
    function localizeElement(element, key) {
        element.setAttribute('data-localize', key);
        translateElement(element);
        return element;
    }

    /************************** Function Mapping **************************/
    dmf.fn.localize = {
        changeLanguage: changeLanguage,
        localizeElement: localizeElement,
    };

    return {
        properties: properties,
        initialize: initialize,
        destroy: destroy,
    };
});
