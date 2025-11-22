const FACTOR_NM_TO_FEET = 6076;
const FACTOR_M_TO_FEET = 3.28084;
const FACTOR_DEGREE_TO_NATO_MILS = 17.777778;
const MAXIMUM_MILS_SUPPORTED_BY_F4 = 245;
const WEIGHT_CORRECTION_THRESHOLD = 34200; 	//Weight correction has to be applied beyond this threshold as stated in 3rd_TFS_Conventional_Weapons_Planning_Guide

// --- TRANSVERSE MERCATOR PROJECTION ENGINE ---
const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;
const A = 6378137.0; // WGS84 Semi-major axis
const INV_F = 298.257223563; // WGS84 Inverse flattening

function tmerc(lat, lon, lon0, k0, x0, y0) {
    // Simplified Transverse Mercator Forward Projection
    const phi = lat * D2R;
    const lam = lon * D2R;
    const lam0 = lon0 * D2R;

    const f = 1 / INV_F;
    const e2 = 2 * f - f * f;
    const ep2 = e2 / (1 - e2);
    
    const N = A / Math.sqrt(1 - e2 * Math.pow(Math.sin(phi), 2));
    const T = Math.pow(Math.tan(phi), 2);
    const C = ep2 * Math.pow(Math.cos(phi), 2);
    const A_val = (lam - lam0) * Math.cos(phi);

    const M = A * ((1 - e2 / 4 - 3 * e2 * e2 / 64 - 5 * e2 * e2 * e2 / 256) * phi
        - (3 * e2 / 8 + 3 * e2 * e2 / 32 + 45 * e2 * e2 * e2 / 1024) * Math.sin(2 * phi)
        + (15 * e2 * e2 / 256 + 45 * e2 * e2 * e2 / 1024) * Math.sin(4 * phi)
        - (35 * e2 * e2 * e2 / 3072) * Math.sin(6 * phi));

    const x = k0 * N * (A_val + (1 - T + C) * Math.pow(A_val, 3) / 6
        + (5 - 18 * T + T * T + 72 * C - 58 * ep2) * Math.pow(A_val, 5) / 120) + x0;

    const y = k0 * (M + N * Math.tan(phi) * (A_val * A_val / 2
        + (5 - T + 9 * C + 4 * C * C) * Math.pow(A_val, 4) / 24
        + (61 - 58 * T + T * T + 600 * C - 330 * ep2) * Math.pow(A_val, 6) / 720)) + y0;

    return { x: x, y: y };
}

// Map Parameters (TODO: Add values for Germany CW)
// Credit to JonathanTurnock for these values. https://github.com/JonathanTurnock/dcs-projections
const MAP_DEFINITIONS = [
    { 
        name: "Caucasus",    
        latMin: 41, latMax: 46, lonMin: 37, lonMax: 47,   
        lon0: 33.0, k0: 0.9996, x0: -99516.9999999732, y0: -4998114.999999984 
    },
    { 
        name: "Nevada",      
        latMin: 34, latMax: 39, lonMin: -119, lonMax: -113, 
        lon0: -117.0, k0: 0.9996, x0: -193996.80999964548, y0: -4410028.063999966 
    },
    { 
        name: "PersianGulf", 
        latMin: 23, latMax: 32, lonMin: 53, lonMax: 60,   
        lon0: 57.0, k0: 0.9996, x0: 75755.99999999645, y0: -2894933.0000000377 
    },
    { 
        name: "Marianas",    
        latMin: 12, latMax: 21, lonMin: 143, lonMax: 147,  
        lon0: 147.0, k0: 0.9996, x0: 238417.99999989968, y0: -1491840.000000048 
    },
    { 
        name: "Syria",       
        latMin: 32, latMax: 38, lonMin: 34, lonMax: 43,   
        lon0: 39.0, k0: 0.9996, x0: 282801.00000003993, y0: -3879865.9999999935 
    },
    { 
        name: "Sinai",       
        latMin: 27, latMax: 32, lonMin: 30, lonMax: 36,   
        lon0: 33.0, k0: 0.9996, x0: 0, y0: 0 
    },
    { 
        name: "Normandy",    
        latMin: 48, latMax: 51, lonMin: -4, lonMax: 2,    
        lon0: -3.0, k0: 0.9996, x0: -195526.00000000204, y0: -5484812.999999951 
    },
    { 
        name: "Channel",     
        latMin: 50, latMax: 53, lonMin: -1, lonMax: 4,    
        lon0: 3.0, k0: 0.9996, x0: 99376.00000000288, y0: -5636889.00000001 
    },
    { 
        name: "Falklands",   
        latMin: -56, latMax: -47, lonMin: -70, lonMax: -50,  
        lon0: -57.0, k0: 0.9996, x0: 147639.99999997593, y0: 5815417.000000032 
    },
    { 
        name: "Kola",        
        latMin: 65, latMax: 72, lonMin: 20, lonMax: 42,   
        lon0: 33.0, k0: 0.9996, x0: 0, y0: 0 
    },
    { 
        name: "Afghanistan", 
        latMin: 28, latMax: 38, lonMin: 60, lonMax: 74,   
        lon0: 63.0, k0: 0.9996, x0: 0, y0: 0 
    },
    { 
        name: "Iraq",        
        latMin: 29, latMax: 38, lonMin: 39, lonMax: 49,   
        lon0: 45.0, k0: 0.9996, x0: 0, y0: 0 
    },
]

