/*
 * Copyright 2023 Heatblur Simulations. All rights reserved.
 *
 */

const FACTOR_NM_TO_FEET = 6076;
const FACTOR_DEGREE_TO_NATO_MILS = 17.777778;
const MAXIMUM_MILS_SUPPORTED_BY_F4 = 245;
const WEIGHT_CORRECTION_THRESHOLD = 34200; 	//Weight correction has to be applied beyond this threshold as stated in 3rd_TFS_Conventional_Weapons_Planning_Guide


window.SetWeight = function SetWeight(updated_weight_lbs) { //We get the actual a/c weight from cpp in lb
    $('#total_weight').val(updated_weight_lbs.toFixed(0));
}

window.UpdateWeight = function UpdateWeight() {
    hb_send_proxy('UPDATE_WEIGHT');
}

window.SetLabsResult = function SetLabsResult(pull_up_timer_s) {
    $('#pull_up_timer').text(pull_up_timer_s);
};

window.SetLabsRange = function SetLabsRange(pullup_range_ft) {
    $('#pullup_range').text(pullup_range_ft);
};

window.SetCcrpResult = function SetCcrpResult(release_range_ft) {
    $('#release_range').text(release_range_ft);
};

window.SetDtResult = function SetDtResult(drag_coefficient) {
    $('#drag_coefficient').text(drag_coefficient);
};

window.SetTof = function SetTof(tof) {
    let formattedTof = parseFloat(tof).toFixed(2);
    if(isNaN(tof) || tof < 0) {
        formattedTof = '⚠️';
    }

    $('#time_of_flight').text(formattedTof);
};

window.SetBombRange = function SetBombRange(bombing_range) {
    $('#bomb_range').text(bombing_range);
};

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
};

window.SetDirectResult = function SetDirectResult(sight_depression_direct) {
    const additional_weight_mils = ComputeWeightMilCorrection();
    const sight_depression_nato_mils = parseFloat(sight_depression_direct) * -FACTOR_DEGREE_TO_NATO_MILS + additional_weight_mils; //Negative because the degree we get from cpp is negative so we flip flop it around here
    let sight_depression_text = sight_depression_nato_mils.toFixed(0);

    if (sight_depression_nato_mils < 0
        || sight_depression_nato_mils > MAXIMUM_MILS_SUPPORTED_BY_F4
        || isNaN(sight_depression_nato_mils)
    ) {
        sight_depression_text = '⚠️';
        $('#sight_depression_direct').text(sight_depression_text);
    } else {
        $('#sight_depression_direct').text(sight_depression_text);
    }
};

window.ComputeWeightMilCorrection = function ComputeWeightMilCorrection() {
	 //weight correction is +.7 per every 1k weight above 34.2 klbs
    const aircraft_weight = $('#total_weight').val();
    let additional_weight_mils = (aircraft_weight - WEIGHT_CORRECTION_THRESHOLD) / 1000 * 0.7;


    if(isNaN(additional_weight_mils)) {
        return 0;
    }
    return additional_weight_mils;
};

function computeMode() {
    const selectedMode = $('#delivery_mode').val();
    const bomb_type = $('#bomb_type option:selected').val();
    const run_in_altitude_ft = $('#run_in_alt').val();
    const ip_target_distance_ft = getIpTargetDistance();
    const run_in_speed_kt = $('#run_in_speed').val();
    const target_altitude_ft = $('#target_alt').val();
    const loft_angle_deg = $('#loft_angle').val();
    const dive_angle_deg = $('#dive_angle').val();
    const tgt_find_angle_deg = '0';

    // Requires DCS specific code, logic is moved to C++ and results come back via SetXXXResult methods
    if (selectedMode === 'Direct') {
        hb_send_proxy('DIRECT',
            bomb_type,
            run_in_altitude_ft,
            run_in_speed_kt,
            ip_target_distance_ft,
            target_altitude_ft,
            dive_angle_deg);
    } else if (selectedMode === 'DL' || selectedMode === 'L' || selectedMode === 'Offset') {
        hb_send_proxy('CCRP',
            bomb_type,
            run_in_altitude_ft,
            run_in_speed_kt,
            ip_target_distance_ft,
            target_altitude_ft,
            loft_angle_deg);
    } else if (selectedMode === 'Loft' || selectedMode === 'O-S' || selectedMode === 'O-S-INST') {
        hb_send_proxy('LABS',
            bomb_type,
            run_in_altitude_ft,
            run_in_speed_kt,
            ip_target_distance_ft,
            target_altitude_ft,
            loft_angle_deg);
    } else if (selectedMode === 'DT') {
        hb_send_proxy('DT',
            bomb_type,
            run_in_altitude_ft,
            run_in_speed_kt,
            ip_target_distance_ft,
            target_altitude_ft,
            dive_angle_deg);
    } else if (selectedMode === 'TGT-Find') {
        hb_send_proxy('DT',
            bomb_type,
            run_in_altitude_ft,
            run_in_speed_kt,
            ip_target_distance_ft,
            target_altitude_ft,
            tgt_find_angle_deg);
        // In TGT-Find we want the drag coeff too but with 0 deg dive angle | Calc is exactly same with DT
    }
}

