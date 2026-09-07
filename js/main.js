/**
 * Pregnancy Due Date Calculator - Main Logic
 *
 * Date handling notes (IMPORTANT):
 * - All internal math works on calendar date strings "YYYY-MM-DD" and UTC
 *   midnights, so results are identical for every user regardless of browser
 *   timezone. Parsing "YYYY-MM-DD" with `new Date(...)` is timezone-dependent
 *   and caused one-day errors (e.g. users in the Americas saw dates one day
 *   early; users in UTC+ regions could not enter "today" as their LMP).
 * - "Today" is the user's local calendar date (what they see in the date
 *   picker), compared as whole calendar days.
 */

'use strict';

/* ------------------------------------------------------------------ */
/* Pure date helpers (no DOM dependency, safe to unit test in Node)    */
/* ------------------------------------------------------------------ */

var DAY_MS = 24 * 60 * 60 * 1000;

/** Local calendar date of "now" as YYYY-MM-DD (matches the <input type=date> picker). */
function localTodayKey() {
    var n = new Date();
    var y = n.getFullYear();
    var m = String(n.getMonth() + 1).padStart(2, '0');
    var d = String(n.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
}

/** Date object -> YYYY-MM-DD using UTC fields. */
function toDateKey(date) {
    return date.toISOString().split('T')[0];
}

/** dateKey "YYYY-MM-DD" plus a whole number of days -> "YYYY-MM-DD". */
function addDays(dateKey, days) {
    var t = Date.parse(dateKey + 'T00:00:00Z');
    return toDateKey(new Date(t + days * DAY_MS));
}

/** Whole calendar days from aKey to bKey (bKey - aKey). */
function diffDays(aKey, bKey) {
    return Math.round(
        (Date.parse(bKey + 'T00:00:00Z') - Date.parse(aKey + 'T00:00:00Z')) / DAY_MS
    );
}

/** Strict validity check for a YYYY-MM-DD string (rejects 2026-02-31 etc). */
function isValidDateKey(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var d = new Date(s + 'T00:00:00Z');
    return !isNaN(d.getTime()) && toDateKey(d) === s;
}

/** "2026-09-07" -> "September 7, 2026" (UTC-safe). */
function formatDateKey(dateKey) {
    return new Date(dateKey + 'T00:00:00Z').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    });
}

/* ------------------------------------------------------------------ */
/* Calculation core                                                    */
/* ------------------------------------------------------------------ */

/**
 * Build the shared result object.
 * @param {string} lmpKey   LMP date (YYYY-MM-DD)
 * @param {number} cycleLength  average cycle length in days
 */
function buildResult(lmpKey, cycleLength) {
    var today = localTodayKey();

    // Naegele's Rule: LMP + 280 days (40 weeks), adjusted for cycle length.
    var cycleDiff = (cycleLength || 28) - 28;
    var dueDate = addDays(lmpKey, 280 + cycleDiff);

    var daysPregnant = diffDays(lmpKey, today);   // can be negative (before LMP)
    var weeksPregnant = Math.max(0, Math.floor(daysPregnant / 7));
    var daysIntoWeek = daysPregnant > 0 ? daysPregnant % 7 : 0;
    var daysRemaining = Math.max(0, diffDays(today, dueDate));

    var trimester, trimesterDesc;
    if (daysPregnant < 0) {
        trimester = 'Pre-pregnancy';
        trimesterDesc = 'Your due date is calculated, but the calculation starts from your last period date, which is in the future.';
    } else if (weeksPregnant < 13) {
        trimester = 'First Trimester';
        trimesterDesc = 'Weeks 1-12. Your baby\'s major organs and body structures are forming. Morning sickness and fatigue are common.';
    } else if (weeksPregnant < 27) {
        trimester = 'Second Trimester';
        trimesterDesc = 'Weeks 13-26. Many women feel their best during this trimester. You may start feeling the baby move.';
    } else if (weeksPregnant < 40) {
        trimester = 'Third Trimester';
        trimesterDesc = 'Weeks 27-40. Your baby is growing rapidly. You may feel more tired and have frequent urination.';
    } else {
        trimester = 'Past Due Date';
        trimesterDesc = 'Your due date has passed. Contact your healthcare provider for next steps.';
    }

    return {
        dueDate: formatDateKey(dueDate),
        dueDateISO: dueDate,
        currentWeek: weeksPregnant,
        weekDetail: weeksPregnant + ' weeks ' + daysIntoWeek + ' days pregnant',
        daysRemaining: daysRemaining,
        trimester: trimester,
        trimesterDesc: trimesterDesc,
        isOverdue: daysPregnant >= 40 * 7
    };
}

/** LMP method. */
function calculateFromLMP(lmpDate, cycleLength) {
    return buildResult(lmpDate, parseInt(cycleLength, 10) || 28);
}

/** Conception method: conception occurs ~14 days after LMP. */
function calculateFromConception(conceptionDate) {
    var lmp = addDays(conceptionDate, -14);
    return buildResult(lmp, 28);
}