window.SetWeight = function SetWeight(updated_weight_lbs) { 
    const val = updated_weight_lbs.toFixed(0);
    $('#total_weight').val(val); 
    $('#perf_gross_weight').val(val);
    computePerf(); 
    computeSightDepression();
}

window.UpdateWeight = function UpdateWeight() {
    hb_send_proxy('UPDATE_WEIGHT');
}

window.SetLabsResult = function SetLabsResult(pull_up_timer_s) {
    $('#pull_up_timer').text(pull_up_timer_s);
}

window.SetLabsRange = function SetLabsRange(pullup_range_ft) {
    $('#pullup_range').text(pullup_range_ft);
}

window.SetCcrpResult = function SetCcrpResult(release_range_ft) {
    $('#release_range').text(release_range_ft);
}

window.SetDtResult = function SetDtResult(drag_coefficient) {
    $('#drag_coefficient').text(drag_coefficient);
}

window.SetTof = function SetTof(tof) {
    let formattedTof = parseFloat(tof).toFixed(2);
    if(isNaN(tof) || tof < 0) {
        formattedTof = '⚠️';
    }

    $('#time_of_flight').text(formattedTof);
}

window.SetBombRange = function SetBombRange(bombing_range) {
    $('#bomb_range').text(bombing_range);
}

window.SetOffsetResult = function SetOffsetResult(north_south_offset, east_west_offset) {
    if (north_south_offset < 0) {
        $('#northing_southing').text('S');
        $('#north_south').text(-north_south_offset);
    } else {
        $('#northing_southing').text('N');
        $('#north_south').text(north_south_offset);
    }
    if (east_west_offset < 0) {
        $('#easting_westing').text('W');
        $('#east_west').text(-east_west_offset);
    } else {
        $('#easting_westing').text('E');
        $('#east_west').text(east_west_offset);
    }
}

window.SetDirectResult = function SetDirectResult(sight_depression_direct) {
    const additional_weight_mils = ComputeWeightMilCorrection();
    const sight_depression_nato_mils = parseFloat(sight_depression_direct) * -FACTOR_DEGREE_TO_NATO_MILS + additional_weight_mils; //Negative because the degree we get from cpp is negative so we flip flop it around here
    let sight_depression_text = sight_depression_nato_mils.toFixed(0);

    if (sight_depression_nato_mils < 0
        || sight_depression_nato_mils > MAXIMUM_MILS_SUPPORTED_BY_F4
        || isNaN(sight_depression_nato_mils)
    ) {
        sight_depression_text = '⚠️';
    }
    $('#sight_depression_direct').text(sight_depression_text);
}

window.ComputeWeightMilCorrection = function ComputeWeightMilCorrection() {
	 //weight correction is +.7 per every 1k weight above 34.2 klbs
    const aircraft_weight = $('#total_weight').val();
    let additional_weight_mils = (aircraft_weight - WEIGHT_CORRECTION_THRESHOLD) / 1000 * 0.7;


    if(isNaN(additional_weight_mils)) {
        return 0;
    }
    return additional_weight_mils;
}

function computeMode() {
    const selectedMode = $('#delivery_mode').val();
    const bomb_type = $('#bomb_type option:selected').val();
    const run_in_altitude_ft = $('#run_in_alt').val();
    const ip_target_distance_ft = getIpTargetDistance();
    const run_in_speed_kt = $('#run_in_speed').val();
    const target_altitude_ft = $('#target_alt').val();
    const release_angle_deg = $('#release_angle').val();
    const inverted_release_angle_deg = (-(parseFloat(release_angle_deg) || 0)).toString();

    // Requires DCS specific code, logic is moved to C++ and results come back via SetXXXResult methods
    if (selectedMode === 'Direct') {
        hb_send_proxy('DIRECT',
            bomb_type,
            run_in_altitude_ft,
            run_in_speed_kt,
            ip_target_distance_ft,
            target_altitude_ft,
            inverted_release_angle_deg);
    } else if (selectedMode === 'DL' || selectedMode === 'L' || selectedMode === 'Offset') {
        hb_send_proxy('CCRP',
            bomb_type,
            run_in_altitude_ft,
            run_in_speed_kt,
            ip_target_distance_ft,
            target_altitude_ft,
            release_angle_deg);
    } else if (selectedMode === 'Loft' || selectedMode === 'O-S' || selectedMode === 'O-S-INST') {
        hb_send_proxy('LABS',
            bomb_type,
            run_in_altitude_ft,
            run_in_speed_kt,
            ip_target_distance_ft,
            target_altitude_ft,
            release_angle_deg);
    } else if (selectedMode === 'DT' || selectedMode === 'TGT-Find') {
        hb_send_proxy('DT',
            bomb_type,
            run_in_altitude_ft,
            run_in_speed_kt,
            ip_target_distance_ft,
            target_altitude_ft,
            release_angle_deg);
    } else if (selectedMode === 'TGT-Find') {
        hb_send_proxy('DT',
            bomb_type,
            run_in_altitude_ft,
            run_in_speed_kt,
            ip_target_distance_ft,
            target_altitude_ft,
            release_angle_deg);
    }
}

