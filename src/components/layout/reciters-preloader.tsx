"use client";

import { useEffect } from "react";
import { preload } from "swr";
import { fetchBayaan } from "@/lib/api";

const RECITERS_KEY = "reciters?page=1&limit=200";

export function RecitersPreloader(): null {
  useEffect(() => {
    preload(RECITERS_KEY, fetchBayaan);
  }, []);
  return null;
}
