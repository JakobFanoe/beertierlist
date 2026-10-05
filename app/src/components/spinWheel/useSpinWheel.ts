import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Option } from '../../services/wheelService';
import {
  useCreateWheelOptions,
  useDeleteWheelOption,
  useWheelOptions,
} from '../../services/useWheelOptions';
import { cryptoRandom, drawWheel, easeOut, WHEEL_COLORS } from './wheelDrawing';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export default function useSpinWheel() {
  const [error, setError] = useState<string | null>(null);
  const optionsQuery = useWheelOptions();
  const addOptionsMutation = useCreateWheelOptions();
  const removeOptionMutation = useDeleteWheelOption();
  const entries: Option[] = useMemo(() => optionsQuery.data ?? [], [optionsQuery.data]);
  const [searchQuery, setSearchQuery] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [currentWinner, setCurrentWinner] = useState('');
  const [currentWinnerColor, setCurrentWinnerColor] = useState('#3369e8');
  const [spinning, setSpinning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (optionsQuery.error) setError(getErrorMessage(optionsQuery.error));
  }, [optionsQuery.error]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (context) drawWheel(context, entries, angleRef.current);
  }, [entries]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const filteredEntries = useMemo(
    () =>
      entries
        .filter((entry) => entry.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [entries, searchQuery],
  );

  const spin = useCallback(() => {
    if (spinning || entries.length < 2) return;

    const winnerIndex = Math.floor(cryptoRandom() * entries.length);
    const slice = (Math.PI * 2) / entries.length;
    const fullSpins = 5 + Math.floor(cryptoRandom() * 4);
    const targetSegmentMid = winnerIndex * slice + slice / 2;
    const targetAngle =
      fullSpins * Math.PI * 2 +
      (Math.PI * 2 - targetSegmentMid) -
      (angleRef.current % (Math.PI * 2)) -
      Math.PI / 2;
    const duration = 4000 + cryptoRandom() * 1500;
    const startAngle = angleRef.current;
    const startTime = performance.now();

    setSpinning(true);
    const frame = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      angleRef.current = startAngle + targetAngle * easeOut(progress);
      const context = canvasRef.current?.getContext('2d');
      if (context) drawWheel(context, entries, angleRef.current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      setSpinning(false);
      const winner = entries[winnerIndex];
      setCurrentWinner(winner.name);
      setCurrentWinnerColor(WHEEL_COLORS[winnerIndex % WHEEL_COLORS.length]);
      setHistory((previous) => [winner.name, ...previous].slice(0, 10));
      setWinnerModalOpen(true);
    };

    rafRef.current = requestAnimationFrame(frame);
  }, [entries, spinning]);

  const addOption = useCallback(
    async (name: string) => {
      if (!name) return;
      try {
        setError(null);
        await addOptionsMutation.mutateAsync([name]);
      } catch (createError) {
        setError(getErrorMessage(createError));
      }
    },
    [addOptionsMutation],
  );

  const importOptions = useCallback(
    async (names: string[]) => {
      if (names.length === 0) return false;
      try {
        setError(null);
        await addOptionsMutation.mutateAsync(names);
        return true;
      } catch (importError) {
        setError(getErrorMessage(importError));
        return false;
      }
    },
    [addOptionsMutation],
  );

  const removeOption = useCallback(
    async (name: string) => {
      const option = entries.find((entry) => entry.name === name);
      if (!option) return;

      try {
        setError(null);
        await removeOptionMutation.mutateAsync(option.id);
      } catch (deleteError) {
        setError(getErrorMessage(deleteError));
      }
    },
    [entries, removeOptionMutation],
  );

  const removeWinner = useCallback(() => {
    if (!currentWinner) return;
    angleRef.current = 0;
    setWinnerModalOpen(false);
    void removeOption(currentWinner);
  }, [currentWinner, removeOption]);

  return {
    addOption,
    canvasRef,
    currentWinner,
    currentWinnerColor,
    entries,
    error,
    filteredEntries,
    history,
    importOptions,
    isFetching: optionsQuery.isFetching,
    isLoading: optionsQuery.isLoading,
    removeOption,
    removeWinner,
    setError,
    setSearchQuery,
    setWinnerModalOpen,
    spin,
    spinning,
    winnerModalOpen,
  };
}
