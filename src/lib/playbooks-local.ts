// src/lib/playbooks-local.ts
// TODO: Replace this file with imports from ajdigital-automation-hub playbooks.ts once published as a package.

export interface ModulePlaybook {
  id: string;
  name: string;
  tagline: string;
  objective: string;
  workflow: string[];
  kpis: string[];
  tools: string[];
  opsChecks: {
    shouldAchieve: string[];
    verifyPostDelivery: string[];
  };
}

export interface FunnelStage {
  id: string;
  name: string;
  description: string;
  bookingStatuses: string[];
}

export interface FunnelMap {
  stages: FunnelStage[];
  cadence: {
    weekly: string[];
    monthly: string[];
    quarterly: string[];
    annual: string[];
  };
}

const MODULE_PLAYBOOKS: Record<string, ModulePlaybook> = {
  "client-delivery": {
    id: "client-delivery",
    name: "Client Delivery",
    tagline: "End-to-end project delivery from booking to asset handoff",
    objective: "Ensure every client project moves smoothly through intake, production, and delivery with consistent quality and clear communication at each stage.",
    workflow: [
      "Booking confirmed → Generate onboarding checklist and send welcome email",
      "Intake complete → Route project to appropriate production queue",
      "Production → Monitor milestones, flag blockers, update client on status",
      "QA review → Verify deliverables meet quality standards",
      "Final delivery → Hand off assets, collect feedback, archive project",
    ],
    kpis: [
      "Time to first deliverable: <7 days",
      "Client satisfaction score: >4.5/5",
      "Revision requests: <20% of deliverables",
      "On-time delivery rate: >90%",
    ],
    tools: [
      "Firebase Firestore (bookings, assets, status tracking)",
      "MailerLite (status updates, delivery notifications)",
      "Slack (team coordination, blockers)",
      "n8n (onboarding automation, asset processing)",
    ],
    opsChecks: {
      shouldAchieve: [
        "Client receives clear timeline within 24h of booking",
        "All intake requirements collected before production starts",
        "Regular status updates at each milestone",
      ],
      verifyPostDelivery: [
        "All deliverables uploaded and accessible to client",
        "Client confirmation received or follow-up scheduled",
        "Project documentation archived for future reference",
      ],
    },
  },
  "marketing-automation": {
    id: "marketing-automation",
    name: "Marketing Automation",
    tagline: "Automated nurture sequences and engagement campaigns",
    objective: "Keep prospects and clients engaged through timely, relevant communication that moves them through the funnel and encourages repeat business.",
    workflow: [
      "New lead → Enqueue welcome sequence (3-email series over 7 days)",
      "Booking created → Trigger confirmation + expectation-setting content",
      "Payment pending → Send reminder after 24h, escalate after 48h",
      "Delivery complete → Post-project survey after 48h, case study request after 7 days",
      "Inactive user → Re-engagement campaign after 90 days",
    ],
    kpis: [
      "Email open rate: >25%",
      "Click-through rate: >3%",
      "Payment reminder conversion: >60%",
      "Survey response rate: >30%",
    ],
    tools: [
      "MailerLite (email sequences, audience segments)",
      "Firebase (user data, booking triggers)",
      "n8n (workflow automation, trigger routing)",
      "Analytics Engine (engagement metrics)",
    ],
    opsChecks: {
      shouldAchieve: [
        "All user touchpoints mapped to appropriate email sequences",
        "Segment rules up-to-date and reflecting actual user behavior",
        "A/B tests running on key conversion emails",
      ],
      verifyPostDelivery: [
        "Survey sent and tracking properly",
        "Engagement data flowing to analytics dashboard",
        "Re-engagement triggers set for inactive users",
      ],
    },
  },
  "ai-optimization": {
    id: "ai-optimization",
    name: "AI Optimization",
    tagline: "AI-powered quality checks and content recommendations",
    objective: "Use AI to analyze deliverables, predict timelines, and surface optimization opportunities before they become client-facing issues.",
    workflow: [
      "Asset uploaded → Run automated quality analysis (audio levels, mastering, etc.)",
      "Booking created → ML prediction of delivery timeline based on historical data",
      "Content submitted → Generate improvement recommendations",
      "Monthly review → Identify pricing optimization opportunities",
      "Continuous → Monitor for quality issues and alert team",
    ],
    kpis: [
      "Quality score: >85/100 on deliverables",
      "Timeline prediction accuracy: >80%",
      "Issues caught pre-delivery: >90%",
      "Recommendation acceptance rate: >50%",
    ],
    tools: [
      "OpenAI (GPT-4 for recommendations, Whisper for audio analysis)",
      "Firebase Storage (asset access)",
      "Custom ML models (timeline prediction, pricing optimization)",
      "n8n (AI pipeline orchestration)",
    ],
    opsChecks: {
      shouldAchieve: [
        "Every deliverable analyzed for technical quality before handoff",
        "Timeline predictions provided to clients upfront",
        "Optimization suggestions surfaced to production team",
      ],
      verifyPostDelivery: [
        "AI quality report archived with project",
        "Recommendations logged for pattern analysis",
        "Model accuracy metrics updated for continuous improvement",
      ],
    },
  },
  "data-intelligence": {
    id: "data-intelligence",
    name: "Data Intelligence",
    tagline: "Business metrics, reporting, and predictive analytics",
    objective: "Transform operational data into actionable insights that drive strategic decisions and identify growth opportunities.",
    workflow: [
      "Daily → Aggregate bookings, revenue, and engagement metrics",
      "Weekly → Generate executive dashboard with key trends",
      "Monthly → Compute client lifetime value and churn predictions",
      "Quarterly → Export data warehouse for deep analysis",
      "Continuous → Monitor for anomalies and alert on unusual patterns",
    ],
    kpis: [
      "Dashboard data freshness: <1 hour latency",
      "Revenue forecast accuracy: >85%",
      "Anomaly detection precision: >70%",
      "Report generation time: <5 minutes",
    ],
    tools: [
      "Firebase Firestore (primary data source)",
      "Redis (real-time metric caching)",
      "BigQuery (data warehouse)",
      "Custom analytics engine (metrics computation)",
      "Slack (anomaly alerts)",
    ],
    opsChecks: {
      shouldAchieve: [
        "All revenue transactions tracked and reconciled",
        "Funnel conversion rates computed at each stage",
        "Predictive models refreshed monthly",
      ],
      verifyPostDelivery: [
        "Revenue properly attributed to correct period",
        "Client LTV calculation updated",
        "Data exported to warehouse for long-term storage",
      ],
    },
  },
};