function transferTableToJester() {
    const delivery_mode = $('#delivery_mode').val();
    const target_alt = $('#target_alt').val();
    const dist_ip_tgt_ft = getIpTargetDistance();
    const release_range = $('#release_range').val();
    let drag_coefficient = $('#drag_coefficient').val();
    let pullup_timer = $('#pull_up_timer').val();
    const release_angle = $('#release_angle').val();
    let north_south_offset = $('#north_south').val();
    let east_west_offset = $('#east_west').val();
    const northing_southing = $('#northing_southing').val();
    const easting_westing = $('#easting_westing').val();

    if (northing_southing === 'S') {
        north_south_offset = '-' + north_south_offset;
    }
    if (easting_westing === 'W') {
        east_west_offset = '-' + east_west_offset;
    }

    if (drag_coefficient === '⚠️') {
        drag_coefficient = '1.00';
    } else if (pullup_timer === '⚠️') {
        pullup_timer = '0.00';
    }

    if (delivery_mode == 'L' || delivery_mode == 'DL') {
        hb_send_proxy('JESTER_TABLE',
            delivery_mode,
            drag_coefficient,
            release_range,
            dist_ip_tgt_ft,
            pullup_timer,
            release_angle);
    } else if (delivery_mode === 'Offset') {
        hb_send_proxy('JESTER_TABLE',
            delivery_mode,
            drag_coefficient,
            release_range,
            target_alt,
            north_south_offset,
            east_west_offset);
    } else if (delivery_mode === 'WRCS-AGM-45') {
        hb_send_proxy('WRCS_AGM', target_alt);
    } else {
        hb_send_proxy('JESTER_TABLE',
            delivery_mode,
            drag_coefficient,
            release_range,
            target_alt,
            pullup_timer,
            release_angle);
    }
}

function closeWindow() {
    hb_send_proxy('close'); 
}

function closeAndTellJester() {
    transferTableToJester();
    closeWindow();
}

function getIpTargetDistance() {
    const target_dist_unit = $('#dist_unit option:selected').val();
    let ip_target_distance_ft = $('#ip_target_dist').val();

    if (target_dist_unit === 'nm') {
        ip_target_distance_ft *= FACTOR_NM_TO_FEET;
        ip_target_distance_ft = Math.trunc(ip_target_distance_ft);
    }
    return ip_target_distance_ft;
}

function computeSightDepression() {
    // arctan(height/range) converted to nato mils = sight depression
    // + weight correction
    const target_range = getIpTargetDistance();
    const run_in_height = $('#run_in_alt').val();
    const tgt_alt = $('#target_alt').val();
    const additional_weight_mils = ComputeWeightMilCorrection();

    let height = run_in_height - tgt_alt;
    const sight_depression_mils = ((Math.atan(height / target_range) * 180) / Math.PI) * FACTOR_DEGREE_TO_NATO_MILS + additional_weight_mils;
    let sight_depression_text = sight_depression_mils.toFixed(0);

    if (sight_depression_mils > MAXIMUM_MILS_SUPPORTED_BY_F4 || isNaN(sight_depression_mils)) {
        sight_depression_text = '⚠️';
    }
    $('#sight_depression_laydown').text(sight_depression_text);
}

function computeRorSlantRange() {
    // ROR slant range  = sqrt(release range^2 + altitude^2)

    const release_range = $('#bomb_range').val();
    const release_altitude = $('#run_in_alt').val();
    const target_alt = $('#target_alt').val();

    let height = release_altitude - target_alt;

    const ror_slant_range = Math.sqrt(Math.pow(release_range, 2) + Math.pow(height, 2))
    let ror_slant_range_text = ror_slant_range.toFixed(0);

    if (isNaN(ror_slant_range)) {
        ror_slant_range_text = '⚠️';
    }
    $('#ror_slant_range').text(ror_slant_range_text);
}

function unitConverter() {
    const target_dist_unit = $('#dist_unit option:selected').val();

    const dist_input_field = $('#ip_target_dist');
    let dist = dist_input_field.val();

    if (target_dist_unit === 'nm') {
        dist /= FACTOR_NM_TO_FEET;
        dist = dist.toFixed(2);
        dist_input_field.attr('step', 0.10);
    } else {
        dist *= FACTOR_NM_TO_FEET;
        dist = dist.toFixed(0);
        dist_input_field.attr('step', 100);
    }

    dist_input_field.val(dist);
}