function transferTableToJester() {
    const delivery_mode = $('#delivery_mode').val();
    const target_alt = $('#target_alt').val();
    const dist_ip_tgt_ft = getIpTargetDistance();
    const release_range = $('#release_range').val();
    let drag_coefficient = $('#drag_coefficient').val();
    let pullup_timer = $('#pull_up_timer').val();
    const loft_angle = $('#loft_angle').val();
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

    if (delivery_mode === 'L' || delivery_mode === 'DL') {
        hb_send_proxy('JESTER_TABLE',
            delivery_mode,
            drag_coefficient,
            release_range,
            dist_ip_tgt_ft,
            pullup_timer,
            loft_angle);
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
            loft_angle);
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
        return ip_target_distance_ft;
    } else {
        return ip_target_distance_ft;
    }
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
        dist_input_field.attr('step', 0.1);
    } else {
        dist *= FACTOR_NM_TO_FEET;
        dist = dist.toFixed(0);
        dist_input_field.attr('step', 100);
    }

    dist_input_field.val(dist);
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

    let north_south_offset = ip_dist_tgt * Math.cos((bearing * Math.PI) / 180);
    let west_east_offset = ip_dist_tgt * Math.sin((bearing * Math.PI) / 180);
    north_south_offset = Math.trunc(north_south_offset);
    west_east_offset = Math.trunc(west_east_offset);

    SetOffsetResult(north_south_offset, west_east_offset);
}
function saveCalculatedValues() {
    const delivery_mode_last = $('#delivery_mode').val();
    const bomb_type_last = $('#bomb_type').val();
    const run_in_alt_last = $('#run_in_alt').val();
    const run_in_speed_last = $('#run_in_speed').val();
    const pull_up_timer_last = $('#pull_up_timer').val();
    const release_range_last = $('#release_range').val();
    const north_south_offset_last = $('#north_south').val();
    const northing_southing_last = $('#northing_southing').val();
    const east_west_offset_last = $('#east_west').val();
    const easting_westing_last = $('#easting_westing').val();

    const drag_coefficient_last = $('#drag_coefficient').val();

    if (delivery_mode_last === 'Direct') {
        const sight_depression_last = $('#sight_depression_direct').val();
        $('#bombing_solutions_list').append(
            '<li>'
            + delivery_mode_last + ' , '
            + bomb_type_last
            + ' (' + run_in_alt_last + 'ft, '
            + run_in_speed_last + 'kts): '
            + sight_depression_last + 'mils '
            + '</li>'
        );
    } else if (delivery_mode_last === 'DT') {
        $('#bombing_solutions_list').append(
            '<li>'
            + delivery_mode_last + ' , '
            + bomb_type_last + ' ('
            + run_in_alt_last + 'ft, '
            + run_in_speed_last + 'kts): '
            + drag_coefficient_last
            + '</li>'
        );
    } else if (delivery_mode_last === 'DL' || delivery_mode_last === 'L') {
        const sight_depression_last = $('#sight_depression_laydown').val();
        $('#bombing_solutions_list').append(
            '<li>'
            + delivery_mode_last + ' , '
            + bomb_type_last + ' ('
            + run_in_alt_last + 'ft, '
            + run_in_speed_last + 'kts): '
            + release_range_last + 'ft, '
            + sight_depression_last + 'mils '
            + '</li>'
        );
    } else if (delivery_mode_last === 'Loft' || delivery_mode_last === 'O-S' || delivery_mode_last === 'O-S-INST') {
        $('#bombing_solutions_list').append(
            '<li>'
            + delivery_mode_last + ' , '
            + bomb_type_last + ' ('
            + run_in_alt_last + 'ft, '
            + run_in_speed_last + 'kts): '
            + pull_up_timer_last + 'sec, '
            + release_range_last + 'ft, '
            + '</li>'
        );
    } else if (delivery_mode_last === 'Offset') {
        $('#bombing_solutions_list').append(
            '<li>'
            + delivery_mode_last + ' , '
            + bomb_type_last + ' ('
            + run_in_alt_last + 'ft, '
            + run_in_speed_last + 'kts): '
            + release_range_last + 'ft, '
            + north_south_offset_last + ' ft '
            + northing_southing_last + ', '
            + east_west_offset_last + ' ft '
            + easting_westing_last
            + '</li>'
        );
    }
}

function transferPatternToJester() {
    const release_advance = $('#release_advance').val();
    hb_send_proxy('JESTER_PATTERN', release_advance);
}

$(function changeOptions() {
    $('.jqueryOptions').hide();

    $('#delivery_mode').change(function () {
        $('.jqueryOptions').slideUp();
        $('.jqueryOptions').removeClass('current-opt');
        $('.' + $(this).val()).slideDown();
        $('.' + $(this).val()).addClass('current-opt');
    });
});

$(document).ready(function () {
    $('select').select2();

    $('#delivery_mode').load('change', function () {
        $('.jqueryOptions').slideUp();
        $('.jqueryOptions').removeClass('current-opt');
        $('.' + $(this).val()).slideDown();
        $('.' + $(this).val()).addClass('current-opt');
    });

    $('#erase_button').click(function () {
        computeSightDepression();
        computeMode();
    });
    $('#save_last_button').click(function () {
        saveCalculatedValues();
    });
    $('#transfer_to_jester').click(function () {
        transferTableToJester();
    });
    $('#transfer_pattern_to_jester').click(function () {
        transferPatternToJester();
    });
    $('#closeWindow').click(function () {
        closeWindow();
    });
    $('#transfer_to_jester_and_close').click(function () {
        closeAndTellJester();
    });
    $('#update_weight').click(function (){
        UpdateWeight();

    });

    $('#bomb_type, #run_in_alt, #run_in_speed, #ip_target_dist, #target_alt, #loft_angle, #dive_angle, #total_weight').change(computeMode);
    $('#bearing, #ip_target_dist').change(computeOffset);
    $('#release_interval, #interval_multiplier, #bomb_nr_on_target').change(computePattern);
    $('#ip_target_dist, #run_in_alt, #target_alt, #run_in_speed, #run_in_alt, #total_weight').change(computeSightDepression);
    $('#run_in_speed, #bomb_range, #run_in_alt, #target_alt').change(computeRorSlantRange);
    $('#dist_unit').change(unitConverter);
});