const FUNNEL_MAP: FunnelMap = {
  stages: [
    {
      id: "discover",
      name: "Discover",
      description: "Lead generation and initial inquiry phase",
      bookingStatuses: ["draft"], // Bookings in draft state = discovery phase
    },
    {
      id: "book",
      name: "Book",
      description: "Booking confirmed, payment pending or processing",
      bookingStatuses: ["pending", "pending_payment"],
    },
    {
      id: "deliver",
      name: "Deliver",
      description: "Active production and delivery in progress",
      bookingStatuses: ["approved", "in_progress"],
    },
    {
      id: "optimize",
      name: "Optimize",
      description: "Completed deliveries, revisions, and optimization",
      bookingStatuses: ["completed"],
    },
    {
      id: "retain",
      name: "Retain",
      description: "Repeat bookings and long-term client relationships",
      bookingStatuses: [], // Computed: users with multiple completed bookings
    },
  ],
  cadence: {
    weekly: [
      "Review funnel conversion rates and flag any stage with 0 activity",
      "Check booking pipeline health and remove blockers",
      "Spot-check 3-5 recent deliverables for quality",
      "Review pending payments and send reminders if needed",
    ],
    monthly: [
      "Deep-dive into each module's KPIs vs. targets",
      "Analyze client feedback trends and identify improvement areas",
      "Review AI optimization recommendations and implement top 3",
      "Update revenue forecasts and compare to actuals",
      "Conduct funnel bottleneck analysis and propose fixes",
    ],
    quarterly: [
      "Full system review: architecture, performance, security",
      "Review and update module playbooks based on lessons learned",
      "Strategic planning session: new services, pricing, markets",
      "Technology audit: evaluate new tools, sunset outdated ones",
      "Team retro: process improvements, automation opportunities",
    ],
    annual: [
      "Comprehensive business review: revenue, growth, profitability",
      "Strategic planning: 12-month roadmap and OKRs",
      "Major system upgrades and infrastructure investments",
    ],
  },
};

export function getModulePlaybook(id: string): ModulePlaybook | undefined {
  return MODULE_PLAYBOOKS[id];
}

export function getAllModulePlaybooks(): ModulePlaybook[] {
  return Object.values(MODULE_PLAYBOOKS);
}

export function loadFunnelMap(): FunnelMap {
  return FUNNEL_MAP;
}

export function getFunnelStage(id: string): FunnelStage | undefined {
  return FUNNEL_MAP.stages.find((s) => s.id === id);
}

export function getCadenceTasks(
  frequency: "weekly" | "monthly" | "quarterly" | "annual"
): string[] {
  return FUNNEL_MAP.cadence[frequency];
}

// Helper to map booking status to funnel stage
export function getBookingFunnelStage(status: string): string {
  const normalizedStatus = status.toLowerCase();
  
  for (const stage of FUNNEL_MAP.stages) {
    if (stage.bookingStatuses.includes(normalizedStatus)) {
      return stage.id;
    }
  }
  
  return "unknown";
}
