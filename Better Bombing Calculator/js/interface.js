/*
 * Copyright 2023 Heatblur Simulations. All rights reserved.
 *
 */

function hb_send_proxy(mode, arg2, arg3, arg4, arg5, arg6, arg7) {
    if (typeof hb_send === 'function' && (mode === 'CCRP' || mode === 'DT' || mode === 'LABS' || mode === 'DIRECT')) {
        hb_send(mode, arg2, arg3, arg4, arg5 + '', arg6, arg7);
    } else if (typeof hb_send === 'function' && mode === 'JESTER_PATTERN') {
        hb_send(mode, arg2);
    } else if (typeof hb_send === 'function' && mode === 'JESTER_TABLE') {
        hb_send(mode, arg2, arg3, arg4, arg5 + '', arg6, arg7);
    } else if (typeof hb_send === 'function' && mode === 'close') {
        hb_send(mode);
    } else if(typeof  hb_send === 'function' && mode === 'WRCS_AGM') {
        hb_send(mode, arg2)
    } else if(typeof hb_send === 'function' && mode === 'UPDATE_WEIGHT') {
        hb_send(mode);
    } else {
        console.log(
            `Mode: ${mode}, Type: ${arg2}, Alt: ${arg3}, Speed: ${arg4}, Dist: ${arg5}, Tgt Alt: ${arg6}, Loft: ${arg7}`
        );
    }
}

window.setTheme = function setTheme(theme) {
    const current_theme = theme === 'dark' ? 'light' : 'dark';
    $('html').removeClass(current_theme).addClass(theme);
};
