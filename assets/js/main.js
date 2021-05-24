gtu.ready(function () {
    'use strict';
    search();
    buttons();
    forms();
});

function search() {
    'use strict';
    if (
        typeof gh_search_key == 'undefined' ||
        gh_search_key === '' ||
        typeof gh_search_migration == 'undefined'
    )
        return;

    var searchInput = gtu('.search-field');
    var searchButton = gtu('.search-button');
    var searchResult = gtu('.search-result');

    var url =
        siteUrl +
        '/ghost/api/v3/content/posts/?key=' +
        gh_search_key +
        '&limit=all&fields=id,title,excerpt,url,updated_at,visibility&order=updated_at%20desc&formats=plaintext';
    var indexDump = JSON.parse(localStorage.getItem('spin_search_index'));
    var index;

    elasticlunr.clearStopWords();

    localStorage.removeItem('spin_index');
    localStorage.removeItem('spin_last');

    function update(data) {
        data.posts.forEach(function (post) {
            index.addDoc(post);
        });

        localStorage.setItem('spin_search_index', JSON.stringify(index));
        localStorage.setItem('spin_search_last', data.posts[0].updated_at);
    }

    if (
        !indexDump ||
        gh_search_migration !== localStorage.getItem('spin_search_migration')
    ) {
        fetch(url)
            .then(function (data) {
                if (data.posts.length > 0) {
                    index = elasticlunr(function () {
                        this.addField('title');
                        this.addField('plaintext');
                        this.setRef('id');
                    });

                    update(data);

                    localStorage.setItem(
                        'spin_search_migration',
                        gh_search_migration
                    );
                }
            });
    } else {
        index = elasticlunr.Index.load(indexDump);

        fetch(url +
            "&filter=updated_at:>'" +
            localStorage
                .getItem('spin_search_last')
                .replace(/\..*/, '')
                .replace(/T/, ' ') +
            "'")
            .then(function (data) {
                if (data.posts.length > 0) {
                    update(data);
                }
            });
    }

    searchInput.on('keyup', function (e) {
        var result = index.search(e.target.value, {expand: true});
        var output = '';

        result.forEach(function (post) {
            output +=
                '<div class="search-result-row">' +
                '<a class="search-result-row-link" href="' +
                post.doc.url +
                '">' +
                '<div class="search-result-row-title">' +
                post.doc.title +
                '</div><div class="search-result-row-excerpt">' +
                post.doc.excerpt +
                '</div></a>' +
                '</div>';
        });

        searchResult.html(output);

        if (e.target.value.length > 0) {
            searchButton.addClass('search-button-clear');
        } else {
            searchButton.removeClass('search-button-clear');
        }
    });

    gtu('.search-form').on('submit', function (e) {
        e.preventDefault();
    });

    searchButton.on('click', function (event) {
        if (event.target.classList.contains('search-button-clear')) {
            searchInput.val('').focus().keyup();
        }
    });

    document.addEventListener('keyup', function (e) {
        if (e.keyCode === 27) {
            searchInput.val('').focus().keyup();
        }
    });
}

function addStyleElement(css) {
    var style = document.createElement('style');
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }

    document.getElementsByTagName('head')[0].appendChild(style);
}

function squashCss(css) {
    return css.trim().replace(/\s+/g, ' ');
}

function gradientBackground(color, options) {
    options.enableGradients = options.enableGradients || false;

    let css = `
    background-color: ${color};
    `
    if (options.enableGradients) {
        css += `
        background-image: var(--bs-gradient);
        `
    }
    return css;
}

function btnBoxShadow(options) {
    options = options || {};
    options.enableShadows = options.enableShadows || false;
    options.btnBoxShadow = options.btnBoxShadow || 'inset 0 1px 0 #ffffff, 0 1px 1px #000000';

    // FIXME: user is responsible for using 'none' correctly.
    if (options.enableShadows) {
        return `box-shadow: ${options.btnBoxShadow}`
    }
    return '';
}

function focusBoxShadow(shadow, color, border, options) {
    options = options || {};
    options.btnFocusWidth = options.btnFocusWidth || '.25rem';

    if (options.enableShadows) {
        return `box-shadow: ${shadow}  0 0 0 ${options.btnFocusWidth} ${rgba(mix(color, border, 15), .5)}`;
    } else {
        return `box-shadow: 0 0 0 ${options.btnFocusWidth}  ${rgba(mix(color, border, 15), .5)}`;
    }
}

function removeGradientIfEnabled(options) {
    options = options || {};

    if (options.enableGradients) {
        return `background-image: none;`
    }
    return '';
}

