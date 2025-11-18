"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import type { Service, SchedulingProvider } from "@/lib/types/firestore";
import EmptyState from "@/components/EmptyState";
import { emitTenantConfigUpdated } from "@/lib/events";

interface ServiceRow extends Service {
  id: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    schedulingProvider: SchedulingProvider;
    schedulingUrl: string;
    defaultDurationMinutes: number;
    whopSyncEnabled: boolean;
    whopProductId: string;
  }>({
    schedulingProvider: "none",
    schedulingUrl: "",
    defaultDurationMinutes: 60,
    whopSyncEnabled: false,
    whopProductId: "",
  });

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const snap = await getDocs(collection(db, "services"));
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ServiceRow[];
      setServices(data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(service: ServiceRow) {
    setEditingId(service.id);
    setEditForm({
      schedulingProvider: service.schedulingProvider || "none",
      schedulingUrl: service.schedulingUrl || "",
      defaultDurationMinutes: service.defaultDurationMinutes || 60,
      whopSyncEnabled: service.whop?.syncEnabled || false,
      whopProductId: service.whop?.productId || "",
    });
  }

  async function saveEdit(serviceId: string) {
    try {
      const oldService = services.find(s => s.id === serviceId);
      
      await updateDoc(doc(db, "services", serviceId), {
        schedulingProvider: editForm.schedulingProvider,
        schedulingUrl: editForm.schedulingUrl || null,
        defaultDurationMinutes: editForm.defaultDurationMinutes || null,
        whop: {
          syncEnabled: editForm.whopSyncEnabled,
          productId: editForm.whopProductId || null,
          url: null, // Set by sync script
        },
      });

      // Emit admin event for automation
      try {
        const changedFields: string[] = [];
        if (oldService?.schedulingProvider !== editForm.schedulingProvider) changedFields.push('schedulingProvider');
        if (oldService?.schedulingUrl !== editForm.schedulingUrl) changedFields.push('schedulingUrl');
        if (oldService?.defaultDurationMinutes !== editForm.defaultDurationMinutes) changedFields.push('defaultDurationMinutes');
        if (oldService?.whop?.syncEnabled !== editForm.whopSyncEnabled) changedFields.push('whopSyncEnabled');
        if (oldService?.whop?.productId !== editForm.whopProductId) changedFields.push('whopProductId');

        await emitTenantConfigUpdated({
          tenantId: oldService?.tenantId || 'unknown',
          adminId: auth.currentUser?.uid || 'system',
          serviceId: serviceId,
          changedFields,
          whopLinked: editForm.whopSyncEnabled && !!editForm.whopProductId,
          billingProvider: editForm.whopSyncEnabled ? 'whop' : undefined,
          moduleIds: undefined, // TODO: Add module field to Service type when implementing module tagging
        });
      } catch (eventError) {
        console.error('Failed to emit config update event:', eventError);
      }

      await fetchServices();
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update service:", error);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Services Management</h1>
        <div className="bg-gray-900 rounded-lg p-12 text-center">
          <p className="text-gray-400">Loading services...</p>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Services Management</h1>
        <EmptyState
          title="No Services Found"
          description="Services will appear here once they are created in the system."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Services Management</h1>
      
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="text-left p-4">Service Name</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Scheduling Provider</th>
              <th className="text-left p-4">Scheduling URL</th>
              <th className="text-left p-4">Duration (min)</th>
              <th className="text-left p-4">Whop Integration</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id} className="border-t border-gray-700">
                <td className="p-4">{service.name}</td>
                <td className="p-4 capitalize">{service.category}</td>
                {editingId === service.id ? (
                  <>
                    <td className="p-4">
                      <select
                        value={editForm.schedulingProvider}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            schedulingProvider: e.target.value as SchedulingProvider,
                          })
                        }
                        className="bg-gray-700 text-white px-3 py-2 rounded"
                      >
                        <option value="none">None</option>
                        <option value="calcom">Cal.com</option>
                        <option value="calendly">Calendly</option>
                        <option value="other">Other</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        value={editForm.schedulingUrl}
                        onChange={(e) =>
                          setEditForm({ ...editForm, schedulingUrl: e.target.value })
                        }
                        placeholder="https://..."
                        className="bg-gray-700 text-white px-3 py-2 rounded w-full"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="number"
                        value={editForm.defaultDurationMinutes}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            defaultDurationMinutes: parseInt(e.target.value) || 60,
                          })
                        }
                        className="bg-gray-700 text-white px-3 py-2 rounded w-20"
                      />
                    </td>
                    <td className="p-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={editForm.whopSyncEnabled}
                            onChange={(e) =>
                              setEditForm({ ...editForm, whopSyncEnabled: e.target.checked })
                            }
                            className="rounded"
                          />
                          <span className="text-gray-300">Sync with Whop</span>
                        </label>
                        {editForm.whopSyncEnabled && (
                          <input
                            type="text"
                            value={editForm.whopProductId}
                            onChange={(e) =>
                              setEditForm({ ...editForm, whopProductId: e.target.value })
                            }
                            placeholder="Whop Product ID"
                            className="bg-gray-700 text-white px-3 py-2 rounded w-full text-sm"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => saveEdit(service.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 capitalize">
                      {service.schedulingProvider || "none"}
                    </td>
                    <td className="p-4">
                      {service.schedulingUrl ? (
                        <a
                          href={service.schedulingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline"
                        >
                          {service.schedulingUrl.substring(0, 40)}...
                        </a>
                      ) : (
                        <span className="text-gray-500">Not set</span>
                      )}
                    </td>
                    <td className="p-4">
                      {service.defaultDurationMinutes || "—"}
                    </td>
                    <td className="p-4">
                      {service.whop?.syncEnabled ? (
                        <div className="text-sm">
                          <span className="text-green-500">✓ Synced</span>
                          {service.whop.productId && (
                            <div className="text-gray-400 font-mono text-xs">
                              {service.whop.productId}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => startEdit(service)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                      >
                        Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
