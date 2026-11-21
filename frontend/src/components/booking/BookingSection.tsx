import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cinemasApi, getErrorMessage } from '../../api/client';
import type { BookingQuote, Cinema } from '../../types';
import { Loader } from '../common/Loader';
import { AddCinemaForm } from './AddCinemaForm';
import { BookingQuoteForm } from './BookingQuoteForm';
import { BookingQuoteResult } from './BookingQuoteResult';

export function BookingSection() {
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loadingCinemas, setLoadingCinemas] = useState(true);
  const [chosenCinemaId, setChosenCinemaId] = useState<string>('');
  const [groupSize, setGroupSize] = useState<number>(11);
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [calculating, setCalculating] = useState(false);

  const loadCinemas = useCallback(async () => {
    const data = await cinemasApi.getAll();
    setCinemas(data);
  }, []);

  useEffect(() => {
    cinemasApi
      .getAll()
      .then((data) => setCinemas(data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoadingCinemas(false));
  }, []);

  const selectedCinemaId = chosenCinemaId || cinemas[0]?.id || '';

  useEffect(() => {
    if (!selectedCinemaId || groupSize < 1 || groupSize > 10000) return;
    let cancelled = false;

    async function fetchQuote() {
      try {
        const data = await cinemasApi.getBookingQuote(
          selectedCinemaId,
          groupSize,
        );
        if (!cancelled) {
          setQuote(data);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(getErrorMessage(err));
        }
      }
    }

    void fetchQuote();
    return () => {
      cancelled = true;
    };
  }, [selectedCinemaId, groupSize]);

  async function handleCalculateQuote(e: FormEvent) {
    e.preventDefault();
    if (!selectedCinemaId) return;

    setCalculating(true);
    try {
      const data = await cinemasApi.getBookingQuote(
        selectedCinemaId,
        Number(groupSize),
      );
      setQuote(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setQuote(null);
    } finally {
      setCalculating(false);
    }
  }

  async function handleCinemaCreated(cinema: Cinema) {
    toast.success(`Added cinema "${cinema.name}".`);
    await loadCinemas();
    setChosenCinemaId(cinema.id);
  }

  if (loadingCinemas) {
    return <Loader />;
  }

  return (
    <div className="space-y-8">
      <BookingQuoteForm
        cinemas={cinemas}
        selectedCinemaId={selectedCinemaId}
        groupSize={groupSize}
        loading={calculating}
        onSelectCinema={setChosenCinemaId}
        onChangeGroupSize={setGroupSize}
        onSubmit={handleCalculateQuote}
      />

      {quote && <BookingQuoteResult quote={quote} />}

      <AddCinemaForm
        onCreated={handleCinemaCreated}
        onError={(msg) => toast.error(msg)}
      />
    </div>
  );
}
