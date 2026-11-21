import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { MainLayout } from './layouts/MainLayout';
import { BookingPage } from './pages/BookingPage';
import { MoviesPage } from './pages/MoviesPage';
import { RewatchPlanPage } from './pages/RewatchPlanPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Navigate to="/movies" replace />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/rewatch-plan" element={<RewatchPlanPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="*" element={<Navigate to="/movies" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
