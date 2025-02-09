class Timer {
    constructor() {
        this.startTime = null;
        this.initialDuration = 0;
        this.elapsedBeforePause = 0;
        this.interval = null;
        this.isRunning = false;
        this.isExpanded = false;
        this.duration = 0;
        this.oldInitialDuration = 0;

        // Track if the title is being focused for the first time
        this.isTitleFirstFocus = true; 

        this.progressColors = {
            10: 'var(--progress-10)',
            20: 'var(--progress-20)',
            30: 'var(--progress-30)',
            40: 'var(--progress-40)',
            50: 'var(--progress-50)',
            60: 'var(--progress-60)',
            70: 'var(--progress-70)',
            80: 'var(--progress-80)',
            90: 'var(--progress-90)',
            100: 'var(--progress-100)'
        };

        this.timerCard = document.querySelector('.timer-card');
        this.expandIcon = document.querySelector('.expand-icon');
        this.expandIconI = this.expandIcon.querySelector('i');
        this.progressBar = document.querySelector('.progress-bar');
        this.timeRemaining = document.querySelector('.time-remaining');
        this.startButton = document.querySelector('.timer-button.start');
        this.resetButton = document.querySelector('.timer-button.reset');
        this.timerTitle = document.querySelector('.timer-title');

        this.startTimeEl = document.querySelector('.start-time');
        this.endTimeEl = document.querySelector('.end-time');

        this.isSoundOn = false; // Variable to track sound state
        this.soundIcon = document.getElementById('sound-icon');

        // Set the initial icon to "muted"
        this.soundIcon.classList.remove('fa-volume-up');
        this.soundIcon.classList.add('fa-volume-mute');

        this.progressBar.style.width = '0%';
        this.progressBar.style.backgroundColor = this.getProgressColor(0);
        this.timeRemaining.textContent = '0 minutes to go';

        this.expandIconI.classList.remove('fa-chevron-down');
        this.expandIconI.classList.add('fa-expand');

        this.setupTimeEditing();
        this.setupTitleEditing();
        this.startButton.addEventListener('click', () => this.toggleTimer());
        this.resetButton.addEventListener('click', () => this.resetTimer());
        this.expandIcon.addEventListener('click', () => this.toggleExpand());

        // Set start and end times to current local time at initial load
        const now = luxon.DateTime.now();
        let hour24 = now.hour; // 0-23
        let minute = now.minute;
        let period = hour24 >= 12 ? 'PM' : 'AM';

        // Convert to 12-hour format
        let hour12 = hour24 % 12;
        if (hour12 === 0) hour12 = 12; 

        // Format hour and minute strings
        let hourStr = hour12 < 10 ? `0${hour12}` : `${hour12}`;
        let minuteStr = minute < 10 ? `0${minute}` : `${minute}`;

        // Update start times
        this.startTimeEl.querySelector('.hour').textContent = hourStr;
        this.startTimeEl.querySelector('.minute').textContent = minuteStr;
        this.startTimeEl.querySelector('.period').textContent = period;

        // Update end times
        this.endTimeEl.querySelector('.hour').textContent = hourStr;
        this.endTimeEl.querySelector('.minute').textContent = minuteStr;
        this.endTimeEl.querySelector('.period').textContent = period;

        // Recalculate duration and display
        this.updateDuration();

        // Add theme toggle setup
        this.setupThemeToggle();

        // Event listener for the sound toggle icon
        this.soundIcon.addEventListener('click', () => this.toggleSound());
    }

    setupTimeEditing() {
        document.querySelectorAll('.time-part').forEach(part => {
            part.addEventListener('click', (e) => {
                // Close any open dropdowns
                document.querySelectorAll('.time-dropdown').forEach(d => d.classList.remove('show'));
    
                // Find and show the corresponding dropdown
                const timeContainer = part.closest('.start-time, .end-time');
                const dropdownType = part.classList.contains('hour') ? 'hour-dropdown' :
                                     part.classList.contains('minute') ? 'minute-dropdown' : 'period-dropdown';
                const dropdown = timeContainer.querySelector(`.${dropdownType}`);
                dropdown.classList.add('show');
    
                // Highlight current value
                const currentValue = part.textContent;
                const items = dropdown.querySelectorAll('.dropdown-item');
                let currentSelectedItem = null;
    
                items.forEach(item => {
                    const isSelected = item.textContent === currentValue;
                    item.classList.toggle('selected', isSelected);
                    if (isSelected) {
                        currentSelectedItem = item;
                    }
                });
    
                // Scroll to the selected item if found
                if (currentSelectedItem) {
                    currentSelectedItem.scrollIntoView({ block: 'nearest' });
                }
    
                e.stopPropagation();
            });
        });
    
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const dropdown = item.closest('.time-dropdown');
                const timeContainer = dropdown.closest('.start-time, .end-time');
                const value = item.textContent;
    
                if (dropdown.classList.contains('hour-dropdown')) {
                    timeContainer.querySelector('.hour').textContent = value;
                } else if (dropdown.classList.contains('minute-dropdown')) {
                    timeContainer.querySelector('.minute').textContent = value;
                } else {
                    timeContainer.querySelector('.period').textContent = value;
                }
    
                dropdown.classList.remove('show');
                this.updateDuration();
                e.stopPropagation();
            });
        });
    
        document.addEventListener('click', () => {
            document.querySelectorAll('.time-dropdown').forEach(d => d.classList.remove('show'));
        });
    }
    

    setupTitleEditing() {
        this.timerTitle.addEventListener('click', (e) => {
            if (!this.timerTitle.classList.contains('disabled')) {
                // On first focus, select all text
                if (this.isTitleFirstFocus) {
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(this.timerTitle);
                    selection.removeAllRanges();
                    selection.addRange(range);

                    // After first focus, no longer select all automatically
                    this.isTitleFirstFocus = false;
                }
                // Subsequent clicks do not reselect all text, allowing normal caret placement.
            }
        });

        this.timerTitle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.timerTitle.blur();
            }
        });
    }

    setupThemeToggle() {
        const themeModeText = document.getElementById('theme-mode-text');
        const body = document.body;

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('timeToGoTheme');
        if (savedTheme) {
            body.classList.add(savedTheme);
            themeModeText.textContent = savedTheme === 'dark-mode' ? 'Dark' : 'Light';
        }

        themeModeText.addEventListener('click', () => {
            if (body.classList.contains('dark-mode')) {
                body.classList.remove('dark-mode');
                themeModeText.textContent = 'Light';
                localStorage.setItem('timeToGoTheme', '');
            } else {
                body.classList.add('dark-mode');
                themeModeText.textContent = 'Dark';
                localStorage.setItem('timeToGoTheme', 'dark-mode');
            }
        });
    }

    updateDuration() {
        const oldInitialDuration = this.initialDuration;

        const startHour = parseInt(this.startTimeEl.querySelector('.hour').textContent);
        const startMinute = parseInt(this.startTimeEl.querySelector('.minute').textContent);
        const startPeriod = this.startTimeEl.querySelector('.period').textContent;

        const endHour = parseInt(this.endTimeEl.querySelector('.hour').textContent);
        const endMinute = parseInt(this.endTimeEl.querySelector('.minute').textContent);
        const endPeriod = this.endTimeEl.querySelector('.period').textContent;

        const start24Hour = this.convertTo24Hour(startHour, startPeriod);
        const end24Hour = this.convertTo24Hour(endHour, endPeriod);

        const now = luxon.DateTime.now();
        const startTime = now.set({ hour: start24Hour, minute: startMinute });
        let endTime = now.set({ hour: end24Hour, minute: endMinute });

        if (endTime < startTime) {
            endTime = endTime.plus({ days: 1 });
        }

        this.duration = endTime.diff(startTime, 'minutes').minutes; 
        const roundedDuration = Math.round(this.duration);
        this.initialDuration = roundedDuration * 60; 

        if (!this.isRunning && oldInitialDuration > 0 && this.elapsedBeforePause > 0) {
            const ratio = this.elapsedBeforePause / oldInitialDuration;
            this.elapsedBeforePause = ratio * this.initialDuration;
        }

        if (!this.isRunning) {
            this.timeRemaining.textContent = `${roundedDuration} minutes to go`;
        }

        this.oldInitialDuration = this.initialDuration;
    }

    convertTo24Hour(hour, period) {
        if (period === 'PM' && hour !== 12) {
            return hour + 12;
        }
        if (period === 'AM' && hour === 12) {
            return 0;
        }
        return hour;
    }

    toggleTimer() {
        if (!this.isRunning) {
            this.startTimer();
            this.startButton.innerHTML = '<i class="fas fa-pause"></i>&nbsp;Pause';
            this.startButton.classList.remove('start', 'resume');
            this.startButton.classList.add('pause');
            this.startTimeEl.classList.add('disabled');
            this.endTimeEl.classList.add('disabled');
            this.timerTitle.classList.add('disabled');
            this.timerTitle.contentEditable = 'false';

            // Disable about link when timer starts
            const aboutLink = document.querySelector('footer a[href="about.html"]');
            if (aboutLink) {
                aboutLink.classList.add('disabled-link');
                aboutLink.addEventListener('click', this.preventNavigation);
            }
        } else {
            this.pauseTimer();
            this.startButton.innerHTML = '<i class="fas fa-play"></i>&nbsp;Resume';
            this.startButton.classList.remove('start', 'pause');
            this.startButton.classList.add('resume');

            // Re-enable about link when timer is paused
            const aboutLink = document.querySelector('footer a[href="about.html"]');
            if (aboutLink) {
                aboutLink.classList.remove('disabled-link');
                aboutLink.removeEventListener('click', this.preventNavigation);
            }
        }
    }

    preventNavigation(e) {
        e.preventDefault();
        alert('Please pause the timer before navigating to About page.');
    }

    startTimer() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = luxon.DateTime.now();
        this.interval = setInterval(() => this.updateTimer(), 1000);
    }

    pauseTimer() {
        if (!this.isRunning) return;
        const now = luxon.DateTime.now();
        const elapsed = now.diff(this.startTime, 'seconds').seconds;
        this.elapsedBeforePause += elapsed;

        clearInterval(this.interval);
        this.isRunning = false;

        // Allow editing again on pause
        this.timerTitle.classList.remove('disabled');
        this.timerTitle.contentEditable = 'true';
        this.startTimeEl.classList.remove('disabled');
        this.endTimeEl.classList.remove('disabled');
    }

    resumeTimer() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = luxon.DateTime.now();
        this.interval = setInterval(() => this.updateTimer(), 1000);

        // Disable editing again on resume if desired
        this.timerTitle.classList.add('disabled');
        this.timerTitle.contentEditable = 'false';
        this.startTimeEl.classList.add('disabled');
        this.endTimeEl.classList.add('disabled');
    }

    resetTimer() {
        const confirmReset = confirm("Are you sure you want to reset the timer? This will clear all current progress.");
        
        if (!confirmReset) {
            return; 
        }

        clearInterval(this.interval);
        this.isRunning = false;
        this.startTime = null;
        this.initialDuration = 0;
        this.elapsedBeforePause = 0;
        this.duration = 0;
        this.oldInitialDuration = 0;

        this.progressBar.style.width = '0%';
        this.progressBar.style.backgroundColor = this.getProgressColor(0);
        this.timeRemaining.textContent = '0 minutes to go';

        this.startButton.innerHTML = '<i class="fas fa-play"></i>&nbsp;Start';
        this.startButton.classList.remove('pause', 'resume', 'disabled');
        this.startButton.classList.add('start');
        this.startButton.disabled = false;

        this.startTimeEl.classList.remove('disabled');
        this.endTimeEl.classList.remove('disabled');
        this.timerTitle.classList.remove('disabled');
        this.timerTitle.contentEditable = 'true';
        this.isTitleFirstFocus = true;

        // Reset times to current time again on reset
        const now = luxon.DateTime.now();
        let hour24 = now.hour;
        let minute = now.minute;
        let period = hour24 >= 12 ? 'PM' : 'AM';

        let hour12 = hour24 % 12;
        if (hour12 === 0) hour12 = 12; 
        let hourStr = hour12 < 10 ? `0${hour12}` : `${hour12}`;
        let minuteStr = minute < 10 ? `0${minute}` : `${minute}`;

        this.startTimeEl.querySelector('.hour').textContent = hourStr;
        this.startTimeEl.querySelector('.minute').textContent = minuteStr;
        this.startTimeEl.querySelector('.period').textContent = period;

        this.endTimeEl.querySelector('.hour').textContent = hourStr;
        this.endTimeEl.querySelector('.minute').textContent = minuteStr;
        this.endTimeEl.querySelector('.period').textContent = period;

        this.updateDuration();
    }

    toggleExpand() {
        this.isExpanded = !this.isExpanded;
        this.timerCard.classList.toggle('expanded');
        this.expandIconI.classList.toggle('fa-expand');
        this.expandIconI.classList.toggle('fa-compress');
    }

    toggleSound() {
        this.isSoundOn = !this.isSoundOn; // Toggle the sound state

        if (this.isSoundOn) {
            this.soundIcon.classList.remove('fa-volume-mute');
            this.soundIcon.classList.add('fa-volume-up');
        } else {
            this.soundIcon.classList.remove('fa-volume-up');
            this.soundIcon.classList.add('fa-volume-mute');
        }
    }

    getProgressColor(percentage) {
        const thresholds = Object.keys(this.progressColors).map(Number).sort((a, b) => a - b);
        for (const threshold of thresholds) {
            if (percentage <= threshold) {
                return this.progressColors[threshold];
            }
        }
        return this.progressColors[100];
    }

    updateTimer() {
        const now = luxon.DateTime.now();
        const elapsed = this.elapsedBeforePause + now.diff(this.startTime, 'seconds').seconds;
        const progress = (elapsed / this.initialDuration) * 100;

        if (progress >= 100) {
            this.progressBar.style.width = '100%';
            this.progressBar.style.backgroundColor = this.getProgressColor(100);
            clearInterval(this.interval);
            this.isRunning = false;
            this.startButton.classList.add('disabled');
            this.startButton.disabled = true;
            this.timeRemaining.textContent = 'Time is up';
            if (this.isSoundOn) {
                this.playAlarm(); // Call the function to play the alarm sound
            }
            return;
        }

        this.progressBar.style.width = `${progress}%`;
        this.progressBar.style.backgroundColor = this.getProgressColor(progress);

        const timeLeftSeconds = this.initialDuration - elapsed;
        const totalMinutes = Math.ceil(timeLeftSeconds / 60);
        const minuteText = totalMinutes === 1 ? 'minute' : 'minutes';
        this.timeRemaining.textContent = `${totalMinutes} ${minuteText} to go`;
    }

    playAlarm() {
        const alarmSound = new Audio('sounds/Alarm01.wav'); // Path to the sound file in your project
        alarmSound.loop = true;
    
        // Try playing the alarm sound and handle any errors
        alarmSound.play().catch(error => {
            console.error('Error playing alarm sound:', error);
        });
    
        // Function to stop the alarm
        const stopAlarm = () => {
            alarmSound.pause();
            alarmSound.currentTime = 0; // Reset to the start
            document.removeEventListener('click', stopAlarm);
            document.removeEventListener('keydown', stopAlarm);
        };
    
        // Add listeners to stop the alarm
        document.addEventListener('click', stopAlarm);
        document.addEventListener('keydown', stopAlarm);
    }
    

    checkTimer(timerValue) {
        if (timerValue <= 0) {
            if (this.isSoundOn) {
                this.playAlarm(); // Call the function to play the alarm sound
            }
        }
    }
}

// Initialise timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const timer = new Timer();
    timer.soundIcon.classList.add('fa-volume-mute'); // Ensure the icon is set to mute initially
});
