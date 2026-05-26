// Data Storage
const STORAGE_KEY = 'menstrual_calendar_data';

// Siklus Menstruasi
const MENSTRUAL_PHASE = 5; // Hari menstruasi (biasanya 5-7 hari)
const FOLLICULAR_PHASE = 9; // Fase folikel (hari 1-9)
const OVULATION_WINDOW = 5; // Jendela ovulasi (5 hari tersubur)
const LUTEAL_PHASE = 14; // Fase luteal

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const saved = getSavedData();
    if (saved) {
        showCalendar();
        renderCalendar();
        updateInfo();
    } else {
        showSetup();
    }
});

// Get Saved Data
function getSavedData() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
}

// Save Data
function saveData() {
    const lastPeriodDate = document.getElementById('lastPeriodDate').value;
    const cycleLength = parseInt(document.getElementById('cycleLength').value);

    if (!lastPeriodDate) {
        showNotification('⚠️ Silakan pilih tanggal menstruasi terakhir');
        return;
    }

    const data = {
        lastPeriodDate: new Date(lastPeriodDate),
        cycleLength: cycleLength
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        lastPeriodDate: lastPeriodDate,
        cycleLength: cycleLength
    }));

    showNotification('✅ Data berhasil disimpan!');
    setTimeout(() => {
        showCalendar();
        renderCalendar();
        updateInfo();
    }, 500);
}

// Show Setup
function showSetup() {
    document.getElementById('setupSection').classList.remove('hidden');
    document.getElementById('calendarSection').classList.add('hidden');
    
    // Set default date ke hari ini
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('lastPeriodDate').value = today;
}

// Show Calendar
function showCalendar() {
    document.getElementById('setupSection').classList.add('hidden');
    document.getElementById('calendarSection').classList.remove('hidden');
}

// Reset Data
function resetData() {
    if (confirm('🤔 Apakah Anda yakin ingin mereset semua data?')) {
        localStorage.removeItem(STORAGE_KEY);
        showNotification('🔄 Data berhasil direset!');
        setTimeout(() => {
            showSetup();
            document.getElementById('lastPeriodDate').value = '';
            document.getElementById('cycleLength').value = '28';
        }, 500);
    }
}

// Render Calendar
function renderCalendar() {
    const saved = getSavedData();
    if (!saved) return;

    const lastPeriod = new Date(saved.lastPeriodDate);
    const today = new Date();
    
    let currentDate = new Date(today.getFullYear(), today.getMonth(), 1);

    // Update month/year
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    document.getElementById('monthYear').textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';

    // Get first day of month
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    
    // Empty cells
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day other';
        empty.textContent = '';
        calendarDays.appendChild(empty);
    }

    // Days of month
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        
        dayElement.textContent = day;
        dayElement.className = 'calendar-day';

        // Check if today
        if (isToday(dateObj)) {
            dayElement.classList.add('today');
        }

        // Get phase
        const phase = getPhase(dateObj, lastPeriod, saved.cycleLength);
        dayElement.classList.add(phase);

        dayElement.addEventListener('click', () => showDayDetails(dateObj, phase));
        calendarDays.appendChild(dayElement);
    }
}

// Get Phase
function getPhase(date, lastPeriod, cycleLength) {
    const daysFromLastPeriod = Math.floor((date - lastPeriod) / (1000 * 60 * 60 * 24));
    const dayInCycle = ((daysFromLastPeriod % cycleLength) + cycleLength) % cycleLength;

    if (dayInCycle < MENSTRUAL_PHASE) {
        return 'menstrual';
    } else if (dayInCycle < FOLLICULAR_PHASE) {
        return 'follicular';
    } else if (dayInCycle < FOLLICULAR_PHASE + OVULATION_WINDOW) {
        return 'ovulation';
    } else {
        return 'luteal';
    }
}