function targetLengthConverter() {
    const unit = $('#calc_tgt_len_unit option:selected').val();
    const inputField = $('#calc_tgt_len');
    let dist = inputField.val();

    if (unit === 'nm') {
        dist /= FACTOR_NM_TO_FEET;
        dist = dist.toFixed(2);
        inputField.attr('step', 0.01);
    } else {
        dist *= FACTOR_NM_TO_FEET;
        dist = dist.toFixed(0);
        inputField.attr('step', 10);
    }
}

function computePattern() {
    // interval * (bomb - 1)
    let interval_ms = $('#release_interval').val() * 1_000;
    const multiplier = $('#interval_multiplier option:selected').val();

    if (multiplier === 'x10') {
        interval_ms *= 10;
    }
    const bomb_number = $('#bomb_nr_on_target').val();
    const release_advance_ms = interval_ms * (bomb_number - 1);
    let release_advance_text = release_advance_ms;
    if (release_advance_ms >= 1000) {
        release_advance_text = '⚠️';
    }
    $('#release_advance').text(release_advance_text);
}

function computeOffset() {
    const bearing = $('#bearing').val();
    const ip_dist_tgt = getIpTargetDistance();

    let north_south_offset = ip_dist_tgt * Math.cos(bearing * D2R);
    let west_east_offset = ip_dist_tgt * Math.sin(bearing * D2R);
    SetOffsetResult(Math.trunc(north_south_offset), Math.trunc(west_east_offset));
}

function parseDCSString(coordStr) {
    if (!coordStr) return null;
    const regex = /([NS])\s*(\d+)[°\s]+(\d+)['\s]+([\d.]+)"?.*([EW])\s*(\d+)[°\s]+(\d+)['\s]+([\d.]+)"?/i;
    const match = coordStr.match(regex);
    if (!match) return null;
    let lat = parseFloat(match[2]) + parseFloat(match[3])/60 + parseFloat(match[4])/3600;
    if (match[1].toUpperCase() === 'S') lat *= -1;
    let lon = parseFloat(match[6]) + parseFloat(match[7])/60 + parseFloat(match[8])/3600;
    if (match[5].toUpperCase() === 'W') lon *= -1;
    const cleanStr = `${match[1].toUpperCase()} ${match[2]}°${match[3]}'${match[4]}" ${match[5].toUpperCase()} ${match[6]}°${match[7]}'${match[8]}"`;
    return { lat: lat, lon: lon, cleanStr: cleanStr };
}

window.computeOffsetFromCoords = function computeOffsetFromCoords() {
    const ipInput = $('#ip_coords');
    const tgtInput = $('#tgt_coords');
    const ipCoords = parseDCSString(ipInput.val());
    const tgtCoords = parseDCSString(tgtInput.val());
    if (!ipCoords || !tgtCoords) return;

    let lon0 = 0;
    let k0 = 0.9996; 
    let x0 = 0; 
    let y0 = 0;
    
    // Default calculation if no map matches
    lon0 = Math.floor((ipCoords.lon + 180) / 6) * 6 - 180 + 3;

    for (const map of MAP_DEFINITIONS) {
        if (ipCoords.lat >= map.latMin && ipCoords.lat <= map.latMax && 
            ipCoords.lon >= map.lonMin && ipCoords.lon <= map.lonMax) {
            
            lon0 = map.lon0;
            // Use map-specific projection parameters if available
            if (map.x0 !== undefined) x0 = map.x0;
            if (map.y0 !== undefined) y0 = map.y0;
            if (map.k0 !== undefined) k0 = map.k0;
            
            break;
        }
    }

    const ipProj = tmerc(ipCoords.lat, ipCoords.lon, lon0, k0, x0, y0);
    const tgtProj = tmerc(tgtCoords.lat, tgtCoords.lon, lon0, k0, x0, y0);
    const dNorthing = tgtProj.y - ipProj.y;
    const dEasting = tgtProj.x - ipProj.x;
    const ns_feet = dNorthing * FACTOR_M_TO_FEET;
    const ew_feet = dEasting * FACTOR_M_TO_FEET;

    SetOffsetResult(Math.trunc(ns_feet), Math.trunc(ew_feet));

    const total_dist_feet = Math.sqrt(ns_feet*ns_feet + ew_feet*ew_feet);
    let bearing_deg = Math.atan2(ew_feet, ns_feet) * R2D;
    if (bearing_deg < 0) bearing_deg += 360;

    const unit = $('#dist_unit').val();
    if (unit === 'nm') $('#ip_target_dist').val((total_dist_feet / FACTOR_NM_TO_FEET).toFixed(2));
    else $('#ip_target_dist').val(total_dist_feet.toFixed(0));
    $('#bearing').val(bearing_deg.toFixed(1));

    computeMode();
}

function cleanCoordInput(event) {
    const input = $(event.target);
    const val = input.val();
    const coords = parseDCSString(val);
    if (coords && coords.cleanStr !== val) input.val(coords.cleanStr);
}

// Helper for Visual Feedback
function flashSaveButton(btnSelector) {
    const btn = $(btnSelector);
    const originalText = btn.val();
    const originalBg = btn.css('background-color');
    const originalColor = btn.css('color');
    
    btn.val('Saved!');
    btn.css({
        'background-color': '#5897fb',
        'color': '#fafafa'
    });
    
    setTimeout(() => {
        btn.val(originalText);
        btn.css({
            'background-color': originalBg,
            'color': originalColor
        });
    }, 600);
}

