import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { COLORS, SEARCH_ZOOM_LEVEL, MARKER_ZOOM_LEVEL } from "../../constants/parkingConstants";

const SearchField = ({ token }) => {
  const map = useMap();

  useEffect(() => {
    if (!token) return;

    const searchMarkers = [];

    const createCustomIcon = () =>
      new L.Icon({
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

    const clearSearchMarkers = () => {
      searchMarkers.forEach((marker) => map.removeLayer(marker));
      searchMarkers.length = 0;
    };

    const createPopupContent = (label, className, y, x) => `
      <div style="text-align: center; min-width: 200px;">
        <b style="font-size: 14px;">${label}</b><br/>
        <small style="color: #666;">${className || "Location"}</small>
        <div style="margin-top: 8px;">
          <button onclick="window.dispatchEvent(new CustomEvent('zoomToLocation', { detail: { lat: ${y}, lng: ${x} } }))" 
            style="background: ${COLORS.primary}; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">
            Zoom Here
          </button>
        </div>
      </div>
    `;

    const addSearchMarker = (result, openPopup = false) => {
      const { x, y, label, raw } = result;
      
      if (isNaN(y) || isNaN(x)) return;

      const marker = L.marker([y, x], {
        icon: createCustomIcon(),
        title: label,
      })
        .addTo(map)
        .bindPopup(createPopupContent(label, raw?.class, y, x));

      marker.on("click", function (e) {
        this.openPopup();
        map.setView(e.latlng, MARKER_ZOOM_LEVEL);
      });

      if (openPopup) {
        marker.openPopup();
      }

      searchMarkers.push(marker);
    };

    const handleSearch = async (query, showAllResults = false) => {
      try {
        const provider = new OpenStreetMapProvider();
        const results = await provider.search({ query });

        if (results && results.length > 0) {
          clearSearchMarkers();

          const firstResult = results[0];
          
          if (!showAllResults) {
            map.setView([firstResult.y, firstResult.x], SEARCH_ZOOM_LEVEL);
          }

          addSearchMarker(firstResult, !showAllResults);

          // Add additional markers for main search
          if (!showAllResults && results.length > 1) {
            results.slice(1, 5).forEach((result) => addSearchMarker(result));
          }
        } else if (!showAllResults) {
          clearSearchMarkers();
          const noResultsMarker = L.marker(map.getCenter(), {
            title: "No results found",
          })
            .addTo(map)
            .bindPopup(`
              <div style="text-align: center;">
                <b>No results found</b><br/>
                <small>Try a different search term</small>
              </div>
            `)
            .openPopup();

          noResultsMarker.on("click", function (e) {
            this.openPopup();
          });

          searchMarkers.push(noResultsMarker);
        }

        return results;
      } catch (error) {
        console.error("Search error:", error);

        if (!showAllResults) {
          clearSearchMarkers();
          const errorMarker = L.marker(map.getCenter(), {
            title: "Search Error",
          })
            .addTo(map)
            .bindPopup(`
              <div style="text-align: center; color: red;">
                <b>Search Error</b><br/>
                <small>Please try again</small>
              </div>
            `)
            .openPopup();

          errorMarker.on("click", function (e) {
            this.openPopup();
          });

          searchMarkers.push(errorMarker);
        }

        return [];
      }
    };

    // Create search control
    const searchContainer = L.DomUtil.create(
      "div",
      "leaflet-bar leaflet-control custom-search-container"
    );
    searchContainer.style.backgroundColor = "white";
    searchContainer.style.borderRadius = "4px";
    searchContainer.style.padding = "5px";
    searchContainer.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
    searchContainer.style.position = "relative";

    searchContainer.innerHTML = `
      <div style="display: flex; align-items: center; position: relative;">
        <input 
          type="text" 
          placeholder="Search for parking place..." 
          style="
            width: 100%;
            max-width:300px; 
            padding: 8px 12px; 
            border: 1px solid #ccc; 
            border-radius: 4px 0 0 4px;
            border-right: none;
            outline: none;
            font-size: 14px;
          "
        />
        <button 
          style="
            padding: 8px 16px;
            background: ${COLORS.primary};
            color: white;
            border: 1px solid ${COLORS.primary};
            borderRadius: 0 4px 4px 0;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
          "
        >
          Search
        </button>
      </div>
      <div class="search-suggestions" style="
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ccc;
        border-top: none;
        borderRadius: 0 0 4px 4px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      "></div>
    `;

    const searchInput = searchContainer.querySelector("input");
    const searchButton = searchContainer.querySelector("button");
    const suggestionsDropdown = searchContainer.querySelector(
      ".search-suggestions"
    );

    const showSuggestions = (results) => {
      if (!results || results.length === 0) {
        suggestionsDropdown.style.display = "none";
        return;
      }

      const suggestionsHTML = results
        .slice(0, 8)
        .map(
          (result) => `
        <div class="suggestion-item" style="
          padding: 10px 12px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s;
        " data-label="${result.label.replace(/"/g, "&quot;")}">
          <div style="font-weight: 500; font-size: 13px;">${result.label}</div>
          <div style="font-size: 11px; color: #666; margin-top: 2px;">
            ${result.raw?.type || result.raw?.class || "Location"}
          </div>
        </div>
      `
        )
        .join("");

      suggestionsDropdown.innerHTML = suggestionsHTML;
      suggestionsDropdown.style.display = "block";

      suggestionsDropdown
        .querySelectorAll(".suggestion-item")
        .forEach((item) => {
          item.addEventListener("click", () => {
            const label = item.getAttribute("data-label");
            searchInput.value = label;
            suggestionsDropdown.style.display = "none";
            handleSearch(label);
          });

          item.addEventListener("mouseenter", () => {
            item.style.backgroundColor = "#f5f5f5";
          });

          item.addEventListener("mouseleave", () => {
            item.style.backgroundColor = "white";
          });
        });
    };

    const hideSuggestions = () => {
      suggestionsDropdown.style.display = "none";
    };

    searchButton.addEventListener("click", () => {
      if (searchInput.value.trim().length > 0) {
        hideSuggestions();
        handleSearch(searchInput.value.trim());
      }
    });

    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && searchInput.value.trim().length > 0) {
        hideSuggestions();
        handleSearch(searchInput.value.trim());
      }
    });

    let timeoutId;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(timeoutId);
      const query = e.target.value.trim();

      if (query.length > 2) {
        timeoutId = setTimeout(async () => {
          const results = await handleSearch(query, true);
          showSuggestions(results);
        }, 300);
      } else {
        hideSuggestions();
      }
    });

    const handleOutsideClick = (e) => {
      if (!searchContainer.contains(e.target)) {
        hideSuggestions();
      }
    };

    document.addEventListener("click", handleOutsideClick);

    searchInput.addEventListener("blur", () => {
      setTimeout(hideSuggestions, 200);
    });

    L.Control.CustomSearch = L.Control.extend({
      onAdd: function (map) {
        return searchContainer;
      },

      onRemove: function (map) {
        clearSearchMarkers();
        document.removeEventListener("click", handleOutsideClick);
      },
    });

    new L.Control.CustomSearch({ position: "topright" }).addTo(map);

    return () => {
      clearSearchMarkers();
      if (searchContainer.parentNode) {
        searchContainer.parentNode.removeChild(searchContainer);
      }
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [map, token]);

  return null;
};

export default SearchField;