function buttonVariant(
    name,
    background,
    border,
    options
) {
    if (name.charAt(0) !== '.') {
        name = '.' + name;
    }

    /* config */
    options = options || {};
    options.colorContrastLight = options.colorContrastLight || '#ffffff';
    options.colorContrastDark = options.colorContrastDark || '#000000';
    options.minContrastRatio = options.minContrastRatio || 4.5;
    options.btnHoverBgShadeAmount = options.btnHoverBgShadeAmount || 15;
    options.btnHoverBgTintAmount = options.btnHoverBgTintAmount || 15;
    options.btnHoverBorderShadeAmount = options.btnHoverBorderShadeAmount || 20;
    options.btnHoverBorderTintAmount = options.btnHoverBorderTintAmount || 10;
    options.btnActiveBgShadeAmount = options.btnHoverBgShadeAmount || 20;
    options.btnActiveBgTintAmount = options.btnActiveBgTintAmount || 20;
    options.btnActiveBorderShadeAmount = options.btnActiveBorderShadeAmount || 25;
    options.btnActiveBorderTintAmount = options.btnActiveBorderTintAmount || 10;
    options.btnActiveBoxShadow = options.btnActiveBoxShadow || `inset 0 3px 5px ${rgba('#000000', .125)}`;

    options.enableGradients = options.enableGradients || false;
    options.enableShadows = options.enableShadows || false;

    options.color = options.color || colorContrast(background, options);

    if (!options.hoverBackground) {
        if (options.color === options.colorContrastLight) {
            options.hoverBackground = shade(background, options.btnHoverBgShadeAmount);
        } else {
            options.hoverBackground = tint(background, options.btnHoverBgTintAmount);
        }
    }

    if (!options.hoverBorder) {
        if (options.color === options.colorContrastLight) {
            options.hoverBorder = shade(border, options.btnHoverBorderShadeAmount);
        } else {
            options.hoverBorder = tint(border, options.btnHoverBgTintAmount);
        }
    }
    options.hoverColor = options.hoverColor || colorContrast(options.hoverBackground, options);

    if (!options.activeBackground) {
        if (options.color === options.colorContrastLight) {
            options.activeBackground = shade(background, options.btnActiveBgShadeAmount);
        } else {
            options.activeBackground = tint(background, options.btnActiveBorderTintAmount);
        }
    }

    if (!options.activeBorder) {
        if (options.color === options.colorContrastLight) {
            options.activeBorder = shade(border, options.btnActiveBorderShadeAmount);
        } else {
            options.activeBorder = tint(border, options.btnActiveBorderTintAmount);
        }
    }

    options.activeColor = options.activeColor || colorContrast(options.activeBackground, options);
    options.disabledBackground = background;
    options.disabledBorder = border;
    options.disabledColor = colorContrast(options.disabledBackground);

    //---
    let css = `
    ${name} {
        color: ${options.color};
        ${gradientBackground(background, options)}
        border-color: ${border};
        ${btnBoxShadow(options)}
    }
    
    ${name}:hover {
        color: ${options.hoverColor};
        ${gradientBackground(options.hoverBackground, options)};
        border-color: ${options.hoverBorder};
    }

    .btn-check:focus + ${name},
    ${name}:focus {
        color: ${options.hoverColor};
        ${gradientBackground(options.hoverBackground, options)};
        border-color: ${options.hoverBorder};
        ${focusBoxShadow(options.btnBoxShadow, options.color, border, options)};
    }

    .btn-check:checked + ${name},
    .btn-check:active + ${name},
    ${name}:active,
    ${name}.active,
    .show > ${name}.dropdown-toggle {
        color: ${options.activeColor};
        background-color: ${options.activeBackground};
        ${removeGradientIfEnabled(options)}
        border-color: ${options.activeBorder};
    }

    ${name}:focus {
        ${focusBoxShadow(options.activeBoxShadow, options.color, border, options)};
    }

    ${name}:disabled,
    ${name}.disabled {
        color: ${options.disabledColor};
        background-color: ${options.disabledBackground};
        ${removeGradientIfEnabled(options)}
        border-color: ${options.disabledBorder};
    }`;

    //---
    addStyleElement(squashCss(css));
}

function buttons() {
    var rootStyle = getComputedStyle(document.querySelector(':root'));
    var accentColor = rootStyle.getPropertyValue('--ghost-accent-color');
    buttonVariant('.btn-accent', accentColor, accentColor, {
        color: '#ffffff',
        hoverColor: '#ffffff'
    });
}

function forms() {
    /*
     * Enable forms that have a data-form-type attribute set to 'contact' by:
     * - append a hidden form element containing the customer api key (if not present).
     * - set the method attribute to 'POST'
     * - set the action to the /form endpoint
     * - set the redirect location (if not already present)
     */
    var formElements = document.querySelectorAll('form[data-form-type="contact"]');
    if (formElements.length > 0) {
        for (var i = 0; i < formElements.length; i++) {
            var formElement = formElements[i];

            if (!formElement.querySelector('input[name="api_key"]')) {
                var hiddenInputElement = document.createElement('input');
                hiddenInputElement.setAttribute('hidden', 'true');
                hiddenInputElement.setAttribute('name', 'api_key');
                hiddenInputElement.setAttribute('value', 'API_KEY');
                formElement.appendChild(hiddenInputElement);
            }

            if (!formElement.querySelector('input[name="location"]')) {
                var locationInputElement = document.createElement('input');
                locationInputElement.setAttribute('hidden', 'true');
                locationInputElement.setAttribute('name', 'location');
                locationInputElement.setAttribute('value', './#thank-you');
                formElement.appendChild(locationInputElement);
            }

            formElement.setAttribute('method', 'POST');
            formElement.setAttribute('action', 'https://api.mindspun.com/form');
        }
    }
}