// Helper function to manage categories
function addItemToSaved(category, itemHtml) {
    const container = $('#saved_container');
    const categoryId = 'saved-cat-' + category.toLowerCase().replace(/\s+/g, '-');
    
    // Check if category exists
    let catSection = $('#' + categoryId);
    
    if (catSection.length === 0) {
        // Create new category structure (Folder Tab Style)
        const html = `
            <div id="${categoryId}" class="saved-section">
                <div class="file-tab-header">${category}</div>
                <div class="file-folder-content">
                    <ol class="saved-list">
                    </ol>
                </div>
            </div>
        `;
        container.append(html);
        catSection = $('#' + categoryId);
    }
    
    // Duplicate Prevention logic simplified for new object-based approach:
    // Since we now have object keys, we append. If user saves exact same calc, it's a new entry.
    const list = catSection.find('.saved-list');
    list.append(itemHtml);
}

function saveCalculatedValues() {
    flashSaveButton('#save_last_button');

    // 1. Capture Full State
    const state = {
        delivery_mode: $('#delivery_mode').val(),
        offset_method: $('#offset_method').val(),
        bomb_type: $('#bomb_type').val(),
        run_in_speed: $('#run_in_speed').val(),
        run_in_alt: $('#run_in_alt').val(),
        ip_target_dist: $('#ip_target_dist').val(),
        dist_unit: $('#dist_unit').val(),
        bearing: $('#bearing').val(),
        ip_coords: $('#ip_coords').val(),
        tgt_coords: $('#tgt_coords').val(),
        target_alt: $('#target_alt').val(),
        total_weight: $('#total_weight').val(),
        release_angle: $('#release_angle').val()
    };

    // 2. Capture Current Calculated Display Values
    const pull_up_timer_last = $('#pull_up_timer').text();
    const release_range_last = $('#release_range').text();
    const ror_slant_range_last = $('#ror_slant_range').text();
    const time_of_flight_last = $('#time_of_flight').text();
    const north_south_offset_last = $('#north_south').text();
    const northing_southing_last = $('#northing_southing').text();
    const east_west_offset_last = $('#east_west').text();
    const easting_westing_last = $('#easting_westing').text();
    const drag_coefficient_last = $('#drag_coefficient').text();

    let infoText = '';
    
    if (state.delivery_mode === 'Direct') {
        const sight_depression_last = $('#sight_depression_direct').text();
        infoText = `${state.delivery_mode}, ${state.bomb_type} (Rel: ${state.run_in_alt}ft, TAS: ${state.run_in_speed}kts, ${state.release_angle}°):<br>&nbsp;&nbsp;↳ ${sight_depression_last}mils`;
    } else if (state.delivery_mode === 'DT') {
        infoText = `${state.delivery_mode}, ${state.bomb_type} (Rel: ${state.run_in_alt}ft, TAS: ${state.run_in_speed}kts, ${state.release_angle}°):<br>&nbsp;&nbsp;↳ c<sub>d</sub>: ${drag_coefficient_last}`;
    } else if (state.delivery_mode === 'TGT-Find') {
        infoText = `${state.delivery_mode}, ${state.bomb_type} (Rel: ${state.run_in_alt}ft, TAS: ${state.run_in_speed}kts, ${state.release_angle}°):<br>&nbsp;&nbsp;↳ c<sub>d</sub>: ${drag_coefficient_last}, ROR: ${ror_slant_range_last}ft, ToF: ${time_of_flight_last}s`;
    } else if (state.delivery_mode === 'DL' || state.delivery_mode === 'L') {
        const sight_depression_last = $('#sight_depression_laydown').text();
        infoText = `${state.delivery_mode}, ${state.bomb_type} (Rel: ${state.run_in_alt}ft, TAS: ${state.run_in_speed}kts):<br>&nbsp;&nbsp;↳ Release Range: ${release_range_last}ft, ${sight_depression_last}mils`;
    } else if (state.delivery_mode === 'Loft' || state.delivery_mode === 'O-S' || state.delivery_mode === 'O-S-INST') {
        infoText = `${state.delivery_mode}, ${state.bomb_type} (Rel: ${state.run_in_alt}ft, TAS: ${state.run_in_speed}kts, ${state.release_angle}°):<br>&nbsp;&nbsp;↳ Pull-up: ${pull_up_timer_last}s, Release Range: ${release_range_last}ft`;
    } else if (state.delivery_mode === 'Offset') {
        infoText = `${state.delivery_mode}, ${state.bomb_type} (Rel: ${state.run_in_alt}ft, TAS: ${state.run_in_speed}kts):<br>&nbsp;&nbsp;↳ Release Range: ${release_range_last}ft, ${north_south_offset_last}ft ${northing_southing_last}, ${east_west_offset_last}ft ${easting_westing_last}`;
    }
    
    // Create HTML with data-state attribute and buttons
    // We use JSON.stringify and encodeURIComponent to safely store the state in the attribute
    const stateString = encodeURIComponent(JSON.stringify(state));
    
    const itemHtml = `
        <li class="saved-item-row" data-state="${stateString}">
            <div class="saved-info">${infoText}</div>
            <div class="saved-actions">
                <button class="load-btn">LOAD</button>
                <button class="delete-btn">X</button>
            </div>
        </li>`;
    
    if(infoText) addItemToSaved("BOMBS", itemHtml);
}