/**
 * IVF method.
 * Standard clinical practice (ASRM/ACOG): gestational age at transfer is
 * 2w3d (17 days) for a day-3 cleavage-stage embryo and 2w5d (19 days) for a
 * day-5 blastocyst. EDD therefore = transfer + 263 days (day 3) or
 * transfer + 261 days (day 5). Equivalently: LMP = transfer - 17 / - 19,
 * then apply Naegele's rule.
 */
function calculateFromIVF(ivfDate, embryoDay) {
    var gestAgeAtTransfer = embryoDay == 5 ? 19 : 17;
    var lmp = addDays(ivfDate, -gestAgeAtTransfer);
    return buildResult(lmp, 28);
}

/* ------------------------------------------------------------------ */
/* UI (only runs in the browser)                                       */
/* ------------------------------------------------------------------ */

function $(id) { return document.getElementById(id); }

function showMessage(msg) {
    var box = $('form-message');
    if (!box) { alert(msg); return; }
    box.textContent = msg;
    box.classList.remove('hidden');
}

function clearMessage() {
    var box = $('form-message');
    if (box) box.classList.add('hidden');
}

/** Returns a validated date key or an error string via showMessage. */
function readDate(inputId, label, options) {
    options = options || {};
    var el = $(inputId);
    var val = el ? el.value.trim() : '';
    if (!val) {
        showMessage('Please enter ' + label + '.');
        return null;
    }
    if (!isValidDateKey(val)) {
        showMessage('Please enter a valid date for ' + label + '.');
        return null;
    }
    if (diffDays(val, localTodayKey()) > 0) {
        showMessage('The date for ' + label + ' cannot be in the future.');
        return null;
    }
    if (options.minDaysAgo && diffDays(val, localTodayKey()) < -options.minDaysAgo) {
        showMessage('That date is too far in the past — please double-check ' + label + '.');
        return null;
    }
    return val;
}

function switchMethod(method) {
    ['lmp', 'conception', 'ivf'].forEach(function (m) {
        $('form-' + m).classList.add('hidden');
        var tab = $('tab-' + m);
        tab.classList.remove('text-primary', 'border-b-2', 'border-primary');
        tab.classList.add('text-gray-500');
    });

    $('form-' + method).classList.remove('hidden');
    var selectedTab = $('tab-' + method);
    selectedTab.classList.remove('text-gray-500');
    selectedTab.classList.add('text-primary', 'border-b-2', 'border-primary');
    clearMessage();
}

function displayResults(result) {
    $('results').classList.remove('hidden');
    $('result-due-date').textContent = result.dueDate;
    $('result-week').textContent = result.currentWeek;
    var detail = $('result-week-detail');
    if (detail) detail.textContent = result.weekDetail;
    $('result-days').textContent = result.daysRemaining;
    $('trimester-name').textContent = result.trimester;
    $('trimester-desc').textContent = result.trimesterDesc;

    clearMessage();
    var resultsEl = $('results');
    resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    resultsEl.setAttribute('tabindex', '-1');
    resultsEl.focus({ preventScroll: true });
}

function init() {
    if (!$('form-lmp')) return; // main.js only powers the homepage calculator

    var todayKey = localTodayKey();
    ['lmp-date', 'conception-date', 'ivf-date'].forEach(function (id) {
        $(id).setAttribute('max', todayKey);
    });

    $('form-lmp').addEventListener('submit', function (e) {
        e.preventDefault();
        clearMessage();
        var lmpDate = readDate('lmp-date', 'the first day of your last menstrual period');
        if (!lmpDate) return;
        var cycleLength = parseInt($('cycle-length').value, 10);
        if (isNaN(cycleLength) || cycleLength < 20 || cycleLength > 45) {
            showMessage('Please choose a cycle length between 20 and 45 days.');
            return;
        }
        displayResults(calculateFromLMP(lmpDate, cycleLength));
    });

    $('form-conception').addEventListener('submit', function (e) {
        e.preventDefault();
        clearMessage();
        var conceptionDate = readDate('conception-date', 'your conception date');
        if (!conceptionDate) return;
        displayResults(calculateFromConception(conceptionDate));
    });

    $('form-ivf').addEventListener('submit', function (e) {
        e.preventDefault();
        clearMessage();
        var ivfDate = readDate('ivf-date', 'your IVF transfer date');
        if (!ivfDate) return;
        var embryoDay = parseInt($('embryo-stage').value, 10);
        if (embryoDay !== 3 && embryoDay !== 5) {
            showMessage('Please select your embryo stage (day-3 or day-5 transfer).');
            return;
        }
        displayResults(calculateFromIVF(ivfDate, embryoDay));
    });

    // Bind tabs (HTML uses inline onclick="switchMethod(...)").
    ['tab-lmp', 'tab-conception', 'tab-ivf'].forEach(function (id) {
        var tab = $(id);
        if (tab) {
            tab.addEventListener('click', function () {
                switchMethod(id.replace('tab-', ''));
            });
        }
    });
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}
