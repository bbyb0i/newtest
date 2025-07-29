import { useState, useEffect } from 'react';
import { fetchArtistData, fetchArtistSummary } from '../services/googleSheets';
import { TikTokSound, ArtistSummary } from '../types';

export function useArtistSummary(artist: 'bnyx' | 'zukenee') {
  const [summary, setSummary] = useState<ArtistSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const result = await fetchArtistSummary(artist);
        if (!cancelled) setSummary(result);
      } catch (err: any) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [artist]);

  return { summary, loading, error };
}

export function useArtistData(artist: 'bnyx' | 'zukenee') {
  const [data, setData] = useState<TikTokSound[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const result = await fetchArtistData(artist);
        if (!cancelled) setData(result);
      } catch (err: any) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [artist]);

  return { data, loading, error };
}