function loadSavedState(stateStr) {
    try {
        const state = JSON.parse(decodeURIComponent(stateStr));
        
        // Set values
        $('#delivery_mode').val(state.delivery_mode).trigger('change');
        $('#offset_method').val(state.offset_method).trigger('change');
        $('#bomb_type').val(state.bomb_type).trigger('change');
        $('#run_in_speed').val(state.run_in_speed);
        $('#run_in_alt').val(state.run_in_alt);
        $('#dist_unit').val(state.dist_unit).trigger('change');
        
        // Wait a tick for unit change to propagate if needed, though synchronous calls usually fine
        $('#ip_target_dist').val(state.ip_target_dist);
        
        $('#bearing').val(state.bearing);
        $('#ip_coords').val(state.ip_coords);
        $('#tgt_coords').val(state.tgt_coords);
        $('#target_alt').val(state.target_alt);
        $('#total_weight').val(state.total_weight);
        $('#release_angle').val(state.release_angle);

        // Switch to BOMBS tab to see result
        $('.tab-btn[data-target="tab-bombs"]').click();

        // Trigger Recalculations
        computeMode();
        computeSightDepression();
        if(state.delivery_mode === 'Offset' && state.offset_method === 'lat_long') {
            window.computeOffsetFromCoords();
        } else if (state.delivery_mode === 'Offset') {
            computeOffset();
        }
        computeRorSlantRange();

    } catch (e) {
        console.error("Failed to load saved state", e);
    }
}

function saveRadarValues() {
    flashSaveButton('#radar_save_btn');
    
    const delta = parseFloat($('#radar_delta_alt').val()) || 0;
    const range = $('#radar_tgt_range').val();
    const elev = $('#radar_elev_angle').text();
    
    const state = {delta, range};
    const stateString = encodeURIComponent(JSON.stringify(state));

    const itemHtml = `
        <li class="saved-item-row" data-radar-state="${stateString}">
            <div class="saved-info">Target Altitude Δ: ${delta}ft, Range: ${range}nm<br>&nbsp;&nbsp;↳ AEA: ${elev}</div>
            <div class="saved-actions">
                <button class="load-btn radar-load">LOAD</button>
                <button class="delete-btn">X</button>
            </div>
        </li>`;
    addItemToSaved("RADAR", itemHtml);
}

function savePerfValues() {
    flashSaveButton('#perf_save_btn');
    
    const f = $('#perf_fuel_qty').val();
    const flow = $('#perf_fuel_flow').val();
    const tas = $('#perf_tas').val();
    const weight = $('#perf_gross_weight').val();
    
    const time = $('#perf_curr_endurance').text();
    const range = $('#perf_curr_range').text();
    
    const state = { f, flow, tas, weight };
    const stateString = encodeURIComponent(JSON.stringify(state));

    const itemHtml = `
        <li class="saved-item-row" data-perf-state="${stateString}">
            <div class="saved-info">Fuel: ${f}lbs, FF ${flow}lbs/hr, TAS: ${tas}kts<br>&nbsp;&nbsp;↳ Time: ${time}, Range: ${range}nm</div>
            <div class="saved-actions">
                <button class="load-btn perf-load">LOAD</button>
                <button class="delete-btn">X</button>
            </div>
        </li>`;
    addItemToSaved("PERFORMANCE", itemHtml);
}

function clearRadarValues() {
    $('#radar_delta_alt').val('0');
    $('#radar_tgt_range').val('50');
    computeRadarElevation();
}

function clearPerfValues() {
    $('#perf_gross_weight').val('45142');
    $('#perf_fuel_qty').val('12000');
    $('#perf_fuel_flow').val('5000');
    $('#perf_tas').val('450');
    computePerf();
}

function clearSavedValues() {
    $('#saved_container').empty();
}

function transferPatternToJester() {
    const release_advance = $('#release_advance').val();
    hb_send_proxy('JESTER_PATTERN', release_advance);
}


