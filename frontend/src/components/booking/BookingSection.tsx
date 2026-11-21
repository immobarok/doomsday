import { type FormEvent, useCallback, useEffect, useState } from 'react';
import { cinemasApi, getErrorMessage } from '../../api/client';
import type { BookingQuote, Cinema } from '../../types';
import { Alert } from '../common/Alert';
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadCinemas = useCallback(async () => {
    const data = await cinemasApi.getAll();
    setCinemas(data);
  }, []);

  useEffect(() => {
    cinemasApi
      .getAll()
      .then((data) => setCinemas(data))
      .catch((err) => setError(getErrorMessage(err)))
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
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
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
    setError(null);
    try {
      const data = await cinemasApi.getBookingQuote(
        selectedCinemaId,
        Number(groupSize),
      );
      setQuote(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setQuote(null);
    } finally {
      setCalculating(false);
    }
  }

  async function handleCinemaCreated(cinema: Cinema) {
    setError(null);
    setSuccess(`Added cinema "${cinema.name}".`);
    await loadCinemas();
    setChosenCinemaId(cinema.id);
  }

  if (loadingCinemas) {
    return <Loader />;
  }

  return (
    <div className="space-y-8">
      {error && (
        <Alert type="error" message={error} onDismiss={() => setError(null)} />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          onDismiss={() => setSuccess(null)}
        />
      )}

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
        onError={(msg) => {
          setSuccess(null);
          setError(msg);
        }}
      />
    </div>
  );
}
