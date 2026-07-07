const calendarId = 'o3eivkpjp04uchm38easqesdt9ds8pdt@import.calendar.google.com';
const apiKey = 'AIzaSyDFk7BVAYxUIngHdDOnVFD14XhnqdOSFDc';
const calendarEventsContainer = document.getElementById('calendar-events');
const loadMoreBtn = document.getElementById('load-more-btn');
const noMoreMsg = document.getElementById('no-more-msg');

let allEvents = [];
let displayedCount = 0;
const EVENTS_PER_BATCH = 6;

async function fetchCalendarEvents() {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    allEvents = (data.items || []).filter(event => {
      const summary = event.summary || '';
      return !/\badded\b$/i.test(summary);
    });
    displayNextBatch();
  } catch (error) {
    console.error('Failed to fetch calendar events:', error);
    calendarEventsContainer.innerHTML = '<p style="color:#ff6666;">Failed to load events.</p>';
  }
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function cleanDescription(description) {
  if (!description) return '';
  const cutoff = description.indexOf("You can see the RSVP status");
  let cleaned = cutoff !== -1 ? description.substring(0, cutoff) : description;
  cleaned = cleaned.replace(/powered by Google Calendar/i, '').trim();
  cleaned = cleaned.replace(/\(.*?added\)/gi, '').trim(); // <-- add this
  return cleaned;
}

function createAddToCalendarLink(event) {
  const start = event.start.dateTime || event.start.date;
  const end = event.end.dateTime || event.end.date;
  const title = encodeURIComponent(event.summary || 'Team 1912 Event');
  const details = encodeURIComponent(event.description || '');
  const location = encodeURIComponent(event.location || '');

  const formatDate = (str) => new Date(str).toISOString().replace(/[-:]|\.\d{3}/g, '');
  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatDate(start)}/${formatDate(end)}&details=${details}&location=${location}&sf=true&output=xml`;
}

function createEventCard(event) {
  const card = document.createElement('div');
  card.classList.add('event-card');

  const title = document.createElement('h3');
  title.textContent = event.summary || 'Untitled Event';

  const date = document.createElement('p');
  date.textContent = formatDateTime(event.start.dateTime || event.start.date);

  const location = document.createElement('p');
  if (event.location) {
    location.textContent = event.location;
  }

  const description = document.createElement('p');
  const cleaned = cleanDescription(event.description);
  if (cleaned) {
    description.textContent = cleaned;
  }

  const addBtn = document.createElement('a');
  addBtn.href = createAddToCalendarLink(event);
  addBtn.textContent = 'Add to Calendar';
  addBtn.classList.add('add-calendar-btn');
  addBtn.target = '_blank';
  addBtn.rel = 'noopener noreferrer';

  card.appendChild(title);
  card.appendChild(date);
  if (event.location) card.appendChild(location);
  if (cleaned) card.appendChild(description);
  card.appendChild(addBtn);

  return card;
}

function displayNextBatch() {
  const nextBatch = allEvents.slice(displayedCount, displayedCount + EVENTS_PER_BATCH);
  nextBatch.forEach(event => {
    const card = createEventCard(event);
    calendarEventsContainer.appendChild(card);
  });

  displayedCount += nextBatch.length;

  if (displayedCount >= allEvents.length) {
    loadMoreBtn.style.display = 'none';
    noMoreMsg.style.display = 'block';
  }
}

// Event listener for "Load More Events"
loadMoreBtn.addEventListener('click', displayNextBatch);

// Fetch events on page load
fetchCalendarEvents();