function computeRequiredInterval() {
    let lengthNm = parseFloat($('#calc_tgt_len').val()) || 0;
    const lenUnit = $('#calc_tgt_len_unit option:selected').val();
    
    if (lenUnit === 'ft') {
        lengthNm = lengthNm / FACTOR_NM_TO_FEET;
    }

    const speedKts = parseFloat($('#run_in_speed').val()) || 450;
    const bombCount = parseInt($('#calc_release_qty').val()) || 1;
    const mode = $('#delivery_mode').val();
    
    // Only use Dive Angle if relevant, otherwise assume Level Flight (0 deg)
    let diveAngleDeg = 0;
    if (mode === 'Direct' || mode === 'DT' || mode == 'TGT-Find' || mode === 'Loft' || mode === 'O-S' || mode === 'O-S-INST') {
        diveAngleDeg = parseFloat($('#release_angle').val()) || 0;
    }

    // Safety check
    if (lengthNm <= 0 || bombCount <= 1) {
        $('#calc_req_interval').text("0.00");
        return;
    }

    const lengthFt = lengthNm * FACTOR_NM_TO_FEET;
    const speedFps = (speedKts * 1.68781) * Math.cos(diveAngleDeg * D2R);

    // Prevent divide by zero
    if (speedFps <= 0.1) {
        $('#calc_req_interval').text("0.00");
        return;
    }

    const distPerBomb = lengthFt / (bombCount - 1);
    const intervalSec = distPerBomb / speedFps;

    $('#calc_req_interval').text(intervalSec.toFixed(2));
}

function applyCalculatedInterval() {
    const calculated = parseFloat($('#calc_req_interval').text());

    if (!isNaN(calculated) && calculated > 0) {
        // If interval > 1.0s, use x10 multiplier and divide input by 10
        if (calculated > 1.0) {
            $('#interval_multiplier').val('x10').trigger('change');
            $('#release_interval').val((calculated / 10).toFixed(2)).trigger('change');
        } else {
            // Otherwise ensure Norm multiplier and use value directly
            $('#interval_multiplier').val('norm').trigger('change');
            $('#release_interval').val(calculated).trigger('change');
        }
        
        // Visual feedback
        $('#release_interval, #interval_multiplier').css('background-color', '#5897fb');
        setTimeout(() => {
            $('#release_interval, #interval_multiplier').css('background-color', '');
        }, 300);
    }
}

// May be needed for future features. TBD.
/* function getAtmosphere(altFt) {
    // Simple troposphere model (<36k ft)
    const T0 = 288.15; // SL Temp Kelvin
    const P0 = 101325; // SL Pressure Pa
    const L = 0.0065;  // Lapse rate K/m
    const h = altFt * 0.3048; // Alt in meters
    
    let T = T0 - L * h;
    if (altFt > 36089) T = 216.65; // Stratosphere temp constant
    
    const theta = T / T0; // Temp ratio
    // Speed of sound (knots)
    const a = 661.47 * Math.sqrt(theta);
    
    // Density ratio (sigma) approx for TAS
    // Sigma = (T/T0)^(4.256) approx
    // Better: TAS approx CAS / sqrt(sigma)
    // Sigma = (1 - 6.875e-6 * alt_ft)^4.256
    let sigma = Math.pow(1 - 6.8755e-6 * altFt, 4.2558);
    if (altFt > 36089) {
        // Stratosphere density model differs, simple fallback
        sigma = 0.297 * Math.exp(-(altFt - 36089)/20806); 
    }

    return { a, sigma };
}

function getTasFromCas(cas, alt) {
    const { sigma } = getAtmosphere(alt);
    return cas / Math.sqrt(sigma);
}

function getMachFromCas(cas, alt) {
    const { a, sigma } = getAtmosphere(alt);
    const tas = cas / Math.sqrt(sigma);
    return tas / a;
}

function getCasFromMach(mach, alt) {
    const { a, sigma } = getAtmosphere(alt);
    const tas = mach * a;
    return tas * Math.sqrt(sigma);
} */

function computeRadarElevation() {
    const deltaAlt = parseFloat($('#radar_delta_alt').val()) || 0;
    const rangeNm = parseFloat($('#radar_tgt_range').val()) || 5;
    
    const rangeFt = rangeNm * FACTOR_NM_TO_FEET;
    
    const angleRad = Math.atan(deltaAlt / rangeFt);
    const angleDeg = angleRad * (180 / Math.PI);
    
    if (angleDeg > 60) {
        $('#radar_elev_angle').text('> 60° ⚠️')
    } else if (angleDeg < -60) {
        $('#radar_elev_angle').text('< -60° ⚠️')
    } else {
        $('#radar_elev_angle').text(angleDeg.toFixed(1) + '°');
    }
}

function computePerf() {
    const fuel = parseFloat($('#perf_fuel_qty').val()) || 0;
    const flow = parseFloat($('#perf_fuel_flow').val()) || 1; 
    const gs = parseFloat($('#perf_tas').val()) || 0;
    const weight = parseFloat($('#perf_gross_weight').val()) || 30000;

    const enduranceHours = fuel / flow;
    const hours = Math.floor(enduranceHours);
    const minutes = Math.floor((enduranceHours - hours) * 60);
    const timeStr = String(hours) + 'hr' + String(minutes).padStart(2, '0');
    const range = enduranceHours * gs;
    
    $('#perf_curr_endurance').text(timeStr);
    $('#perf_curr_range').text(range.toFixed(0));

    const baseSpeed = 135;
    const baseWeight = 30000;
    let approachSpeed = baseSpeed + ((weight - baseWeight) / 1000) * 2;
    if (approachSpeed < 120) approachSpeed = 120; 
    $('#perf_landing_speed').text(approachSpeed.toFixed(0));
}

