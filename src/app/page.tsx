import { cn } from "@/lib/cn";

const navigationItems = [
  { name: "Dashboard", href: "#", active: true },
  { name: "Clients", href: "#" },
  { name: "Projects", href: "#" },
  { name: "Billing", href: "#" },
  { name: "Automation", href: "#" },
  { name: "Reports", href: "#" },
  { name: "Settings", href: "#" },
];

const statCards = [
  { label: "MRR", value: "$12,450", change: "+12.5%" },
  { label: "Active Clients", value: "48", change: "+3" },
  { label: "Open Projects", value: "23", change: "+5" },
];

const recentActivity = [
  { id: 1, client: "Acme Corp", project: "Website Redesign", date: "2024-01-15", status: "In Progress" },
  { id: 2, client: "TechStart Inc", project: "Brand Identity", date: "2024-01-14", status: "Review" },
  { id: 3, client: "Global Media", project: "Video Production", date: "2024-01-13", status: "Completed" },
  { id: 4, client: "Design Studio", project: "Logo Design", date: "2024-01-12", status: "In Progress" },
  { id: 5, client: "Marketing Pro", project: "Social Media", date: "2024-01-11", status: "Pending" },
];

export default function Dashboard() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-black border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold text-brand-white">Audio Jones</h1>
          <p className="text-sm text-gray-400 mt-1">Admin Portal</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={cn(
                "block px-4 py-2 rounded-lg text-sm transition-colors",
                item.active
                  ? "bg-brand-orange text-brand-white font-medium"
                  : "text-gray-300 hover:bg-gray-800 hover:text-brand-white"
              )}
            >
              {item.name}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-brand-black border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-brand-white">Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="search"
                placeholder="Search..."
                className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-brand-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent w-64"
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-brand-teal flex items-center justify-center text-brand-white font-semibold">
              AJ
            </div>
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-900">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-brand-black border border-gray-800 rounded-lg p-6"
              >
                <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-brand-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-brand-gold">{stat.change}</p>
              </div>
            ))}
          </div>

          {/* Recent Activity Table */}
          <div className="bg-brand-black border border-gray-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg font-semibold text-brand-white">
                Recent Activity
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {recentActivity.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-white">
                        {activity.client}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {activity.project}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {activity.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={cn(
                            "px-2 py-1 text-xs font-medium rounded",
                            activity.status === "Completed"
                              ? "bg-brand-teal/20 text-brand-teal"
                              : activity.status === "In Progress"
                              ? "bg-brand-orange/20 text-brand-orange"
                              : activity.status === "Review"
                              ? "bg-brand-gold/20 text-brand-gold"
                              : "bg-gray-700 text-gray-300"
                          )}
                        >
                          {activity.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
