"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import CustomInput from "./CustomInput";
import { useAppSelector } from "@/app/redux/hooks";
import { RootState } from "@/app/redux/store";

interface PriceFilterSliderProps {
  value?: [number, number];
  onChange?: (value: [number, number]) => void;
}

export default function PriceFilterSlider({ 
  value = [100, 49999], 
  onChange,
}: PriceFilterSliderProps) {
  const themeContext = useTheme() || {};
  const { textColor } = themeContext;
  const themeId = useAppSelector((state: RootState) => state.storeInfo?.themeId);
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const [inputMin, setInputMin] = useState(value[0].toString());
  const [inputMax, setInputMax] = useState(value[1].toString());
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastPropValueRef = useRef<[number, number]>(value);
  const hasUserInteractedRef = useRef(false);

  useEffect(() => {
    // Only update local state if the prop value has actually changed
    if (value[0] !== lastPropValueRef.current[0] || value[1] !== lastPropValueRef.current[1]) {
      lastPropValueRef.current = value;
      // If user hasn't interacted, sync the local value
      if (!hasUserInteractedRef.current) {
        setLocalValue(value);
        setInputMin(value[0].toString());
        setInputMax(value[1].toString());
      }
    }
  }, [value]);

  useEffect(() => {
    // Only call onChange if the user has actually interacted with the slider
    if (!hasUserInteractedRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange?.(localValue);
      // Reset interaction flag after calling onChange
      hasUserInteractedRef.current = false;
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (inputDebounceRef.current) clearTimeout(inputDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localValue]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    hasUserInteractedRef.current = true;
    const newMin = Math.min(+e.target.value, localValue[1]);
    setLocalValue([newMin, localValue[1]]);
    setInputMin(newMin.toString());
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    hasUserInteractedRef.current = true;
    const newMax = Math.max(+e.target.value, localValue[0]);
    setLocalValue([localValue[0], newMax]);
    setInputMax(newMax.toString());
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Allow empty string or numeric values
    if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
      setInputMin(inputValue);

      // Debounce the actual value update
      if (inputDebounceRef.current) clearTimeout(inputDebounceRef.current);
      inputDebounceRef.current = setTimeout(() => {
        let numValue = parseFloat(inputValue);
        if (isNaN(numValue)) {
          setInputMin(localValue[0].toString());
          return;
        }
        numValue = Math.max(100, numValue);
        numValue = Math.min(numValue, 49999); // cap at max

        const newMin = Math.min(numValue, localValue[1]);
        // const clampedValue = Math.max(0, Math.min(numValue, 49999));
        // const newMin = Math.min(clampedValue, localValue[1] - 500);
        hasUserInteractedRef.current = true;
        setLocalValue([newMin, localValue[1]]);
        setInputMin(newMin.toString());
      }, 1000);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Allow empty string or numeric values
    if (inputValue === "" || /^\d*\.?\d*$/.test(inputValue)) {
      setInputMax(inputValue);

      // Debounce the actual value update
      if (inputDebounceRef.current) clearTimeout(inputDebounceRef.current);
      inputDebounceRef.current = setTimeout(() => {
        const numValue = parseFloat(inputValue);
        if (isNaN(numValue)) {
          setInputMax(localValue[1].toString());
          return;
        }
        const clampedValue = Math.max(0, Math.min(numValue, 49999));
        const newMax = Math.max(clampedValue, localValue[0]);
        hasUserInteractedRef.current = true;
        setLocalValue([localValue[0], newMax]);
        setInputMax(newMax.toString());
      }, 1000);
    }
  };

  const handleMinInputBlur = () => {
    // Clear any pending debounce
    if (inputDebounceRef.current) {
      clearTimeout(inputDebounceRef.current);
    }
    const numValue = parseFloat(inputMin);
    if (isNaN(numValue) || inputMin === "") {
      setInputMin(localValue[0].toString());
      return;
    }
    const clampedValue = Math.max(100, Math.min(numValue, 49999));
    const newMin = Math.min(clampedValue, localValue[1]);
    hasUserInteractedRef.current = true;
    setLocalValue([newMin, localValue[1]]);
    setInputMin(newMin.toString());
  };

  const handleMaxInputBlur = () => {
    // Clear any pending debounce
    if (inputDebounceRef.current) {
      clearTimeout(inputDebounceRef.current);
    }
    const numValue = parseFloat(inputMax);
    if (isNaN(numValue) || inputMax === "") {
      setInputMax(localValue[1].toString());
      return;
    }
    const clampedValue = Math.max(100, Math.min(numValue, 49999));
    const newMax = Math.max(clampedValue, localValue[0]);
    hasUserInteractedRef.current = true;
    setLocalValue([localValue[0], newMax]);
    setInputMax(newMax.toString());
  };

  return (
    <div className="w-full">
      <div className="relative w-full h-2 md:h-1  rounded-full mb-5 sm:mb-3">
        <div
          className="absolute h-2 md:h-1 rounded-full"
          style={{
            left: `${(localValue[0] / 49999) * 100}%`,
            right: `${100 - (localValue[1] / 49999) * 100}%`,
            backgroundColor: textColor,
          }}
        />

        <input
          type="range"
          min="100"
          max="49999"
          step="0"
          value={localValue[0]}
          onChange={handleMinChange}
          style={{
            color:
              themeId === 3 || themeId === 4
                ? themeContext?.buttonBackgroundColor
                : themeId === 6
                ? "#10b981"
                : "#111111",
          }}
          className="absolute top-[-0.4rem] md:top-[-0.3rem] w-full bg-transparent appearance-none pointer-events-none
            touch-action-pan-y
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
            md:[&::-webkit-slider-thumb]:h-3 md:[&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5
            md:[&::-moz-range-thumb]:h-3 md:[&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black
            [&::-moz-range-thumb]:cursor-pointer
            z-2"
        />
        <input
          type="range"
          min="100"
          max="49999"
          step="0"
          value={localValue[1]}
          onChange={handleMaxChange}
          style={{
            color:
              themeId === 3 || themeId === 4
                ? themeContext?.buttonBackgroundColor
                : themeId === 6
                ? "#10b981"
                : "#111111",
          }}
          className="absolute top-[-0.4rem] md:top-[-0.3rem] w-full bg-transparent appearance-none pointer-events-none
            touch-action-pan-y
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:pointer-events-auto
            [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
            md:[&::-webkit-slider-thumb]:h-3 md:[&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:pointer-events-auto
            [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5
            md:[&::-moz-range-thumb]:h-3 md:[&::-moz-range-thumb]:w-3
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black
            [&::-moz-range-thumb]:cursor-pointer
            z-3"
        />
      </div>

      <div className="flex justify-between gap-6">
        <div className="w-1/2">
          <CustomInput
            type="text"
            value={inputMin}
            onChange={handleMinInputChange}
            onBlur={handleMinInputBlur}
            placeholder="100"
            inputMode="numeric"
            noDefaultPadding={true}
            inputClassName="w-full bg-transparent pl-8 pr-3 py-3"
            leftIcon={() => <span>₹</span>}
            style={{
              color: textColor,
              backgroundColor: themeContext?.backgroundColor,
            }}
          />
        </div>
        <div className="w-1/2">
          <CustomInput
            type="text"
            value={inputMax}
            onChange={handleMaxInputChange}
            onBlur={handleMaxInputBlur}
            placeholder="49999"
            inputMode="numeric"
            noDefaultPadding={true}
            inputClassName="w-full bg-transparent pl-8 pr-3 py-3"
            leftIcon={() => <span>₹</span>}
            style={{
              color: textColor,
              backgroundColor: themeContext?.backgroundColor,
            }}
          />
        </div>
      </div>
    </div>
  );
}

