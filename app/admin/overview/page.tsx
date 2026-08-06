export default function OverviewPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--darkslategray-400)" }}>Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Users", value: "12,345" },
          { label: "Active Sessions", value: "1,234" },
          { label: "Revenue", value: "$45,678" },
          { label: "Growth", value: "+23%" },
        ].map((stat) => (
          <div key={stat.label} className="p-6 rounded-xl border" style={{ backgroundColor: "var(--white-100)", borderColor: "var(--gainsboro-100)" }}>
            <p className="text-sm font-medium" style={{ color: "var(--darkgray-100)" }}>{stat.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: "var(--darkslategray-400)" }}>{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="p-6 rounded-xl border" style={{ backgroundColor: "var(--white-100)", borderColor: "var(--gainsboro-100)" }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--darkslategray-400)" }}>Recent Activity</h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--darkgray-100)" }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </p>
      </div>
    </div>
  )
}