// Update Info
function updateInfo() {
    const saved = getSavedData();
    if (!saved) return;

    const lastPeriod = new Date(saved.lastPeriodDate);
    const nextPeriod = new Date(lastPeriod.getTime() + saved.cycleLength * 24 * 60 * 60 * 1000);

    // Fertile period (5 hari sebelum ovulasi dan hari ovulasi)
    const ovulationDay = lastPeriod.getTime() + FOLLICULAR_PHASE * 24 * 60 * 60 * 1000;
    const fertilePeriodStart = new Date(ovulationDay - 5 * 24 * 60 * 60 * 1000);
    const fertilePeriodEnd = new Date(ovulationDay + 24 * 60 * 60 * 1000);

    const dateFormatter = new Intl.DateTimeFormat('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    document.getElementById('lastPeriodInfo').textContent = dateFormatter.format(lastPeriod);
    document.getElementById('nextPeriodInfo').textContent = dateFormatter.format(nextPeriod);
    document.getElementById('cycleLengthInfo').textContent = `${saved.cycleLength} hari`;
    document.getElementById('fertilePeriodInfo').textContent = 
        `${dateFormatter.format(fertilePeriodStart)} - ${dateFormatter.format(fertilePeriodEnd)}`;
}

// Navigation
let currentMonth = new Date();

function previousMonth() {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendarForMonth(currentMonth);
}

function nextMonth() {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendarForMonth(currentMonth);
}

function renderCalendarForMonth(date) {
    const saved = getSavedData();
    if (!saved) return;

    const lastPeriod = new Date(saved.lastPeriodDate);
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    document.getElementById('monthYear').textContent = 
        `${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';

    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day other';
        calendarDays.appendChild(empty);
    }

    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        const dateObj = new Date(date.getFullYear(), date.getMonth(), day);
        
        dayElement.textContent = day;
        dayElement.className = 'calendar-day';

        if (isToday(dateObj)) {
            dayElement.classList.add('today');
        }

        const phase = getPhase(dateObj, lastPeriod, saved.cycleLength);
        dayElement.classList.add(phase);

        dayElement.addEventListener('click', () => showDayDetails(dateObj, phase));
        calendarDays.appendChild(dayElement);
    }
}

// Show Day Details
function showDayDetails(date, phase) {
    const phaseNames = {
        'menstrual': 'Menstruasi',
        'follicular': 'Fase Folikel',
        'ovulation': 'Ovulasi (Paling Subur)',
        'luteal': 'Fase Luteal'
    };

    const phaseDescriptions = {
        'menstrual': '🩸 Fase menstruasi. Istirahat yang cukup dan konsumsi makanan bergizi.',
        'follicular': '🌱 Energi meningkat. Waktu yang baik untuk berolahraga dan aktif.',
        'ovulation': '💕 Periode paling subur! Jika ingin hamil, ini waktu terbaik.',
        'luteal': '🌙 Energi mulai menurun. Fokus pada istirahat dan nutrisi.'
    };

    const dateFormatter = new Intl.DateTimeFormat('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    showNotification(`${phaseNames[phase]}\n${dateFormatter.format(date)}\n\n${phaseDescriptions[phase]}`);
}

// Share Calendar
function shareCalendar() {
    const saved = getSavedData();
    if (!saved) {
        showNotification('❌ Tidak ada data untuk dibagikan');
        return;
    }

    const text = `Halo! 🌸\n\nAku menggunakan Kalender Menstruasi Ayu untuk melacak siklus aku.\nBisa langsung akses di sini tanpa perlu download app! 💕\n\nhttps://aksakabelajarcoding.github.io/menstrual-calendar/`;

    if (navigator.share) {
        navigator.share({
            title: 'Kalender Menstruasi Ayu',
            text: text
        });
    } else {
        // Fallback untuk browser yang tidak support share
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text);
            showNotification('✅ Link berhasil disalin ke clipboard!');
        } else {
            alert(text);
        }
    }
}

// Utility Functions
function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('hidden');

    setTimeout(() => {
        notification.classList.add('hidden');
    }, 4000);
}
