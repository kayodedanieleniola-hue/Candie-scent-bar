// EmailJS setup
emailjs.init({ publicKey: '9gQFOYHV7XR0m9AuY' });
const EMAILJS_SERVICE_ID = 'service_a1yxb8o';
const EMAILJS_TEMPLATE_ID = 'template_1n2mfyq';

// Header scroll state
const header = document.getElementById('siteHeader');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
const navBackdrop = document.getElementById('navBackdrop');

function closeMobileNav() {
  navToggle.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  mainNav.classList.remove('is-open');
  navBackdrop.classList.remove('is-open');
}
function toggleMobileNav() {
  const willOpen = !mainNav.classList.contains('is-open');
  navToggle.classList.toggle('is-open', willOpen);
  navToggle.setAttribute('aria-expanded', String(willOpen));
  mainNav.classList.toggle('is-open', willOpen);
  navBackdrop.classList.toggle('is-open', willOpen);
}
navToggle?.addEventListener('click', toggleMobileNav);
navBackdrop?.addEventListener('click', closeMobileNav);
mainNav?.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', closeMobileNav));

// Fade-up on scroll
const fadeEls = document.querySelectorAll('.fade-up');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
fadeEls.forEach(el => io.observe(el));

// Past Events showcase — sliding, swipeable track that auto-advances every 7.5 seconds
const eventsTrack = document.getElementById('eventsTrack');
const eventSlides = Array.from(document.querySelectorAll('.event-slide'));
const eventDots = Array.from(document.querySelectorAll('.events-dot'));
const eventsPrevBtn = document.getElementById('eventsPrev');
const eventsNextBtn = document.getElementById('eventsNext');
const SLIDE_DURATION = 7500;
let currentSlide = 0;
let slideTimer = null;
let dragDistance = 0;

function isDesktopLayout() {
  return window.matchMedia('(min-width:1024px)').matches;
}

function playVideoIn(slide) {
  const video = slide?.querySelector('video.event-media');
  if (video) {
    video.currentTime = 0;
    video.play().catch(() => {});
  }
}
function pauseVideoIn(slide) {
  const video = slide?.querySelector('video.event-media');
  if (video) video.pause();
}
function playAllVideos() {
  eventSlides.forEach(playVideoIn);
}

function renderSlide() {
  if (isDesktopLayout()) return;
  eventsTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  eventDots.forEach((dot, i) => dot.classList.toggle('is-active', i === currentSlide));
}

function goToSlide(index) {
  if (!eventSlides.length) return;
  pauseVideoIn(eventSlides[currentSlide]);
  currentSlide = (index + eventSlides.length) % eventSlides.length;
  renderSlide();
  playVideoIn(eventSlides[currentSlide]);
}

function startAutoAdvance() {
  clearInterval(slideTimer);
  if (isDesktopLayout()) return;
  slideTimer = setInterval(() => goToSlide(currentSlide + 1), SLIDE_DURATION);
}

function applyLayoutMode() {
  clearInterval(slideTimer);
  if (isDesktopLayout()) {
    playAllVideos();
  } else {
    eventSlides.forEach((s, i) => (i === currentSlide ? playVideoIn(s) : pauseVideoIn(s)));
    renderSlide();
    startAutoAdvance();
  }
}

function debounce(fn, wait) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

if (eventSlides.length) {
  applyLayoutMode();
  window.addEventListener('resize', debounce(applyLayoutMode, 250));

  eventsNextBtn?.addEventListener('click', () => { goToSlide(currentSlide + 1); startAutoAdvance(); });
  eventsPrevBtn?.addEventListener('click', () => { goToSlide(currentSlide - 1); startAutoAdvance(); });
  eventDots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.index, 10));
      startAutoAdvance();
    });
  });

  // Touch / pointer swipe support (mobile/tablet only)
  let dragStartX = 0;
  let dragging = false;
  const SWIPE_THRESHOLD = 40;

  eventsTrack.addEventListener('pointerdown', (e) => {
    if (isDesktopLayout()) return;
    dragging = true;
    dragDistance = 0;
    dragStartX = e.clientX;
    eventsTrack.setPointerCapture(e.pointerId);
    eventsTrack.style.transition = 'none';
  });
  eventsTrack.addEventListener('pointermove', (e) => {
    if (!dragging || isDesktopLayout()) return;
    const delta = e.clientX - dragStartX;
    dragDistance = Math.abs(delta);
    eventsTrack.style.transform = `translateX(calc(-${currentSlide * 100}% + ${delta}px))`;
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    eventsTrack.style.transition = '';
    if (isDesktopLayout()) return;
    const delta = e.clientX - dragStartX;
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      goToSlide(currentSlide + (delta < 0 ? 1 : -1));
    } else {
      renderSlide();
    }
    startAutoAdvance();
  }
  eventsTrack.addEventListener('pointerup', endDrag);
  eventsTrack.addEventListener('pointercancel', endDrag);
}

