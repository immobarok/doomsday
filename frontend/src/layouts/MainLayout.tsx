import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import { Navbar } from '../components/common/Navbar';

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Toaster position="top-right" richColors closeButton />
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Doomsday Ready &bull; MCU Rewatch &amp; Opening-Night Watch-Party
        Planner
      </footer>
    </div>
  );
}
