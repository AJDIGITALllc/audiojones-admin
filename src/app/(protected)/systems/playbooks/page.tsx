"use client";

import { getAllModulePlaybooks } from "@/lib/playbooks-local";

export default function PlaybooksPage() {
  const playbooks = getAllModulePlaybooks();

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Module Playbooks</h1>
        <p className="text-gray-400">
          Internal reference guide for Audio Jones system modules
        </p>
      </div>

      {/* Playbook Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {playbooks.map((playbook) => (
          <div
            key={playbook.id}
            className="bg-card border border-border rounded-lg p-6"
          >
            {/* Header */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-white mb-1">
                {playbook.name}
              </h2>
              <p className="text-primary text-sm">{playbook.tagline}</p>
            </div>

            {/* Objective */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Objective
              </h3>
              <p className="text-gray-300 text-sm">{playbook.objective}</p>
            </div>

            {/* Workflow */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Workflow
              </h3>
              <ul className="space-y-2">
                {playbook.workflow.map((step, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary mt-0.5">→</span>
                    <span className="text-gray-300">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* KPIs */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                KPIs We Watch
              </h3>
              <ul className="space-y-1">
                {playbook.kpis.map((kpi, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>{kpi}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Tools in Play
              </h3>
              <ul className="space-y-1">
                {playbook.tools.map((tool, index) => (
                  <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-blue-400">•</span>
                    <span>{tool}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
