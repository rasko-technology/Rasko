"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useJsApiLoader, type Libraries } from "@react-google-maps/api";

const libraries: Libraries = ["places"];

interface AddressResult {
  address: string;
  city: string;
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
  onSelect: (result: AddressResult) => void;
  placeholder?: string;
  inputClassName?: string;
}

export function AddressAutocomplete({
  onSelect,
  placeholder = "Search for your address...",
  inputClassName,
}: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    libraries,
  });

  const [searchValue, setSearchValue] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);

  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoaded) return;
    autocompleteServiceRef.current =
      new google.maps.places.AutocompleteService();
    geocoderRef.current = new google.maps.Geocoder();
  }, [isLoaded]);

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

      if (!geocoderRef.current) return;

      try {
        const res = await geocoderRef.current.geocode({
          placeId: prediction.placeId,
        });
        if (res.results[0]) {
          const result = res.results[0];
          const lat = result.geometry.location.lat();
          const lng = result.geometry.location.lng();
          const components = result.address_components || [];

          let address = "";
          let city = "";
          let pincode = "";

          for (const c of components) {
            if (
              c.types.includes("street_number") ||
              c.types.includes("route") ||
              c.types.includes("premise") ||
              c.types.includes("sublocality_level_1") ||
              c.types.includes("sublocality")
            ) {
              address = address ? `${address}, ${c.long_name}` : c.long_name;
            }
            if (c.types.includes("locality")) {
              city = c.long_name;
            }
            if (c.types.includes("postal_code")) {
              pincode = c.long_name;
            }
          }

          onSelect({
            address,
            city,
            pincode,
            fullAddress: result.formatted_address || prediction.description,
            lat,
            lng,
          });
        }
      } catch {
        // Geocoding failed silently
      }
    },
    [onSelect],
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

  const defaultInputClass =
    "w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface-800/50 border border-surface-600/50 text-white placeholder-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors text-sm";

  return (
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
          placeholder={placeholder}
          autoComplete="off"
          className={inputClassName || defaultInputClass}
        />
      </div>

      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-surface-900 border border-surface-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {predictions.map((p, idx) => (
            <button
              key={p.placeId}
              type="button"
              onClick={() => selectPrediction(p)}
              className={`w-full text-left px-4 py-2.5 transition-colors cursor-pointer flex items-start gap-2.5 ${
                idx === highlightIndex
                  ? "bg-primary-500/10"
                  : "hover:bg-surface-800"
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
                <p className="text-sm font-medium text-white truncate">
                  {p.mainText}
                </p>
                <p className="text-xs text-surface-400 truncate">
                  {p.secondaryText}
                </p>
              </div>
            </button>
          ))}
          <div className="px-4 py-1.5 border-t border-surface-800">
            <p className="text-[10px] text-surface-500 text-right">
              Powered by Google
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