function toggleCollapse(e) {
    const header = $(this);
    const content = header.next('.collapsible-content');
    header.toggleClass('collapsed');
    content.slideToggle(200);
}

$(document).ready(function () {
    $('select').select2();
    
    // Mode switching UI
    function updateUI() {
        const mode = $('#delivery_mode').val();
        $('.jqueryOptions').hide().removeClass('current-opt');
        $(`.${mode}`).show().addClass('current-opt');
        
        if (mode === 'Offset') {
            if ($('#offset_method').val() === 'lat_long') {
                $('.dist-brg-group').addClass('force-hide');
                $('.lat-long-group').closest('tr').show();
            } else {
                $('.dist-brg-group').removeClass('force-hide');
                $('.lat-long-group').closest('tr').hide();
            }
        }
    }
    
    // Tab Switching Logic
    $('.tab-btn').click(function() {
        $('.tab-btn').removeClass('active');
        $(this).addClass('active');
        $('.tab-content').hide();
        const targetId = $(this).data('target');
        $('#' + targetId).show();
    });

    // Clear Button Logic (Generic X buttons)
    $('.clear-btn').click(function() {
        const targetId = $(this).data('target');
        $('#' + targetId).val('').trigger('input');
    });

    $('#delivery_mode, #offset_method').change(updateUI);
    updateUI();

    // Event Listeners
    $('#erase_button').click(() => { computeSightDepression(); computeMode(); });
    $('#save_last_button').click(saveCalculatedValues);
    $('#transfer_to_jester').click(transferTableToJester);
    $('#transfer_pattern_to_jester').click(transferPatternToJester);
    $('#closeWindow').click(closeWindow);
    $('#transfer_to_jester_and_close').click(closeAndTellJester);
    $('#update_weight').click(window.UpdateWeight);
    $('#update_weight_perf').click(window.UpdateWeight);

    $('#bomb_type, #run_in_alt, #run_in_speed, #ip_target_dist, #target_alt, #release_angle, #total_weight, #delivery_mode').on('input change', function() {
        computeMode();
        computeSightDepression();
    });

    $('#bearing, #ip_target_dist').change(computeOffset);
    $('#release_interval, #interval_multiplier, #bomb_nr_on_target').change(computePattern);
    $('#run_in_speed, #bomb_range, #run_in_alt, #target_alt').change(computeRorSlantRange);
    $('#dist_unit').change(unitConverter);
    $('.coord-change').on('input', window.computeOffsetFromCoords);
    $('.coord-change').change(cleanCoordInput);
    
    $('#radar_delta_alt, #radar_tgt_range').on('input change', computeRadarElevation);
    $('#perf_fuel_qty, #perf_fuel_flow, #perf_tas, #perf_gross_weight').on('input change', computePerf);

    $('#calc_tgt_len, #calc_release_qty, #run_in_speed, #release_angle, #delivery_mode').on('input change', computeRequiredInterval);
    $('#calc_tgt_len_unit').change(function() {
        targetLengthConverter();
        computeRequiredInterval();
    });
    $('#apply_interval_btn').click(applyCalculatedInterval);

    $('#radar_save_btn').click(saveRadarValues);
    $('#radar_clear_btn').click(clearRadarValues);
    $('#perf_save_btn').click(savePerfValues);
    $('#perf_clear_btn').click(clearPerfValues);
    $('#saved_clear_btn').click(clearSavedValues);
    
    // Listeners for Dynamic Load/Delete buttons in Saved List
    $('#saved_container').on('click', '.delete-btn', function() {
        const li = $(this).closest('li');
        const list = li.parent(); // Get the <ol> or <ul>
        
        li.remove();
        
        // Check if the list is now empty
        if (list.children().length === 0) {
            // Remove the entire section (header + content)
            list.closest('.saved-section').remove();
        }
    });

    $('#saved_container').on('click', '.load-btn', function() {
        const li = $(this).closest('li');
        
        // Handle Bomb Loads
        if (li.data('state')) {
            loadSavedState(li.data('state'));
        } 
        // Handle Radar Loads
        else if (li.data('radar-state')) {
            try {
                const state = JSON.parse(decodeURIComponent(li.data('radar-state')));
                $('#radar_delta_alt').val(state.delta);
                $('#radar_tgt_range').val(state.range).trigger('change');
                $('.tab-btn[data-target="tab-radar"]').click();
            } catch(e) {}
        }
        // Handle Perf Loads
        else if (li.data('perf-state')) {
            try {
                const state = JSON.parse(decodeURIComponent(li.data('perf-state')));
                $('#perf_fuel_qty').val(state.f);
                $('#perf_fuel_flow').val(state.flow);
                $('#perf_tas').val(state.tas);
                $('#perf_gross_weight').val(state.weight).trigger('change');
                $('.tab-btn[data-target="tab-perf"]').click();
            } catch(e) {}
        }
    });

    $('.collapsible-header').click(toggleCollapse);
    
    computeRadarElevation();
    computePerf();
    computeRequiredInterval();
});