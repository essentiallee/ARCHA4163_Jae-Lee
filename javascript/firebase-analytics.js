import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
  getAnalytics,
  isSupported,
  logEvent
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey:
    "AIzaSyDCgGgOVzSkdOVhpRJhXTPpxv-xsZN03nY",
  authDomain:
    "art-map-nyc.firebaseapp.com",
  projectId:
    "art-map-nyc",
  storageBucket:
    "art-map-nyc.firebasestorage.app",
  messagingSenderId:
    "262409793649",
  appId:
    "1:262409793649:web:30fcf672507d2b0698abd0",
  measurementId:
    "G-X7802SBDYR"
};

const app = initializeApp(firebaseConfig);
const pendingGalleryClicks = [];
const isLocalPreview =
  window.location.hostname ===
    "localhost" ||
  window.location.hostname ===
    "127.0.0.1" ||
  window.location.protocol ===
    "file:";

let analytics = null;

function analyticsValue(value) {
  return String(value || "")
    .trim()
    .slice(0, 100);
}

function recordGalleryClick(detail) {
  const eventParameters = {
    gallery_name:
      analyticsValue(detail.galleryName),
    interaction_source:
      analyticsValue(detail.source)
  };

  if (detail.galleryId) {
    eventParameters.gallery_id =
      analyticsValue(detail.galleryId);
  }

  if (detail.showName) {
    eventParameters.show_name =
      analyticsValue(detail.showName);
  }

  if (detail.area) {
    eventParameters.gallery_area =
      analyticsValue(detail.area);
  }

  if (detail.accessStatus) {
    eventParameters.access_status =
      analyticsValue(detail.accessStatus);
  }

  if (isLocalPreview) {
    console.info(
      "Firebase gallery_click preview",
      JSON.stringify(eventParameters)
    );
    return;
  }

  if (!analytics) {
    pendingGalleryClicks.push(
      eventParameters
    );
    return;
  }

  logEvent(
    analytics,
    "gallery_click",
    eventParameters
  );
}

window.addEventListener(
  "gallery:clicked",
  function (event) {
    recordGalleryClick(
      event.detail || {}
    );
  }
);

isSupported()
  .then(function (supported) {
    if (!supported) {
      return;
    }

    analytics = getAnalytics(app);

    pendingGalleryClicks.splice(0)
      .forEach(function (eventParameters) {
        logEvent(
          analytics,
          "gallery_click",
          eventParameters
        );
      });
  })
  .catch(function (error) {
    console.warn(
      "Firebase Analytics could not start.",
      error
    );
  });
