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
        this.isTitleFirstFocus = true; // Track if the title is being focused for the first time

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

        const now = luxon.DateTime.now();
        let hour24 = now.hour;
        let minute = now.minute;
        let period = hour24 >= 12 ? 'PM' : 'AM';
        let hour12 = hour24 % 12 || 12;
        let hourStr = hour12 < 10 ? `0${hour12}` : `${hour12}`;
        let minuteStr = minute < 10 ? `0${minute}` : `${minute}`;

        this.startTimeEl.querySelector('.hour').textContent = hourStr;
        this.startTimeEl.querySelector('.minute').textContent = minuteStr;
        this.startTimeEl.querySelector('.period').textContent = period;
        this.endTimeEl.querySelector('.hour').textContent = hourStr;
        this.endTimeEl.querySelector('.minute').textContent = minuteStr;
        this.endTimeEl.querySelector('.period').textContent = period;

        this.updateDuration();

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' && this.isRunning) {
                const now = luxon.DateTime.now();
                const elapsed = now.diff(this.startTime, 'seconds').seconds;
                this.updateTimer(elapsed);
            }
        });
    }

    setupTimeEditing() {
        document.querySelectorAll('.time-part').forEach(part => {
            part.addEventListener('click', (e) => {
                document.querySelectorAll('.time-dropdown').forEach(d => d.classList.remove('show'));
                const timeContainer = part.closest('.start-time, .end-time');
                const dropdownType = part.classList.contains('hour') ? 'hour-dropdown' :
                                     part.classList.contains('minute') ? 'minute-dropdown' : 'period-dropdown';
                const dropdown = timeContainer.querySelector(`.${dropdownType}`);
                dropdown.classList.add('show');

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
        this.timerTitle.addEventListener('click', () => {
            if (!this.timerTitle.classList.contains('disabled')) {
                if (this.isTitleFirstFocus) {
                    const selection = window.getSelection();
                    const range = document.createRange();
                    range.selectNodeContents(this.timerTitle);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    this.isTitleFirstFocus = false;
                }
            }
        });

        this.timerTitle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.timerTitle.blur();
            }
        });
    }

    updateDuration() {
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
        this.initialDuration = Math.round(this.duration) * 60;

        if (!this.isRunning) {
            this.timeRemaining.textContent = `${Math.round(this.duration)} minutes to go`;
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
            this.startButton.classList.replace('start', 'pause');
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
            this.startButton.classList.replace('pause', 'resume');

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

        const now = luxon.DateTime.now();
        this.startTime = now.minus({ seconds: this.elapsedBeforePause });

        this.interval = setInterval(() => {
            const now = luxon.DateTime.now();
            const elapsed = now.diff(this.startTime, 'seconds').seconds;
            this.updateTimer(elapsed);
        }, 1000);
    }

    pauseTimer() {
        if (!this.isRunning) return;
        const now = luxon.DateTime.now();
        this.elapsedBeforePause += now.diff(this.startTime, 'seconds').seconds;

        clearInterval(this.interval);
        this.isRunning = false;
        this.timerTitle.classList.remove('disabled');
        this.timerTitle.contentEditable = 'true';
        this.startTimeEl.classList.remove('disabled');
        this.endTimeEl.classList.remove('disabled');
    }

    resetTimer() {
        const confirmReset = confirm("Are you sure you want to reset the timer? This will clear all current progress.");
        
        if (!confirmReset) return;

        clearInterval(this.interval);
        this.isRunning = false;
        this.startTime = null;
        this.elapsedBeforePause = 0;

        this.progressBar.style.width = '0%';
        this.progressBar.style.backgroundColor = this.getProgressColor(0);
        this.timeRemaining.textContent = '0 minutes to go';

        // Fully reenable START button
        this.startButton.innerHTML = '<i class="fas fa-play"></i>&nbsp;Start';
        this.startButton.classList.replace('pause', 'start');
        this.startButton.classList.remove('disabled');
        this.startButton.disabled = false;

        // Reenable editing of start and end times
        this.startTimeEl.classList.remove('disabled');
        this.endTimeEl.classList.remove('disabled');

        // Reenable timer title editing
        this.timerTitle.classList.remove('disabled');
        this.timerTitle.contentEditable = 'true';
        this.isTitleFirstFocus = true;

        // Reenable footer link
        const aboutLink = document.querySelector('footer a[href="about.html"]');
        if (aboutLink) {
            aboutLink.classList.remove('disabled-link');
            aboutLink.removeEventListener('click', this.preventNavigation);
        }

        const now = luxon.DateTime.now();
        const hour24 = now.hour;
        const minute = now.minute;
        const period = hour24 >= 12 ? 'PM' : 'AM';
        const hour12 = hour24 % 12 || 12;
        const hourStr = hour12 < 10 ? `0${hour12}` : `${hour12}`;
        const minuteStr = minute < 10 ? `0${minute}` : `${minute}`;

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

    getProgressColor(percentage) {
        const thresholds = Object.keys(this.progressColors).map(Number).sort((a, b) => a - b);
        for (const threshold of thresholds) {
            if (percentage <= threshold) {
                return this.progressColors[threshold];
            }
        }
        return this.progressColors[100];
    }

    updateTimer(elapsedSeconds) {
        const timeLeftSeconds = this.initialDuration - elapsedSeconds;

        if (timeLeftSeconds <= 0) {
            this.progressBar.style.width = '100%';
            this.progressBar.style.backgroundColor = this.getProgressColor(100);
            clearInterval(this.interval);
            this.isRunning = false;
            this.startButton.classList.add('disabled');
            this.startButton.disabled = true;
            this.timeRemaining.textContent = 'Time is up';

            // Reenable footer link
            const aboutLink = document.querySelector('footer a[href="about.html"]');
            if (aboutLink) {
                aboutLink.classList.remove('disabled-link');
                aboutLink.removeEventListener('click', this.preventNavigation);
            }

            // Disable editing of start and end times
            this.startTimeEl.classList.add('disabled');
            this.endTimeEl.classList.add('disabled');

            // Disable timer title editing
            this.timerTitle.classList.add('disabled');
            this.timerTitle.contentEditable = 'false';

            return;
        }

        this.progressBar.style.width = `${(elapsedSeconds / this.initialDuration) * 100}%`;
        this.progressBar.style.backgroundColor = this.getProgressColor((elapsedSeconds / this.initialDuration) * 100);

        const totalMinutes = Math.ceil(timeLeftSeconds / 60);
        const minuteText = totalMinutes === 1 ? 'minute' : 'minutes';
        this.timeRemaining.textContent = `${totalMinutes} ${minuteText} to go`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const timer = new Timer();
});
