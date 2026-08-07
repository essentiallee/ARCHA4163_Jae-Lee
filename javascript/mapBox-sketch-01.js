var mapboxSketch = function () {
  // --------------------------------------------------
  // 1. MAPBOX TOKEN AND MAP
  // --------------------------------------------------

  mapboxgl.accessToken =
    "pk.eyJ1IjoiamhsZWU5NTQyNCIsImEiOiJjbXJ3aHZtMDMwNHQ2MzVvbmJtMDAwNGNoIn0.xMXUOPBlO8ECCgjceMVfdA";

  const mapContainer = document.getElementById("mapbox-container-1");

  if (!mapContainer) {
    console.error(
      'Could not find an element with id="mapbox-container-1".'
    );
    return;
  }

  // Make sure the map has a visible height.
  mapContainer.style.position = "relative";

  if (mapContainer.offsetHeight < 100) {
    mapContainer.style.height = "650px";
  }

  const initialView = {
    center: [-73.9965, 40.7355],
    zoom: 12.5
  };

  const map = new mapboxgl.Map({
    container: "mapbox-container-1",
    style: "mapbox://styles/mapbox/light-v11",
    center: initialView.center,
    zoom: initialView.zoom
  });

  // Keep the map open for trackpad, mouse-wheel, and touch gestures.
  // The visible +/- zoom control is intentionally omitted.
  map.addControl(
    new mapboxgl.FullscreenControl(),
    "top-right"
  );

  map.addControl(
    new mapboxgl.ScaleControl({
      maxWidth: 100,
      unit: "metric"
    }),
    "bottom-left"
  );

  // --------------------------------------------------
  // 2. ROUTE INFORMATION PANEL
  // --------------------------------------------------

  const panel = document.createElement("div");

  panel.id = "gallery-route-panel";
  panel.style.position = "absolute";
  panel.style.left = "20px";
  panel.style.top = "100px";
  panel.style.zIndex = "5";
  panel.style.width = "280px";
  panel.style.maxWidth = "calc(100% - 90px)";
  panel.style.maxHeight = "280px";
  panel.style.overflowY = "auto";
  panel.style.padding = "14px";
  panel.style.background = "rgba(255, 255, 255, 0.96)";
  panel.style.color = "#111111";
  panel.style.border = "1px solid #42b6d1";
  panel.style.fontFamily =
    'Helvetica, Arial, sans-serif';
  panel.style.fontSize = "15px";
  panel.style.lineHeight = "1.3";
  panel.style.boxSizing = "border-box";
  panel.style.pointerEvents = "auto";

  panel.innerHTML = `
    <strong style="color:#42b6d1; font-size:18px;">
      Gallery Walking Route
    </strong>

    <div
      id="route-instructions"
      style="margin-top:8px;"
    >
      Click galleries in the order you want to visit them.<br>
      Click a selected gallery again to remove it.
    </div>

    <div
      id="timeline-focus"
      style="display:none; margin-top:10px; color:#42b6d1;"
    ></div>

    <div
      id="route-selection"
      style="margin-top:10px;"
    ></div>

    <div
      id="route-result"
      style="margin-top:10px; color:#42b6d1;"
    ></div>

    <div class="route-action-buttons">
      <button id="download-route" type="button" disabled>
        Download route CSV
      </button>

      <button id="reset-route" type="button" disabled>
        Reset route
      </button>
    </div>
  `;

  mapContainer.appendChild(panel);

  const selectionDisplay =
    panel.querySelector("#route-selection");

  const routeResultDisplay =
    panel.querySelector("#route-result");

  const timelineFocusDisplay =
    panel.querySelector("#timeline-focus");

  const downloadRouteButton =
    panel.querySelector("#download-route");

  const resetRouteButton =
    panel.querySelector("#reset-route");

  // First item = start.
  // Second item = destination.
  let selectedGalleries = [];

  let allGalleryData = null;
  let pendingTimelineFocus = null;
  let currentRoute = null;
  let routeRequestNumber = 0;

  // --------------------------------------------------
  // 3. HELPER FUNCTIONS
  // --------------------------------------------------

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function emptyFeatureCollection() {
    return {
      type: "FeatureCollection",
      features: []
    };
  }

  function galleryKey(feature) {
    const properties = feature.properties || {};
    const coordinates = feature.geometry.coordinates;

    return (
      properties.gallery_id ||
      `${properties.gallery}-${coordinates[0]}-${coordinates[1]}`
    );
  }

  function recordMapGalleryClick(feature) {
    const properties =
      feature.properties || {};

    window.dispatchEvent(
      new CustomEvent("gallery:clicked", {
        detail: {
          source: "map",
          galleryId:
            properties.gallery_id,
          galleryName:
            properties.gallery,
          area:
            properties.neighborhood,
          accessStatus:
            properties.current_access_status
        }
      })
    );
  }

  function broadcastMapGallerySelection() {
    window.dispatchEvent(
      new CustomEvent(
        "gallery:selection-changed",
        {
          detail: {
            galleryNames:
              selectedGalleries.map(
                function (feature) {
                  const properties =
                    feature.properties ||
                    {};

                  return (
                    properties
                      .timeline_gallery_name ||
                    properties.gallery
                  );
                }
              )
          }
        }
      )
    );
  }

  function normalizeTimelineGalleryName(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");
  }

  function focusGalleryFromTimeline(detail) {
    if (!detail || !detail.gallery) {
      return;
    }

    pendingTimelineFocus = detail;

    const focusedSource =
      map.getSource("focused-gallery");

    if (!allGalleryData || !focusedSource) {
      return;
    }

    const requestedName =
      normalizeTimelineGalleryName(
        detail.gallery
      );

    const focusedGallery =
      allGalleryData.features.find(
        function (feature) {
          return (
            normalizeTimelineGalleryName(
              feature.properties
                .timeline_gallery_name
            ) === requestedName
          );
        }
      );

    if (!focusedGallery) {
      console.warn(
        `No map location found for "${detail.gallery}".`
      );
      pendingTimelineFocus = null;
      return;
    }

    focusedSource.setData({
      type: "FeatureCollection",
      features: [focusedGallery]
    });

    mapContainer.dataset.focusedGallery =
      focusedGallery.properties.gallery_id;

    timelineFocusDisplay.style.display =
      "block";

    timelineFocusDisplay.innerHTML = `
      <strong>TIMELINE FOCUS:</strong><br>
      ${escapeHTML(
        focusedGallery.properties.gallery
      )}
      ${
        detail.show
          ? `<br><span style="color:#111111;">${escapeHTML(detail.show)}</span>`
          : ""
      }
    `;

    pendingTimelineFocus = null;

    mapContainer.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });

    map.once("moveend", function () {
      showGalleryPopup(
        focusedGallery
      );
    });

    map.flyTo({
      center:
        focusedGallery.geometry.coordinates,
      zoom: 16,
      duration: 1200,
      essential: true
    });
  }

  window.addEventListener(
    "gallery:focus",
    function (event) {
      focusGalleryFromTimeline(
        event.detail
      );
    }
  );

  function clearRoute() {
    routeRequestNumber += 1;
    currentRoute = null;
    downloadRouteButton.disabled = true;

    const routeSource =
      map.getSource("walking-route");

    if (routeSource) {
      routeSource.setData(
        emptyFeatureCollection()
      );
    }

    routeResultDisplay.textContent = "";
  }

  function updateSelectedGalleries() {
    const selectedSource =
      map.getSource("selected-galleries");

    if (selectedSource) {
      selectedSource.setData({
        type: "FeatureCollection",
        features: selectedGalleries
      });
    }

    if (selectedGalleries.length === 0) {
      selectionDisplay.innerHTML =
        "No galleries selected.";
    }

    resetRouteButton.disabled =
      selectedGalleries.length === 0;

    if (selectedGalleries.length > 0) {
      selectionDisplay.innerHTML = `
        <ol class="route-stop-list">
          ${selectedGalleries.map(
            function (gallery) {
              return `<li>${escapeHTML(gallery.properties.gallery)}</li>`;
            }
          ).join("")}
        </ol>
        ${
          selectedGalleries.length === 1
            ? '<div class="route-next-step">Select at least one more gallery.</div>'
            : '<div class="route-next-step">Click another gallery to add a stop.</div>'
        }
      `;
    }
  }

  function csvCell(value) {
    const text = String(value ?? "");
    return `"${text.replaceAll('"', '""')}"`;
  }

  function downloadRouteCSV() {
    if (!currentRoute || selectedGalleries.length < 2) {
      return;
    }

    const totalDistanceKm =
      (currentRoute.distance / 1000).toFixed(2);

    const totalWalkingMinutes =
      Math.round(currentRoute.duration / 60);

    const headings = [
      "stop",
      "gallery",
      "neighborhood",
      "address",
      "published_schedule",
      "access_status",
      "walk_to_next_minutes",
      "walk_to_next_km",
      "total_walking_minutes",
      "total_route_km"
    ];

    const rows = selectedGalleries.map(
      function (gallery, index) {
        const properties = gallery.properties || {};
        const nextLeg = currentRoute.legs?.[index];

        return [
          index + 1,
          properties.gallery,
          properties.neighborhood,
          properties.address,
          properties.hours_text,
          properties.current_access_status,
          nextLeg ? Math.round(nextLeg.duration / 60) : "",
          nextLeg ? (nextLeg.distance / 1000).toFixed(2) : "",
          totalWalkingMinutes,
          totalDistanceKm
        ].map(csvCell).join(",");
      }
    );

    const csv = [
      headings.map(csvCell).join(","),
      ...rows
    ].join("\n");

    const link = document.createElement("a");

    link.href =
      "data:text/csv;charset=utf-8," +
      encodeURIComponent("\uFEFF" + csv);
    link.download = `nyc-art-planner-route-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  downloadRouteButton.addEventListener(
    "click",
    downloadRouteCSV
  );

  function resetRoute() {
    selectedGalleries = [];
    clearRoute();
    updateSelectedGalleries();
    broadcastMapGallerySelection();

    if (!allGalleryData) {
      map.flyTo(initialView);
      return;
    }

    const galleryCoordinates = allGalleryData.features
      .filter(function (feature) {
        return (
          feature.geometry &&
          feature.geometry.type === "Point"
        );
      })
      .map(function (feature) {
        return feature.geometry.coordinates;
      });

    fitMapToCoordinates(galleryCoordinates, 70);
  }

  resetRouteButton.addEventListener(
    "click",
    resetRoute
  );

  function showGalleryPopup(feature) {
    const properties =
      feature.properties || {};

    const coordinates =
      feature.geometry.coordinates.slice();

    const galleryName = escapeHTML(
      properties.gallery || "Gallery"
    );

    const neighborhood = escapeHTML(
      properties.neighborhood || ""
    );

    const address = escapeHTML(
      properties.address ||
      "Address unavailable"
    );

    const hours = escapeHTML(
      properties.hours_text ||
      "Hours unavailable"
    );

    const status = escapeHTML(
      (
        properties.current_access_status ||
        "status unavailable"
      ).replaceAll("_", " ")
    );

    new mapboxgl.Popup({
      offset: 12,
      closeOnMove: false
    })
      .setLngLat(coordinates)
      .setHTML(`
        <div
          style="
            font-family:Helvetica, Arial, sans-serif;
            max-width:240px;
          "
        >
          <h3
            style="margin:0 18px 8px 0;"
          >
            ${galleryName}
          </h3>

          ${
            neighborhood
              ? `
                <div>
                  <strong>Area:</strong>
                  ${neighborhood}
                </div>
              `
              : ""
          }

          <div>
            <strong>Address:</strong>
            ${address}
          </div>

          <div>
            <strong>Hours:</strong>
            ${hours}
          </div>

          <div>
            <strong>Status:</strong>
            ${status}
          </div>
        </div>
      `)
      .addTo(map);
  }

  function fitMapToCoordinates(
    coordinates,
    padding = 80
  ) {
    if (!coordinates.length) {
      return;
    }

    const bounds = coordinates.reduce(
      function (
        currentBounds,
        coordinate
      ) {
        return currentBounds.extend(
          coordinate
        );
      },
      new mapboxgl.LngLatBounds(
        coordinates[0],
        coordinates[0]
      )
    );

    map.fitBounds(bounds, {
      padding: padding,
      duration: 1000,
      maxZoom: 15
    });
  }

  // --------------------------------------------------
  // 4. CREATE WALKING ROUTE
  // --------------------------------------------------

  async function createWalkingRoute() {
    if (selectedGalleries.length < 2) {
      return;
    }

    const thisRequest = ++routeRequestNumber;
    currentRoute = null;
    downloadRouteButton.disabled = true;

    const coordinates = selectedGalleries
      .map(function (gallery) {
        return gallery.geometry.coordinates.join(",");
      })
      .join(";");

    const directionsURL =
      "https://api.mapbox.com/" +
      "directions/v5/mapbox/walking/" +
      coordinates +
      "?steps=true" +
      "&geometries=geojson" +
      "&overview=full" +
      `&access_token=${mapboxgl.accessToken}`;

    routeResultDisplay.textContent =
      "Calculating walking route...";

    try {
      const response =
        await fetch(directionsURL);

      if (!response.ok) {
        throw new Error(
          `Mapbox request failed: ${response.status}`
        );
      }

      const data =
        await response.json();

      if (thisRequest !== routeRequestNumber) {
        return;
      }

      if (
        !data.routes ||
        data.routes.length === 0
      ) {
        throw new Error(
          "No walking route was found."
        );
      }

      const walkingRoute = data.routes[0];
      currentRoute = walkingRoute;

      const routeFeature = {
        type: "Feature",
        properties: {},
        geometry:
          walkingRoute.geometry
      };

      map
        .getSource("walking-route")
        .setData(routeFeature);

      const distanceKm =
        (
          walkingRoute.distance / 1000
        ).toFixed(2);

      const durationMinutes =
        Math.round(
          walkingRoute.duration / 60
        );

      routeResultDisplay.innerHTML = `
        ${selectedGalleries.length} stops<br>
        ${distanceKm} km total<br>
        About ${durationMinutes}
        minutes walking
      `;

      downloadRouteButton.disabled = false;

      fitMapToCoordinates(
        walkingRoute.geometry.coordinates,
        90
      );
    } catch (error) {
      if (thisRequest !== routeRequestNumber) {
        return;
      }

      console.error(error);

      currentRoute = null;
      downloadRouteButton.disabled = true;
      routeResultDisplay.textContent =
        "The walking route could not be calculated.";
    }
  }

  // --------------------------------------------------
  // 5. SELECT A GALLERY
  // --------------------------------------------------

  function selectGallery(feature) {
    // Copy the feature so it can be stored
    // in the selected-galleries source.
    const featureCopy = {
      type: "Feature",

      properties: {
        ...feature.properties
      },

      geometry: {
        type: "Point",

        coordinates:
          feature.geometry.coordinates.slice()
      }
    };

    const clickedKey =
      galleryKey(featureCopy);

    const existingIndex =
      selectedGalleries.findIndex(
        function (gallery) {
          return (
            galleryKey(gallery) ===
            clickedKey
          );
        }
      );

    // Clicking a selected gallery
    // removes it from the route.
    if (existingIndex !== -1) {
      selectedGalleries.splice(
        existingIndex,
        1
      );

      clearRoute();
      updateSelectedGalleries();
      broadcastMapGallerySelection();

      if (selectedGalleries.length >= 2) {
        createWalkingRoute();
      }

      return;
    }

    if (selectedGalleries.length >= 25) {
      routeResultDisplay.textContent =
        "A route can include up to 25 galleries.";
      return;
    }

    selectedGalleries.push(
      featureCopy
    );

    updateSelectedGalleries();
    broadcastMapGallerySelection();

    if (selectedGalleries.length >= 2) {
      createWalkingRoute();
    }
  }

  // --------------------------------------------------
  // 6. LOAD THE GALLERY GEOJSON
  // --------------------------------------------------

  map.on("load", async function () {
    try {
      const response = await fetch(
        "data/ny-gallery-locations-hours.geojson"
      );

      if (!response.ok) {
        throw new Error(
          `GeoJSON failed to load: ${response.status}`
        );
      }

      allGalleryData =
        await response.json();

      // Original gallery points.
      map.addSource("galleries", {
        type: "geojson",
        data: allGalleryData
      });

      // Gallery focused from a timeline click.
      map.addSource("focused-gallery", {
        type: "geojson",
        data: emptyFeatureCollection()
      });

      // Selected start and destination.
      map.addSource(
        "selected-galleries",
        {
          type: "geojson",
          data: emptyFeatureCollection()
        }
      );

      // Walking route line.
      map.addSource("walking-route", {
        type: "geojson",
        data: emptyFeatureCollection()
      });

      // --------------------------------------------------
      // WALKING ROUTE LINE
      // --------------------------------------------------

      map.addLayer({
        id: "walking-route-line",

        type: "line",

        source: "walking-route",

        layout: {
          "line-join": "round",
          "line-cap": "round"
        },

        paint: {
          "line-color": "#f24caf",
          "line-width": 6,
          "line-opacity": 0.9
        }
      });

      // --------------------------------------------------
      // NORMAL GALLERY POINTS
      // --------------------------------------------------

      map.addLayer({
        id: "gallery-points",

        type: "circle",

        source: "galleries",

        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            4,
            15,
            8
          ],

          // Open galleries are black.
          // Other statuses are red.
          "circle-color": [
            "case",

            [
              "==",
              [
                "get",
                "current_access_status"
              ],
              "open"
            ],

            "#111111",
            "#42b6d1"
          ],

          "circle-stroke-color":
            "#ffffff",

          "circle-stroke-width": 1.5
        }
      });

      // --------------------------------------------------
      // TIMELINE-FOCUSED GALLERY HIGHLIGHT
      // --------------------------------------------------

      map.addLayer({
        id: "focused-gallery-point",

        type: "circle",

        source: "focused-gallery",

        paint: {
          "circle-radius": 16,
          "circle-color":
            "rgba(0, 0, 0, 0)",
          "circle-stroke-color":
            "#42b6d1",
          "circle-stroke-width": 5
        }
      });

      // --------------------------------------------------
      // SELECTED GALLERY HIGHLIGHT
      // --------------------------------------------------

      map.addLayer({
        id: "selected-gallery-points",

        type: "circle",

        source: "selected-galleries",

        paint: {
          "circle-radius": 11,
          "circle-color": "#f24caf",
          "circle-stroke-color":
            "#111111",
          "circle-stroke-width": 3
        }
      });

      // --------------------------------------------------
      // GALLERY NAME LABELS
      // --------------------------------------------------

      map.addLayer({
        id: "gallery-labels",

        type: "symbol",

        source: "galleries",

        minzoom: 11,

        layout: {
          "text-field": [
            "get",
            "gallery"
          ],

          "text-font": [
            "DIN Pro Medium",
            "Arial Unicode MS Regular"
          ],

          "text-size": [
            "interpolate",
            ["linear"],
            ["zoom"],
            11,
            11,
            15,
            14
          ],

          "text-offset": [0, 1.25],

          "text-anchor": "top",

          "text-allow-overlap": false
        },

        paint: {
          "text-color": "#111111",
          "text-halo-color":
            "#ffffff",
          "text-halo-width": 1.5
        }
      });

      updateSelectedGalleries();

      // Zoom to include all gallery locations.
      const galleryCoordinates =
        allGalleryData.features
          .filter(function (feature) {
            return (
              feature.geometry &&
              feature.geometry.type ===
                "Point"
            );
          })
          .map(function (feature) {
            return (
              feature.geometry.coordinates
            );
          });

      fitMapToCoordinates(
        galleryCoordinates,
        70
      );

      if (pendingTimelineFocus) {
        focusGalleryFromTimeline(
          pendingTimelineFocus
        );
      }
    } catch (error) {
      console.error(error);

      routeResultDisplay.textContent =
        "Gallery data could not be loaded.";
    }
  });

  // --------------------------------------------------
  // 7. CLICK INTERACTION
  // --------------------------------------------------

  map.on("click", function (event) {
    if (
      !map.getLayer("gallery-labels") ||
      !map.getLayer("gallery-points")
    ) {
      return;
    }

    const clickedFeatures =
      map.queryRenderedFeatures(
        event.point,
        {
          layers: [
            "gallery-labels",
            "gallery-points"
          ]
        }
      );

    if (clickedFeatures.length === 0) {
      return;
    }

    const clickedFeature =
      clickedFeatures[0];

    recordMapGalleryClick(
      clickedFeature
    );

    showGalleryPopup(
      clickedFeature
    );

    selectGallery(
      clickedFeature
    );
  });

  // Show the pointer cursor over
  // gallery points and names.
  map.on("mousemove", function (event) {
    if (
      !map.getLayer("gallery-labels") ||
      !map.getLayer("gallery-points")
    ) {
      return;
    }

    const hoveredFeatures =
      map.queryRenderedFeatures(
        event.point,
        {
          layers: [
            "gallery-labels",
            "gallery-points"
          ]
        }
      );

    if (hoveredFeatures.length > 0) {
      map.getCanvas().style.cursor =
        "pointer";
    } else {
      map.getCanvas().style.cursor =
        "";
    }
  });

};

// Run the function immediately.
mapboxSketch();
