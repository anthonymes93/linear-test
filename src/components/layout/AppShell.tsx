import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { CommandBar } from './CommandBar';
import { DetailsPanel } from './DetailsPanel';
import { MobileNav } from './MobileNav';
import { QuickAddButton } from '../tasks/QuickAddButton';

export function AppShell() {
  return (
    <div className="min-h-screen overflow-hidden px-3 py-3 text-slate-100 sm:px-4 lg:px-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="mx-auto grid h-[calc(100vh-24px)] max-w-[1680px] grid-cols-1 overflow-hidden rounded-2xl border border-white/10 bg-obsidian/[0.72] shadow-glass backdrop-blur-xl lg:grid-cols-[260px_minmax(0,1fr)_360px]"
      >
        <Sidebar />
        <main className="flex min-w-0 flex-col">
          <CommandBar />
          <MobileNav />
          <Outlet />
        </main>
        <DetailsPanel />
      </motion.div>
      <QuickAddButton />
    </div>
  );
}
