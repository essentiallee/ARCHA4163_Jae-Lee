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

  // Map controls.
  map.addControl(
    new mapboxgl.NavigationControl(),
    "top-right"
  );

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
  panel.style.left = "16px";
  panel.style.top = "16px";
  panel.style.zIndex = "5";
  panel.style.width = "280px";
  panel.style.maxWidth = "calc(100% - 90px)";
  panel.style.padding = "14px";
  panel.style.background = "rgba(17, 17, 17, 0.92)";
  panel.style.color = "#f2f0e9";
  panel.style.border = "1px solid #d7ff00";
  panel.style.fontFamily =
    '"Barlow Condensed", Arial, sans-serif';
  panel.style.fontSize = "15px";
  panel.style.lineHeight = "1.3";
  panel.style.boxSizing = "border-box";
  panel.style.pointerEvents = "none";

  panel.innerHTML = `
    <strong style="color:#d7ff00; font-size:18px;">
      Gallery Walking Route
    </strong>

    <div
      id="route-instructions"
      style="margin-top:8px;"
    >
      Click one gallery for the start.<br>
      Click another gallery for the destination.
    </div>

    <div
      id="route-selection"
      style="margin-top:10px;"
    ></div>

    <div
      id="route-result"
      style="margin-top:10px; color:#d7ff00;"
    ></div>
  `;

  mapContainer.appendChild(panel);

  const selectionDisplay =
    panel.querySelector("#route-selection");

  const routeResultDisplay =
    panel.querySelector("#route-result");

  // First item = start.
  // Second item = destination.
  let selectedGalleries = [];

  let allGalleryData = null;

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

  function clearRoute() {
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

    if (selectedGalleries.length === 1) {
      selectionDisplay.innerHTML = `
        <div>
          <strong>START:</strong>
          ${escapeHTML(
            selectedGalleries[0].properties.gallery
          )}
        </div>

        <div
          style="margin-top:5px; opacity:0.8;"
        >
          Now select a destination.
        </div>
      `;
    }

    if (selectedGalleries.length === 2) {
      selectionDisplay.innerHTML = `
        <div>
          <strong>START:</strong>
          ${escapeHTML(
            selectedGalleries[0].properties.gallery
          )}
        </div>

        <div style="margin-top:5px;">
          <strong>END:</strong>
          ${escapeHTML(
            selectedGalleries[1].properties.gallery
          )}
        </div>
      `;
    }
  }

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
      offset: 12
    })
      .setLngLat(coordinates)
      .setHTML(`
        <div
          style="
            font-family:'Barlow Condensed', Arial, sans-serif;
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
    if (selectedGalleries.length !== 2) {
      return;
    }

    const start =
      selectedGalleries[0]
        .geometry.coordinates;

    const end =
      selectedGalleries[1]
        .geometry.coordinates;

    const coordinates =
      `${start[0]},${start[1]};` +
      `${end[0]},${end[1]}`;

    const directionsURL =
      "https://api.mapbox.com/" +
      "directions/v5/mapbox/walking/" +
      coordinates +
      "?alternatives=true" +
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

      if (
        !data.routes ||
        data.routes.length === 0
      ) {
        throw new Error(
          "No walking route was found."
        );
      }

      // Select the shortest-distance route
      // from the routes returned by Mapbox.
      const shortestRoute =
        data.routes.reduce(
          function (shortest, route) {
            if (
              route.distance <
              shortest.distance
            ) {
              return route;
            }

            return shortest;
          }
        );

      const routeFeature = {
        type: "Feature",
        properties: {},
        geometry:
          shortestRoute.geometry
      };

      map
        .getSource("walking-route")
        .setData(routeFeature);

      const distanceKm =
        (
          shortestRoute.distance / 1000
        ).toFixed(2);

      const durationMinutes =
        Math.round(
          shortestRoute.duration / 60
        );

      routeResultDisplay.innerHTML = `
        ${distanceKm} km<br>
        About ${durationMinutes}
        minutes walking
      `;

      fitMapToCoordinates(
        shortestRoute.geometry.coordinates,
        90
      );
    } catch (error) {
      console.error(error);

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

      return;
    }

    // After a completed route,
    // a third gallery starts a new route.
    if (selectedGalleries.length === 2) {
      selectedGalleries = [];

      clearRoute();
    }

    selectedGalleries.push(
      featureCopy
    );

    updateSelectedGalleries();

    if (selectedGalleries.length === 2) {
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
          "line-color": "#aa3c2d",
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
            "#aa3c2d"
          ],

          "circle-stroke-color":
            "#f2f0e9",

          "circle-stroke-width": 1.5
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
          "circle-color": "#d7ff00",
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
            "#f2f0e9",
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

  // --------------------------------------------------
  // 8. EXISTING HTML BUTTONS
  // --------------------------------------------------

  const zoomInButton =
    document.getElementById("zoomIn");

  const zoomOutButton =
    document.getElementById("zoomOut");

  const resetButton =
    document.getElementById("reset");

  if (zoomInButton) {
    zoomInButton.addEventListener(
      "click",
      function () {
        map.zoomIn();
      }
    );
  }

  if (zoomOutButton) {
    zoomOutButton.addEventListener(
      "click",
      function () {
        map.zoomOut();
      }
    );
  }

  if (resetButton) {
    resetButton.addEventListener(
      "click",
      function () {
        selectedGalleries = [];

        clearRoute();
        updateSelectedGalleries();

        if (allGalleryData) {
          const galleryCoordinates =
            allGalleryData.features
              .filter(function (
                feature
              ) {
                return (
                  feature.geometry &&
                  feature.geometry.type ===
                    "Point"
                );
              })
              .map(function (feature) {
                return (
                  feature.geometry
                    .coordinates
                );
              });

          fitMapToCoordinates(
            galleryCoordinates,
            70
          );
        } else {
          map.flyTo(initialView);
        }
      }
    );
  }
};

// Run the function immediately.
mapboxSketch();