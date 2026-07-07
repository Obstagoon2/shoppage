document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenuToggle.classList.toggle('open');
            mainNav.classList.toggle('open');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenuToggle.contains(event.target) && !mainNav.contains(event.target)) {
                mobileMenuToggle.classList.remove('open');
                mainNav.classList.remove('open');
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                mobileMenuToggle.classList.remove('open');
                mainNav.classList.remove('open');
            }
        });
        
        // Mobile dropdown toggles
        const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
        dropdownToggles.forEach(toggle => {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const dropdown = this.parentElement;
                
                // Close all other dropdowns
                document.querySelectorAll('.dropdown.open').forEach(openDropdown => {
                    if (openDropdown !== dropdown) {
                        openDropdown.classList.remove('open');
                    }
                });
                
                // Toggle current dropdown
                dropdown.classList.toggle('open');
            });
        });
        
        // Close dropdowns when clicking on links
        const dropdownLinks = document.querySelectorAll('.dropdown-menu a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Close all dropdowns
                document.querySelectorAll('.dropdown.open').forEach(dropdown => {
                    dropdown.classList.remove('open');
                });
                // Close mobile menu
                mobileMenuToggle.classList.remove('open');
                mainNav.classList.remove('open');
            });
        });
    }

    // --- Awards dropdown functionality ---
    document.querySelectorAll('.awards-toggle').forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            const isOpen = content.classList.contains('open');

            if (isOpen) {
                content.style.maxHeight = content.scrollHeight + "px"; // lock height before collapsing
                requestAnimationFrame(() => {
                    content.style.maxHeight = "0"; // then collapse
                });
                content.classList.remove('open');
                button.textContent = button.textContent.replace("▴", "▾");
            } else {
                content.style.maxHeight = content.scrollHeight + "px"; // expand
                content.classList.add('open');
                button.textContent = button.textContent.replace("▾", "▴");

                // Reset height after transition so resizing works
                content.addEventListener('transitionend', function removeHeight() {
                    if (content.classList.contains('open')) {
                        content.style.maxHeight = "none";
                    }
                    content.removeEventListener('transitionend', removeHeight);
                });
            }
        });
    });

    // --- Countdown Timer Functionality ---
    function initCountdownTimer() {
        const countdownTimer = document.getElementById('countdown-timer');
        if (!countdownTimer) return;

        // Set the target date (Magnolia Regional: March 18th, 2026 first day)
        const targetDate = new Date('2026-07-18T08:00:00-05:00').getTime();

        function updateCountdown() {
            const now = new Date().getTime();
            const timeLeft = targetDate - now;

            if (timeLeft > 0) {
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                // Update the display
                const daysElement = document.getElementById('days');
                const hoursElement = document.getElementById('hours');
                const minutesElement = document.getElementById('minutes');
                const secondsElement = document.getElementById('seconds');

                if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
                if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
                if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
                if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
            } else {
                // Countdown finished - show completion message
                const countdownContent = document.querySelector('.countdown-content');
                if (countdownContent) {
                    countdownContent.innerHTML = `
                        <h1 class="countdown-title"> The 2026 Northshore Knockout is Here!</h1>
                        <div class="event-details">
                            <p class="event-date">July 18th, 2026 • Offseason</p>
                            <p class="event-location"> Mandeville High School, Mandeville, LA</p>
                        </div>
                    `;
                }
            }
        }

        // Update countdown immediately and then every second
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // Initialize countdown timer
    initCountdownTimer();

    // --- Add to Calendar functionality ---
    function initAddToCalendar() {
        const addToCalendarBtns = document.querySelectorAll('.add-calendar-btn');
        
        addToCalendarBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const eventCard = this.closest('.event-card');
                if (!eventCard) return;

                const eventTitle = eventCard.querySelector('h3')?.textContent || 'Team 1912 Event';
                const eventDate = eventCard.querySelector('.date')?.textContent || '';
                const eventTime = eventCard.querySelector('.time')?.textContent || '';
                const eventDescription = eventCard.querySelector('.event-description p')?.textContent || '';

                // Create calendar event data
                const startDate = new Date();
                const endDate = new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // 2 hours later

                const calendarData = {
                    title: eventTitle,
                    start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
                    end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
                    description: eventDescription,
                    location: 'Team 1912 Combustion'
                };

                // Create Google Calendar URL
                const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(calendarData.title)}&dates=${calendarData.start}/${calendarData.end}&details=${encodeURIComponent(calendarData.description)}&location=${encodeURIComponent(calendarData.location)}`;

                // Open in new tab
                window.open(googleCalendarUrl, '_blank');
            });
        });
    }

    // Initialize add to calendar functionality
    initAddToCalendar();
});
