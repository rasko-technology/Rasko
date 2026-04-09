"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  type Libraries,
} from "@react-google-maps/api";

const libraries: Libraries = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "280px",
  borderRadius: "12px",
};

const defaultCenter = { lat: 14.4674, lng: 78.8241 }; // Kadapa

interface LocationData {
  street: string;
  landmark: string;
  town: string;
  pincode: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

interface Prediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface Props {
  onLocationSelect: (location: LocationData) => void;
  initialCenter?: { lat: number; lng: number };
}

export function LocationPicker({ onLocationSelect, initialCenter }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    libraries,
  });

  const [markerPos, setMarkerPos] = useState(initialCenter || defaultCenter);
  const [searchValue, setSearchValue] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Init services when loaded
  useEffect(() => {
    if (!isLoaded) return;
    autocompleteServiceRef.current =
      new google.maps.places.AutocompleteService();
    geocoderRef.current = new google.maps.Geocoder();
  }, [isLoaded]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchPredictions = useCallback((input: string) => {
    if (!autocompleteServiceRef.current || input.length < 3) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    autocompleteServiceRef.current.getPlacePredictions(
      { input, componentRestrictions: { country: "in" } },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(
            results.map((r) => ({
              placeId: r.place_id,
              description: r.description,
              mainText: r.structured_formatting.main_text,
              secondaryText: r.structured_formatting.secondary_text,
            })),
          );
          setShowDropdown(true);
          setHighlightIndex(-1);
        } else {
          setPredictions([]);
          setShowDropdown(false);
        }
      },
    );
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => fetchPredictions(value), 300);
    },
    [fetchPredictions],
  );

  const selectPrediction = useCallback(
    async (prediction: Prediction) => {
      setShowDropdown(false);
      setSearchValue(prediction.description);
      setSelectedAddress(prediction.description);

      if (!geocoderRef.current) return;

      try {
        const res = await geocoderRef.current.geocode({
          placeId: prediction.placeId,
        });
        if (res.results[0]) {
          const result = res.results[0];
          const lat = result.geometry.location.lat();
          const lng = result.geometry.location.lng();
          setMarkerPos({ lat, lng });
          mapRef.current?.panTo({ lat, lng });
          mapRef.current?.setZoom(16);

          const location = extractAddress(
            result.address_components || [],
            result.formatted_address || prediction.description,
            lat,
            lng,
          );
          onLocationSelect(location);
        }
      } catch {
        // Geocoding failed
      }
    },
    [onLocationSelect],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown || predictions.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) => Math.min(prev + 1, predictions.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && highlightIndex >= 0) {
        e.preventDefault();
        selectPrediction(predictions[highlightIndex]);
      } else if (e.key === "Escape") {
        setShowDropdown(false);
      }
    },
    [showDropdown, predictions, highlightIndex, selectPrediction],
  );

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMarkerDragEnd = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarkerPos({ lat, lng });

      if (!geocoderRef.current) return;

      try {
        const res = await geocoderRef.current.geocode({
          location: { lat, lng },
        });
        if (res.results[0]) {
          const location = extractAddress(
            res.results[0].address_components || [],
            res.results[0].formatted_address || "",
            lat,
            lng,
          );
          setSearchValue("");
          setSelectedAddress(res.results[0].formatted_address || "");
          onLocationSelect(location);
        }
      } catch {
        onLocationSelect({
          street: "",
          landmark: "",
          town: "",
          pincode: "",
          fullAddress: "",
          lat,
          lng,
        });
      }
    },
    [onLocationSelect],
  );

  if (!isLoaded) {
    return (
      <div className="w-full h-[280px] rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center animate-pulse">
        <div className="flex items-center gap-2 text-surface-400 text-sm">
          <div className="w-5 h-5 border-2 border-surface-300 border-t-primary-500 rounded-full animate-spin" />
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search input with dropdown */}
      <div ref={wrapperRef} className="relative">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 z-10"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (predictions.length > 0) setShowDropdown(true);
            }}
            placeholder="Search for a location..."
            autoComplete="off"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white placeholder-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          />
        </div>

        {/* Predictions dropdown */}
        {showDropdown && predictions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-slide-up">
            {predictions.map((p, idx) => (
              <button
                key={p.placeId}
                type="button"
                onClick={() => selectPrediction(p)}
                className={`w-full text-left px-4 py-2.5 transition-colors cursor-pointer flex items-start gap-2.5 ${
                  idx === highlightIndex
                    ? "bg-primary-50 dark:bg-primary-500/10"
                    : "hover:bg-surface-50 dark:hover:bg-surface-800"
                }`}
              >
                <svg
                  className="w-4 h-4 text-surface-400 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                    {p.mainText}
                  </p>
                  <p className="text-xs text-surface-400 truncate">
                    {p.secondaryText}
                  </p>
                </div>
              </button>
            ))}
            <div className="px-4 py-1.5 border-t border-surface-100 dark:border-surface-800">
              <p className="text-[10px] text-surface-400 text-right">
                Powered by Google
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected address display */}
      {selectedAddress && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
          <svg
            className="w-4 h-4 text-primary-500 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            />
          </svg>
          <span className="text-sm text-surface-700 dark:text-surface-300 truncate">
            {selectedAddress}
          </span>
        </div>
      )}

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 shadow-sm">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={markerPos}
          zoom={14}
          onLoad={onMapLoad}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        >
          <Marker
            position={markerPos}
            draggable
            onDragEnd={onMarkerDragEnd}
            animation={google.maps.Animation.DROP}
          />
        </GoogleMap>
      </div>

      <p className="text-xs text-surface-400 flex items-center gap-1">
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
          />
        </svg>
        Drag the pin to adjust the exact location
      </p>
    </div>
  );
}

function extractAddress(
  components: google.maps.GeocoderAddressComponent[],
  formattedAddress: string,
  lat: number,
  lng: number,
): LocationData {
  let street = "";
  let landmark = "";
  let town = "";
  let pincode = "";

  for (const c of components) {
    if (
      c.types.includes("street_number") ||
      c.types.includes("route") ||
      c.types.includes("premise")
    ) {
      street = street ? `${street}, ${c.long_name}` : c.long_name;
    }
    if (
      c.types.includes("sublocality_level_1") ||
      c.types.includes("sublocality") ||
      c.types.includes("neighborhood")
    ) {
      landmark = c.long_name;
    }
    if (c.types.includes("locality")) {
      town = c.long_name;
    }
    if (c.types.includes("postal_code")) {
      pincode = c.long_name;
    }
  }

  return {
    street,
    landmark,
    town,
    pincode,
    fullAddress: formattedAddress,
    lat,
    lng,
  };
}