// Video modal — click any past-event video to play it fully, with sound
const videoModal = document.getElementById('videoModal');
const videoModalPlayer = document.getElementById('videoModalPlayer');
const videoModalClose = document.getElementById('videoModalClose');

function openVideoModal(slide) {
  const sourceVideo = slide.querySelector('video.event-media');
  if (!sourceVideo) return;
  clearInterval(slideTimer);
  pauseVideoIn(slide);
  videoModalPlayer.src = sourceVideo.currentSrc || sourceVideo.src;
  videoModal.classList.add('is-open');
  videoModalPlayer.currentTime = 0;
  videoModalPlayer.muted = false;
  videoModalPlayer.play().catch(() => {});
}
function closeVideoModal() {
  videoModal.classList.remove('is-open');
  videoModalPlayer.pause();
  if (eventSlides.length) {
    playVideoIn(eventSlides[currentSlide]);
    startAutoAdvance();
  }
}

eventSlides.forEach(slide => {
  slide.addEventListener('click', () => {
    if (dragDistance > 8) return;
    openVideoModal(slide);
  });
});

videoModalClose?.addEventListener('click', closeVideoModal);
videoModal?.addEventListener('click', (e) => { if (e.target === videoModal) closeVideoModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && videoModal.classList.contains('is-open')) closeVideoModal(); });

// Currency auto-switch
const countrySelect = document.getElementById('country');
const currencySymbol = document.getElementById('currencySymbol');
countrySelect.addEventListener('change', () => {
  const opt = countrySelect.options[countrySelect.selectedIndex];
  currencySymbol.textContent = opt.dataset.symbol || '—';
});

// Disable past dates
const eventDate = document.getElementById('eventDate');
eventDate.min = new Date().toISOString().split('T')[0];

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Reviews — permanently stored in Firebase Realtime Database.
// This means every visitor sees every review, and it survives redeploys.
// Editing/deleting is only offered to the browser that submitted a given
// review (tracked locally) — there's no login system, so this is a
// courtesy safeguard, not real authentication.
const reviewForm = document.getElementById('reviewForm');
const reviewSuccess = document.getElementById('reviewSuccess');
const reviewsGrid = document.getElementById('reviewsGrid');
const reviewsEmpty = document.getElementById('reviewsEmpty');
const reviewsViewAllWrap = document.getElementById('reviewsViewAllWrap');
const reviewsViewAllBtn = document.getElementById('reviewsViewAllBtn');
const RATING_STARS = { 5: '★★★★★', 4: '★★★★☆', 3: '★★★☆☆', 2: '★★☆☆☆', 1: '★☆☆☆☆' };
const FIREBASE_URL = 'https://candie-scent-bar-default-rtdb.firebaseio.com';
const REVIEWS_ENDPOINT = `${FIREBASE_URL}/reviews.json`;
const PENDING_ENDPOINT = `${FIREBASE_URL}/pendingReviews.json`;
const REVIEWS_PREVIEW_COUNT = 5;
const MY_REVIEWS_KEY = 'candieScentBarMyReviewIds';

let allReviews = [];
let reviewsExpanded = false;

