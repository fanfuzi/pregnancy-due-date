/**
 * Pregnancy Due Date Calculator - Main Logic
 */

// Naegele's Rule: LMP + 280 days (40 weeks)
// Adjust based on cycle length
function calculateFromLMP(lmpDate, cycleLength) {
    const lmp = new Date(lmpDate);
    // Standard pregnancy is 280 days, but if cycle is longer/shorter, adjust
    const cycleDiff = cycleLength - 28;
    const adjustedDays = 280 + cycleDiff;
    
    const dueDate = new Date(lmp);
    dueDate.setDate(dueDate.getDate() + adjustedDays);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate current week
    const diffTime = today - lmp;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeksPregnant = Math.floor(diffDays / 7);
    const daysRemaining = Math.max(0, Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)));

    // Determine trimester
    let trimester, trimesterDesc;
    if (weeksPregnant < 0) {
        trimester = "Pre-pregnancy";
        trimesterDesc = "Your due date is calculated, but you haven't reached your last period date yet.";
    } else if (weeksPregnant < 13) {
        trimester = "First Trimester";
        trimesterDesc = "Weeks 1-12. Your baby's major organs and body structures are forming. Morning sickness and fatigue are common.";
    } else if (weeksPregnant < 27) {
        trimester = "Second Trimester";
        trimesterDesc = "Weeks 13-26. Many women feel their best during this trimester. You may start feeling the baby move.";
    } else if (weeksPregnant < 40) {
        trimester = "Third Trimester";
        trimesterDesc = "Weeks 27-40. Your baby is growing rapidly. You may feel more tired and have frequent urination.";
    } else {
        trimester = "Past Due Date";
        trimesterDesc = "Your due date has passed. Contact your healthcare provider for next steps.";
    }

    return {
        dueDate: dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        dueDateISO: dueDate.toISOString().split('T')[0],
        currentWeek: Math.max(0, weeksPregnant),
        daysRemaining: daysRemaining,
        trimester: trimester,
        trimesterDesc: trimesterDesc,
        isOverdue: weeksPregnant >= 40
    };
}

function calculateFromConception(conceptionDate) {
    // Conception typically occurs ~14 days after LMP
    const conception = new Date(conceptionDate);
    const lmp = new Date(conception);
    lmp.setDate(lmp.getDate() - 14);
    
    const result = calculateFromLMP(lmp.toISOString().split('T')[0], 28);
    return result;
}

function calculateFromIVF(ivfDate, embryoDay) {
    // 3-day embryo: due date = transfer + 266 days (38 weeks)
    // 5-day embryo: due date = transfer + 261 days (37 weeks 3 days)
    const transfer = new Date(ivfDate);
    const daysToAdd = embryoDay == 5 ? 261 : 266;
    
    transfer.setDate(transfer.getDate() + daysToAdd);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lmp = new Date(transfer);
    lmp.setDate(lmp.getDate() - 280); // Approximate LMP for week calculation

    const diffTime = today - lmp;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeksPregnant = Math.floor(diffDays / 7);
    const daysRemaining = Math.max(0, Math.ceil((transfer - today) / (1000 * 60 * 60 * 24)));

    let trimester, trimesterDesc;
    if (weeksPregnant < 0) {
        trimester = "Pre-pregnancy";
        trimesterDesc = "Your due date is calculated based on your IVF transfer.";
    } else if (weeksPregnant < 13) {
        trimester = "First Trimester";
        trimesterDesc = "Weeks 1-12. Your baby's major organs and body structures are forming.";
    } else if (weeksPregnant < 27) {
        trimester = "Second Trimester";
        trimesterDesc = "Weeks 13-26. Many women feel their best during this trimester.";
    } else if (weeksPregnant < 40) {
        trimester = "Third Trimester";
        trimesterDesc = "Weeks 27-40. Your baby is growing rapidly.";
    } else {
        trimester = "Past Due Date";
        trimesterDesc = "Your due date has passed. Contact your healthcare provider.";
    }

    return {
        dueDate: transfer.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        dueDateISO: transfer.toISOString().split('T')[0],
        currentWeek: Math.max(0, weeksPregnant),
        daysRemaining: daysRemaining,
        trimester: trimester,
        trimesterDesc: trimesterDesc,
        isOverdue: weeksPregnant >= 40
    };
}

function switchMethod(method) {
    // Hide all forms
    document.getElementById('form-lmp').classList.add('hidden');
    document.getElementById('form-conception').classList.add('hidden');
    document.getElementById('form-ivf').classList.add('hidden');
    
    // Reset tab styles
    document.getElementById('tab-lmp').classList.remove('text-primary', 'border-b-2', 'border-primary');
    document.getElementById('tab-lmp').classList.add('text-gray-500');
    document.getElementById('tab-conception').classList.remove('text-primary', 'border-b-2', 'border-primary');
    document.getElementById('tab-conception').classList.add('text-gray-500');
    document.getElementById('tab-ivf').classList.remove('text-primary', 'border-b-2', 'border-primary');
    document.getElementById('tab-ivf').classList.add('text-gray-500');

    // Show selected form
    document.getElementById(`form-${method}`).classList.remove('hidden');
    
    // Highlight selected tab
    const selectedTab = document.getElementById(`tab-${method}`);
    selectedTab.classList.remove('text-gray-500');
    selectedTab.classList.add('text-primary', 'border-b-2', 'border-primary');
}

function displayResults(result) {
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('result-due-date').textContent = result.dueDate;
    document.getElementById('result-week').textContent = result.currentWeek + ' weeks';
    document.getElementById('result-days').textContent = result.daysRemaining + ' days';
    document.getElementById('trimester-name').textContent = result.trimester;
    document.getElementById('trimester-desc').textContent = result.trimesterDesc;

    // Scroll to results
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Form handlers
document.getElementById('form-lmp').addEventListener('submit', function(e) {
    e.preventDefault();
    const lmpDate = document.getElementById('lmp-date').value;
    const cycleLength = parseInt(document.getElementById('cycle-length').value);
    
    if (!lmpDate) {
        alert('Please enter the first day of your last menstrual period.');
        return;
    }

    // Validate date is not in the future
    const selectedDate = new Date(lmpDate);
    const today = new Date();
    if (selectedDate > today) {
        alert('The date cannot be in the future.');
        return;
    }

    const result = calculateFromLMP(lmpDate, cycleLength);
    displayResults(result);
});

document.getElementById('form-conception').addEventListener('submit', function(e) {
    e.preventDefault();
    const conceptionDate = document.getElementById('conception-date').value;
    
    if (!conceptionDate) {
        alert('Please enter your conception date.');
        return;
    }

    const selectedDate = new Date(conceptionDate);
    const today = new Date();
    if (selectedDate > today) {
        alert('The date cannot be in the future.');
        return;
    }

    const result = calculateFromConception(conceptionDate);
    displayResults(result);
});

document.getElementById('form-ivf').addEventListener('submit', function(e) {
    e.preventDefault();
    const ivfDate = document.getElementById('ivf-date').value;
    const embryoDay = parseInt(document.getElementById('embryo-stage').value);
    
    if (!ivfDate) {
        alert('Please enter your IVF transfer date.');
        return;
    }

    const selectedDate = new Date(ivfDate);
    const today = new Date();
    if (selectedDate > today) {
        alert('The date cannot be in the future.');
        return;
    }

    const result = calculateFromIVF(ivfDate, embryoDay);
    displayResults(result);
});

// Set max date to today
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('lmp-date').setAttribute('max', today);
    document.getElementById('conception-date').setAttribute('max', today);
    document.getElementById('ivf-date').setAttribute('max', today);
});