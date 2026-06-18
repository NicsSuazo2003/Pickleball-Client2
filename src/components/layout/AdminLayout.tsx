import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/bookings': 'Bookings',
  '/admin/customers': 'Customers',
  '/admin/court': 'Court Settings',
  '/admin/pricing': 'Pricing Rules',
  '/admin/reports': 'Reports',
};

export default function AdminLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? 'Admin';

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <h1 className="text-xl font-bold text-slate-800 lg:text-2xl pl-10 lg:pl-0">{title}</h1>
          <span className="text-xs bg-teal-100 text-teal-700 px-2.5 py-1 rounded-full font-medium">Admin</span>
        </header>
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