function escapeHtml(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function getMyReviewIds() {
  try {
    return JSON.parse(localStorage.getItem(MY_REVIEWS_KEY)) || [];
  } catch {
    return [];
  }
}
function addMyReviewId(id) {
  const ids = getMyReviewIds();
  ids.push(id);
  localStorage.setItem(MY_REVIEWS_KEY, JSON.stringify(ids));
}
function removeMyReviewId(id) {
  localStorage.setItem(MY_REVIEWS_KEY, JSON.stringify(getMyReviewIds().filter(x => x !== id)));
}

function buildReviewCard(review) {
  const card = document.createElement('article');
  card.className = 'review-card fade-up visible';
  card.dataset.id = review.id;
  renderReviewCardView(card, review);
  return card;
}

function renderReviewCardView(card, review) {
  const mine = getMyReviewIds().includes(review.id);
  card.innerHTML = `
    <div class="review-stars">${RATING_STARS[review.rating] || '★★★★★'}</div>
    <p class="review-text">"${escapeHtml(review.text)}"</p>
    <p class="review-name">— ${escapeHtml(review.name)}</p>
    ${mine ? `
      <div class="review-actions">
        <button type="button" class="review-action-btn review-edit-btn">Edit</button>
        <button type="button" class="review-action-btn review-delete-btn">Delete</button>
      </div>
    ` : ''}
  `;
  if (mine) {
    card.querySelector('.review-edit-btn').addEventListener('click', () => renderReviewCardEdit(card, review));
    card.querySelector('.review-delete-btn').addEventListener('click', () => handleDeleteReview(card, review));
  }
}

function renderReviewCardEdit(card, review) {
  card.innerHTML = `
    <div class="review-edit-form">
      <select class="review-edit-rating">
        <option value="5">★★★★★ Excellent</option>
        <option value="4">★★★★☆ Very Good</option>
        <option value="3">★★★☆☆ Good</option>
        <option value="2">★★☆☆☆ Fair</option>
        <option value="1">★☆☆☆☆ Poor</option>
      </select>
      <textarea class="review-edit-text" rows="3"></textarea>
      <div class="review-edit-actions">
        <button type="button" class="btn btn-gold review-save-btn">Save</button>
        <button type="button" class="btn btn-outline-gold review-cancel-btn">Cancel</button>
      </div>
    </div>
  `;
  card.querySelector('.review-edit-rating').value = String(review.rating);
  card.querySelector('.review-edit-text').value = review.text;
  card.querySelector('.review-save-btn').addEventListener('click', () => handleSaveReview(card, review));
  card.querySelector('.review-cancel-btn').addEventListener('click', () => renderReviewCardView(card, review));
}

async function handleSaveReview(card, review) {
  const newRating = parseInt(card.querySelector('.review-edit-rating').value, 10);
  const newText = card.querySelector('.review-edit-text').value.trim();
  if (!newText) return;

  const saveBtn = card.querySelector('.review-save-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';

  try {
    const res = await fetch(`${FIREBASE_URL}/reviews/${review.id}.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: newRating, text: newText }),
    });
    if (!res.ok) throw new Error('Failed to update review');
    review.rating = newRating;
    review.text = newText;
    const idx = allReviews.findIndex(r => r.id === review.id);
    if (idx > -1) allReviews[idx] = review;
    renderReviewCardView(card, review);
  } catch (err) {
    console.error('Failed to save review edit:', err);
    alert('Something went wrong saving your changes — please try again.');
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

async function handleDeleteReview(card, review) {
  if (!confirm('Delete this review? This cannot be undone.')) return;
  try {
    const res = await fetch(`${FIREBASE_URL}/reviews/${review.id}.json`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete review');
    allReviews = allReviews.filter(r => r.id !== review.id);
    removeMyReviewId(review.id);
    renderReviews();
  } catch (err) {
    console.error('Failed to delete review:', err);
    alert('Something went wrong deleting your review — please try again.');
  }
}

function renderReviews() {
  reviewsGrid.querySelectorAll('.review-card').forEach(el => el.remove());

  if (!allReviews.length) {
    reviewsEmpty.style.display = '';
    reviewsViewAllWrap.style.display = 'none';
    return;
  }
  reviewsEmpty.style.display = 'none';

  // Newest first
  const sorted = allReviews.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
  const toShow = reviewsExpanded ? sorted : sorted.slice(0, REVIEWS_PREVIEW_COUNT);
  toShow.forEach(review => reviewsGrid.appendChild(buildReviewCard(review)));

  if (sorted.length > REVIEWS_PREVIEW_COUNT) {
    reviewsViewAllWrap.style.display = '';
    reviewsViewAllBtn.textContent = reviewsExpanded ? 'Show Fewer Reviews' : 'See More Reviews';
  } else {
    reviewsViewAllWrap.style.display = 'none';
  }
}

async function fetchReviews() {
  try {
    const res = await fetch(REVIEWS_ENDPOINT);
    if (!res.ok) throw new Error('Failed to load reviews');
    const data = await res.json();
    // Firebase returns an object keyed by generated IDs (or null if empty), not an array
    allReviews = data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : [];
  } catch (err) {
    console.error('Could not load reviews:', err);
    allReviews = [];
  }
  renderReviews();
}
fetchReviews();

reviewsViewAllBtn?.addEventListener('click', () => {
  reviewsExpanded = !reviewsExpanded;
  renderReviews();
});

reviewForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!reviewForm.checkValidity()) {
    reviewForm.reportValidity();
    return;
  }
  const name = document.getElementById('reviewName').value.trim();
  const rating = document.getElementById('reviewRating').value;
  const text = document.getElementById('reviewText').value.trim();

  const submitBtn = reviewForm.querySelector('.btn-submit');
  const originalBtnText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting…';

  try {
    const newReviewData = { name, rating, text, date: new Date().toISOString() };
    // New reviews go into a pending queue first — an admin must approve
    // them before they appear publicly. See admin.html.
    const res = await fetch(PENDING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReviewData),
    });
    if (!res.ok) throw new Error('Failed to submit review');
    const result = await res.json(); // Firebase returns { name: "<generated-id>" }
    // Remember this ID now — if it's later approved, it keeps the same ID,
    // so edit/delete will still work for the person who wrote it.
    addMyReviewId(result.name);

    reviewSuccess.textContent = 'Thank you — your review has been submitted and will appear once approved.';
    reviewSuccess.classList.remove('error');
    reviewSuccess.classList.add('show');
    reviewForm.reset();
  } catch (err) {
    console.error('Review submission failed:', err);
    reviewSuccess.textContent = 'Something went wrong submitting your review — please try again.';
    reviewSuccess.classList.add('show', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
    setTimeout(() => reviewSuccess.classList.remove('show'), 4000);
  }

  // Notify the business by email via EmailJS (best-effort, does not block the UI)
  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    form_type: 'Customer Review (pending approval)',
    from_name: name,
    from_email: '—',
    phone: '—',
    event_type: '—',
    event_date: '—',
    event_time: '—',
    country: '—',
    budget: '—',
    location: '—',
    rating: `${rating} / 5`,
    message: text,
  }).catch(err => console.error('EmailJS review notification failed:', err));
});

// Booking form submit
const bookingForm = document.getElementById('bookingForm');
const formSuccess = document.getElementById('formSuccess');
bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!bookingForm.checkValidity()) {
    bookingForm.reportValidity();
    return;
  }

  const submitBtn = bookingForm.querySelector('.btn-submit');
  const originalBtnText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  const opt = countrySelect.options[countrySelect.selectedIndex];
  const templateParams = {
    form_type: 'Booking Request',
    from_name: document.getElementById('fullName').value.trim(),
    from_email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    event_type: document.getElementById('eventType').value,
    event_date: document.getElementById('eventDate').value,
    event_time: document.getElementById('eventTime').value,
    country: opt.textContent,
    budget: `${currencySymbol.textContent} ${document.getElementById('budget').value}`,
    location: document.getElementById('location').value.trim(),
    rating: '—',
    message: document.getElementById('notes').value.trim() || 'No additional notes',
  };

  const originalSuccessText = formSuccess.textContent;

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(() => {
      formSuccess.textContent = originalSuccessText;
      formSuccess.classList.remove('error');
      formSuccess.classList.add('show');
      bookingForm.reset();
      currencySymbol.textContent = '—';
    })
    .catch((err) => {
      console.error('EmailJS booking submission failed:', err);
      formSuccess.textContent = "Something went wrong sending your request — please try again or contact us directly.";
      formSuccess.classList.add('show', 'error');
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    });
});
