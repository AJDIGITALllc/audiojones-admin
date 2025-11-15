"use client";

import { useAdmin } from '@/contexts/AdminContext';

export function TenantSelector() {
  const { selectedTenantId, setSelectedTenantId, tenants, loading } = useAdmin();

  if (loading || tenants.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <label htmlFor="tenant-select" className="text-sm text-gray-400">
        Viewing:
      </label>
      <select
        id="tenant-select"
        value={selectedTenantId || 'all'}
        onChange={(e) => setSelectedTenantId(e.target.value === 'all' ? null : e.target.value)}
        className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      >
        <option value="all">All Tenants</option>
        {tenants.map((tenant) => (
          <option key={tenant.id} value={tenant.id}>
            {tenant.name}
          </option>
        ))}
      </select>
    </div>
  );
}
