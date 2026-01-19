const CONFIG = {
  rsvpUrl: "https://www.zola.com/wedding/rebeccagavin2026/rsvp",
  weddingWebsiteUrl: "PASTE_WEDDING_WEBSITE_LINK_HERE",
};

function svgDataUrl(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function attachImageFallback(img, svgMarkup) {
  if (!img) return;
  img.addEventListener(
    "error",
    () => {
      img.src = svgDataUrl(svgMarkup);
    },
    { once: true },
  );
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function runIntroAnimation() {
  const intro = document.getElementById("intro");
  const invite = document.getElementById("invite");
  if (!intro || !invite) return;

  if (prefersReducedMotion()) {
    document.body.classList.remove("intro-lock");
    document.body.classList.remove("intro-playing");
    document.body.classList.add("intro-done");
    return;
  }

  document.body.classList.add("intro-lock");

  requestAnimationFrame(() => {
    document.body.classList.add("intro-playing");
  });

  window.setTimeout(() => {
    document.body.classList.remove("intro-playing");
    document.body.classList.add("intro-done");
    document.body.classList.remove("intro-lock");
  }, 2800);
}

function normalizeUrl(url) {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}
function logLinkClick(tracker, referrer) {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  
  if (!id) return;

  const base = 'https://script.google.com/macros/s/AKfycbwl57S2OF5bu5ipPZqG0ZwrGBY0l6c2MAWyCtGwToYuM45oh6zVENACfPkpbSSAPxxi/exec';
  
  // We add 'recipient', 'ua', and 'ref' so the Apps Script has data for those columns
  const trackingParams = new URLSearchParams({
    id: id,
    campaign: 'invite_open',
    recipient: params.get('email') || 'not_provided', 
    ua: tracker,           // Sends browser info to the 'userAgent' variable
    ref: referrer, // Sends the previous page to the 'referrer' variable
    t: Date.now()
  });

  fetch(`${base}?${trackingParams.toString()}`, {
    mode: 'no-cors',
    keepalive: true,
  });
}


function setLink(el, url) {
  const normalized = normalizeUrl(url);
  if (!normalized) {
    el.setAttribute("href", "#");
    el.setAttribute("aria-disabled", "true");
    el.classList.add("is-disabled");
    el.addEventListener("click", (e) => e.preventDefault());
    return;
  }

  el.setAttribute("href", normalized);
}

(function init() {
  const rsvpButton = document.getElementById("rsvpButton");
  const websiteButton = document.getElementById("websiteButton");
  const websiteUrlText = document.getElementById("websiteUrlText");

  const heroPhoto = document.querySelector(".hero-photo");
  const inviteImage = document.querySelector(".invite-image");

  attachImageFallback(
    heroPhoto,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="#f2f2f2" offset="0" />
          <stop stop-color="#e7eef7" offset="1" />
        </linearGradient>
      </defs>
      <rect width="1200" height="700" rx="34" fill="url(#g)" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#777" font-family="Inter, Arial" font-size="42">
        Add couple-photo.jpg
      </text>
    </svg>`,
  );

  attachImageFallback(
    inviteImage,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200">
      <defs>
        <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
          <stop stop-color="#e9f2fb" offset="0" />
          <stop stop-color="#ffffff" offset="1" />
        </linearGradient>
      </defs>
      <rect width="900" height="1200" rx="36" fill="url(#g2)" />
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#777" font-family="Inter, Arial" font-size="40">
        Add invite-art.jpg
      </text>
    </svg>`,
  );

  runIntroAnimation();
  logLinkClick('INVITE_LINK_OPEN','WEDDING_INVITE_OPEN');
  if (rsvpButton) {
    rsvpButton.addEventListener("click", (e) => {
      e.preventDefault(); // This stops the '#' from jumping the page to the top
      logLinkClick('RSVP_CLICKED', "WEDDING_INVITE_RSVP");     // Optional: Run your tracking
      window.open(CONFIG.rsvpUrl, "_blank", "noreferrer");
    });
  }
  if (websiteButton) setLink(websiteButton, CONFIG.weddingWebsiteUrl);

  const websiteText = normalizeUrl(CONFIG.weddingWebsiteUrl);
  if (websiteUrlText && websiteText) {
    websiteUrlText.textContent = websiteText.replace(/^https?:\/\//, "");
  }
})();
