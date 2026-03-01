import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are an expert AI Digital Marketing Strategist. Generate a highly practical, data-driven, and customized 30-day marketing strategy based on the business inputs provided.

You must respond in valid JSON only. No markdown, no extra text. Use this exact structure:

{
  "positioning": {
    "uvp": "string - unique value proposition",
    "messaging": "string - core messaging angle",
    "voice": "string - suggested brand voice"
  },
  "weeks": [
    {
      "week": 1,
      "title": "Foundation & Awareness",
      "setup": "string - platform setup optimization",
      "contentTypes": ["string"],
      "postingFrequency": "string",
      "funnelSetup": "string",
      "paidStrategy": "string - paid ad test strategy if budget allows"
    },
    {
      "week": 2,
      "title": "Engagement & Trust Building",
      "themes": ["string"],
      "storytelling": "string",
      "community": "string",
      "leadMagnet": "string"
    },
    {
      "week": 3,
      "title": "Lead Generation & Conversion Push",
      "conversionCampaign": "string",
      "retargeting": "string",
      "offers": ["string"],
      "emailSequence": ["string - step"]
    },
    {
      "week": 4,
      "title": "Scaling & Optimization",
      "performanceActions": ["string"],
      "budgetAdjustment": "string",
      "amplification": "string",
      "partnerships": ["string"]
    }
  ],
  "contentPlan": [
    {
      "week": 1,
      "ideas": [
        { "title": "string", "caption": "string", "cta": "string", "hashtags": ["string"] }
      ]
    },
    {
      "week": 2,
      "ideas": [
        { "title": "string", "caption": "string", "cta": "string", "hashtags": ["string"] }
      ]
    },
    {
      "week": 3,
      "ideas": [
        { "title": "string", "caption": "string", "cta": "string", "hashtags": ["string"] }
      ]
    },
    {
      "week": 4,
      "ideas": [
        { "title": "string", "caption": "string", "cta": "string", "hashtags": ["string"] }
      ]
    }
  ],
  "paidStrategy": {
    "objective": "string",
    "targeting": "string",
    "creativeAngles": ["string"],
    "budgetAllocation": [{ "platform": "string", "percentage": number, "rationale": "string" }]
  },
  "kpis": {
    "metrics": [{ "platform": "string", "metrics": ["string"] }],
    "weeklyBenchmarks": ["string"],
    "conversionExpectations": "string"
  },
  "tools": {
    "scheduling": [{ "name": "string", "reason": "string" }],
    "email": [{ "name": "string", "reason": "string" }],
    "analytics": [{ "name": "string", "reason": "string" }],
    "adManagement": [{ "name": "string", "reason": "string" }]
  }
}

Make each section highly specific and actionable for the exact business, audience, goal, platforms, and budget provided. Generate 5 content ideas per week. Be creative, practical, and results-focused.`;

const steps = [
  { id: "business", label: "Business", icon: "🏢" },
  { id: "audience", label: "Audience", icon: "👥" },
  { id: "goals", label: "Goals", icon: "🎯" },
  { id: "platforms", label: "Platforms", icon: "📱" },
  { id: "generate", label: "Generate", icon: "✨" },
];

const platformOptions = ["Instagram", "Facebook", "LinkedIn", "Google Ads", "YouTube", "TikTok", "Email", "Twitter/X", "Pinterest", "WhatsApp"];
const goalOptions = ["Sales / Revenue", "Lead Generation", "Brand Awareness", "Website Traffic", "Social Media Growth"];
const budgetOptions = ["Low (Organic Only)", "Medium ($500–$2,000/mo)", "High ($2,000+/mo)"];
const geoOptions = ["Local (City / Region)", "National", "Global"];
const categoryOptions = ["Retail / E-commerce", "Food & Beverage", "Health & Wellness", "Professional Services", "Education / Coaching", "Beauty & Fashion", "Technology / SaaS", "Real Estate", "Finance", "Travel & Hospitality", "Non-Profit", "Other"];

export default function App() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    businessName: "", category: "", description: "",
    targetAudience: "", ageRange: "", pain: "",
    goal: "", budget: "", geo: "",
    platforms: [],
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [streamText, setStreamText] = useState("");
  const resultRef = useRef(null);

  useEffect(() => {
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [result]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const togglePlatform = (p) => {
    setForm(f => ({
      ...f,
      platforms: f.platforms.includes(p) ? f.platforms.filter(x => x !== p) : [...f.platforms, p]
    }));
  };

  const canNext = () => {
    if (step === 0) return form.businessName && form.category;
    if (step === 1) return form.targetAudience;
    if (step === 2) return form.goal && form.budget && form.geo;
    if (step === 3) return form.platforms.length > 0;
    return true;
  };

  const generate = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setStreamText("Crafting your personalized strategy...");

    const userPrompt = `Generate a 30-day marketing strategy for:
- Business Name: ${form.businessName}
- Category: ${form.category}
- Description: ${form.description || "Not provided"}
- Target Audience: ${form.targetAudience}
- Age Range: ${form.ageRange || "Not specified"}
- Audience Pain Points: ${form.pain || "Not specified"}
- Primary Goal: ${form.goal}
- Budget Level: ${form.budget}
- Geographic Target: ${form.geo}
- Preferred Platforms: ${form.platforms.join(", ")}`;

    try {
      const msgs = [
        { role: "user", content: userPrompt }
      ];

      const phaseTexts = [
        "Analyzing your business profile...",
        "Building your positioning strategy...",
        "Designing week-by-week game plan...",
        "Crafting content ideas...",
        "Calculating KPIs & tools...",
        "Finalizing your strategy..."
      ];
      let phaseIdx = 0;
      const phaseInterval = setInterval(() => {
        phaseIdx = (phaseIdx + 1) % phaseTexts.length;
        setStreamText(phaseTexts[phaseIdx]);
      }, 2000);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8000,
          system: SYSTEM_PROMPT,
          messages: msgs,
        }),
      });

      clearInterval(phaseInterval);

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const text = data.content.map(b => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setActiveTab(0);
    } catch (e) {
      setError("Something went wrong generating your strategy. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
      setStreamText("");
    }
  };

  const weekColors = [
    { bg: "#EFF6FF", border: "#3B82F6", accent: "#1D4ED8", badge: "#DBEAFE", badgeText: "#1E40AF" },
    { bg: "#F0FDF4", border: "#22C55E", accent: "#15803D", badge: "#DCFCE7", badgeText: "#166534" },
    { bg: "#FFF7ED", border: "#F97316", accent: "#C2410C", badge: "#FFEDD5", badgeText: "#9A3412" },
    { bg: "#FDF4FF", border: "#A855F7", accent: "#7E22CE", badge: "#F3E8FF", badgeText: "#6B21A8" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)", fontFamily: "'Outfit', 'Segoe UI', sans-serif" }}>
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1E293B; }
        ::-webkit-scrollbar-thumb { background: #4F46E5; border-radius: 3px; }
        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; backdrop-filter: blur(10px); }
        .btn-primary { background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; border: none; padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(79,70,229,0.4); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .btn-secondary { background: rgba(255,255,255,0.06); color: #CBD5E1; border: 1px solid rgba(255,255,255,0.1); padding: 14px 32px; border-radius: 12px; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); }
        input, select, textarea { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); color: white; border-radius: 10px; padding: 12px 16px; font-size: 14px; font-family: inherit; width: 100%; outline: none; transition: border 0.2s; }
        input:focus, select:focus, textarea:focus { border-color: #4F46E5; background: rgba(79,70,229,0.08); }
        input::placeholder, textarea::placeholder { color: rgba(255,255,255,0.3); }
        select option { background: #1E293B; color: white; }
        label { color: #94A3B8; font-size: 13px; font-weight: 500; display: block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .platform-chip { padding: 8px 16px; border-radius: 100px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); color: #94A3B8; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.2s; font-family: inherit; }
        .platform-chip.selected { background: rgba(79,70,229,0.25); border-color: #4F46E5; color: #A5B4FC; }
        .tab-btn { padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; font-family: inherit; }
        .tab-btn.active { background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; }
        .tab-btn.inactive { background: rgba(255,255,255,0.04); color: #64748B; }
        .tab-btn.inactive:hover { background: rgba(255,255,255,0.08); color: #94A3B8; }
        .result-section { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 24px; margin-bottom: 16px; }
        .tag { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }
        .shimmer { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.09) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.8s infinite; border-radius: 8px; height: 16px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .pulse { animation: pulse 2s infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; display: inline-block; }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "20px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #4F46E5, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📈</div>
          <div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 18, letterSpacing: "-0.3px" }}>StrategyAI</div>
            <div style={{ color: "#4F46E5", fontSize: 11, fontWeight: 600, letterSpacing: "1px" }}>30-DAY MARKETING GENERATOR</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>

        {/* Stepper */}
        {!result && (
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40, overflowX: "auto", paddingBottom: 4 }}>
            {steps.map((s, i) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: i < step ? "linear-gradient(135deg, #4F46E5, #7C3AED)" : i === step ? "rgba(79,70,229,0.2)" : "rgba(255,255,255,0.05)",
                    border: i === step ? "2px solid #4F46E5" : i < step ? "none" : "1px solid rgba(255,255,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: i < step ? 16 : 18, color: "white", fontWeight: 700,
                    transition: "all 0.3s"
                  }}>
                    {i < step ? "✓" : s.icon}
                  </div>
                  <span style={{ color: i === step ? "#A5B4FC" : i < step ? "#6366F1" : "#475569", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ flex: 1, height: 2, background: i < step ? "linear-gradient(90deg, #4F46E5, #7C3AED)" : "rgba(255,255,255,0.07)", margin: "0 8px", marginTop: -16, transition: "all 0.3s" }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "80px 20px" }} className="fade-up">
            <div style={{ fontSize: 56, marginBottom: 24 }}>
              <span className="spin">⚙️</span>
            </div>
            <div style={{ color: "white", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Building Your Strategy</div>
            <div style={{ color: "#6366F1", fontSize: 15, fontWeight: 500 }} className="pulse">{streamText}</div>
            <div style={{ marginTop: 40, display: "flex", gap: 8, justifyContent: "center" }}>
              {[0, 1, 2, 3, 4, 5].map(i => (
                <div key={i} className="shimmer" style={{ width: 60, animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: 20, color: "#FCA5A5", marginBottom: 20, textAlign: "center" }}>
            {error} <button className="btn-secondary" style={{ marginLeft: 16, padding: "6px 16px" }} onClick={() => setError("")}>Dismiss</button>
          </div>
        )}

        {/* Step 0 – Business Info */}
        {!loading && !result && step === 0 && (
          <div className="card fade-up" style={{ padding: 40 }}>
            <h2 style={{ color: "white", fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Tell us about your business</h2>
            <p style={{ color: "#64748B", marginBottom: 32 }}>We'll use this to personalize your entire strategy.</p>
            <div style={{ display: "grid", gap: 20 }}>
              <div>
                <label>Business Name *</label>
                <input placeholder="e.g. GlowUp Beauty Studio" value={form.businessName} onChange={e => update("businessName", e.target.value)} />
              </div>
              <div>
                <label>Business Category *</label>
                <select value={form.category} onChange={e => update("category", e.target.value)}>
                  <option value="">Select a category...</option>
                  {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label>Brief Description (optional)</label>
                <textarea rows={3} placeholder="What does your business do? What makes you different?" value={form.description} onChange={e => update("description", e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
              <button className="btn-primary" disabled={!canNext()} onClick={() => setStep(1)}>Next: Target Audience →</button>
            </div>
          </div>
        )}

        {/* Step 1 – Target Audience */}
        {!loading && !result && step === 1 && (
          <div className="card fade-up" style={{ padding: 40 }}>
            <h2 style={{ color: "white", fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Who are you targeting?</h2>
            <p style={{ color: "#64748B", marginBottom: 32 }}>The more specific, the better your strategy will be.</p>
            <div style={{ display: "grid", gap: 20 }}>
              <div>
                <label>Target Audience Description *</label>
                <input placeholder="e.g. Women aged 25–40 interested in natural skincare" value={form.targetAudience} onChange={e => update("targetAudience", e.target.value)} />
              </div>
              <div>
                <label>Age Range (optional)</label>
                <input placeholder="e.g. 25–40" value={form.ageRange} onChange={e => update("ageRange", e.target.value)} />
              </div>
              <div>
                <label>Main Pain Points / Desires (optional)</label>
                <textarea rows={3} placeholder="What problems does your audience face? What do they want?" value={form.pain} onChange={e => update("pain", e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between" }}>
              <button className="btn-secondary" onClick={() => setStep(0)}>← Back</button>
              <button className="btn-primary" disabled={!canNext()} onClick={() => setStep(2)}>Next: Goals & Budget →</button>
            </div>
          </div>
        )}

        {/* Step 2 – Goals */}
        {!loading && !result && step === 2 && (
          <div className="card fade-up" style={{ padding: 40 }}>
            <h2 style={{ color: "white", fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Goals, budget & geography</h2>
            <p style={{ color: "#64748B", marginBottom: 32 }}>This shapes the intensity and channels of your strategy.</p>
            <div style={{ display: "grid", gap: 20 }}>
              <div>
                <label>Primary Goal *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
                  {goalOptions.map(g => (
                    <button key={g} onClick={() => update("goal", g)} style={{ padding: "12px 16px", borderRadius: 10, border: form.goal === g ? "2px solid #4F46E5" : "1px solid rgba(255,255,255,0.1)", background: form.goal === g ? "rgba(79,70,229,0.2)" : "rgba(255,255,255,0.03)", color: form.goal === g ? "#A5B4FC" : "#94A3B8", cursor: "pointer", fontWeight: 600, fontSize: 13, textAlign: "left", fontFamily: "inherit", transition: "all 0.2s" }}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label>Monthly Ad Budget *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 4 }}>
                  {budgetOptions.map(b => (
                    <button key={b} onClick={() => update("budget", b)} style={{ padding: "12px 16px", borderRadius: 10, border: form.budget === b ? "2px solid #4F46E5" : "1px solid rgba(255,255,255,0.1)", background: form.budget === b ? "rgba(79,70,229,0.2)" : "rgba(255,255,255,0.03)", color: form.budget === b ? "#A5B4FC" : "#94A3B8", cursor: "pointer", fontWeight: 600, fontSize: 12, textAlign: "left", fontFamily: "inherit", transition: "all 0.2s" }}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label>Geographic Target *</label>
                <select value={form.geo} onChange={e => update("geo", e.target.value)}>
                  <option value="">Select...</option>
                  {geoOptions.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between" }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" disabled={!canNext()} onClick={() => setStep(3)}>Next: Platforms →</button>
            </div>
          </div>
        )}

        {/* Step 3 – Platforms */}
        {!loading && !result && step === 3 && (
          <div className="card fade-up" style={{ padding: 40 }}>
            <h2 style={{ color: "white", fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Where do you want to market?</h2>
            <p style={{ color: "#64748B", marginBottom: 32 }}>Select all platforms you're open to using.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {platformOptions.map(p => (
                <button key={p} className={`platform-chip ${form.platforms.includes(p) ? "selected" : ""}`} onClick={() => togglePlatform(p)}>
                  {form.platforms.includes(p) ? "✓ " : ""}{p}
                </button>
              ))}
            </div>
            {form.platforms.length > 0 && (
              <div style={{ marginTop: 20, padding: 16, background: "rgba(79,70,229,0.08)", borderRadius: 10, border: "1px solid rgba(79,70,229,0.2)" }}>
                <span style={{ color: "#A5B4FC", fontSize: 13, fontWeight: 500 }}>Selected: </span>
                <span style={{ color: "#CBD5E1", fontSize: 13 }}>{form.platforms.join(", ")}</span>
              </div>
            )}
            <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between" }}>
              <button className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-primary" disabled={!canNext()} onClick={() => { setStep(4); generate(); }}>
                ✨ Generate My Strategy
              </button>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {result && !loading && (
          <div className="fade-up" ref={resultRef}>
            {/* Strategy Header */}
            <div style={{ background: "linear-gradient(135deg, rgba(79,70,229,0.2), rgba(124,58,237,0.15))", border: "1px solid rgba(79,70,229,0.3)", borderRadius: 20, padding: 32, marginBottom: 24, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
              <h1 style={{ color: "white", fontSize: 28, fontWeight: 900, marginBottom: 8, letterSpacing: "-0.5px" }}>Your 30-Day Marketing Strategy</h1>
              <p style={{ color: "#A5B4FC", fontSize: 15, fontWeight: 500 }}>{form.businessName} · {form.goal} · {form.geo}</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                {form.platforms.map(p => <span key={p} style={{ background: "rgba(79,70,229,0.25)", color: "#A5B4FC", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600 }}>{p}</span>)}
              </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
              {["🎯 Positioning", "📅 Weekly Plan", "✍️ Content", "💰 Paid Ads", "📊 KPIs", "🛠️ Tools"].map((t, i) => (
                <button key={i} className={`tab-btn ${activeTab === i ? "active" : "inactive"}`} onClick={() => setActiveTab(i)} style={{ whiteSpace: "nowrap" }}>{t}</button>
              ))}
            </div>

            {/* TAB 0: Positioning */}
            {activeTab === 0 && (
              <div className="fade-up">
                <div style={{ display: "grid", gap: 16 }}>
                  {[
                    { icon: "💎", label: "Unique Value Proposition", value: result.positioning?.uvp, color: "#4F46E5" },
                    { icon: "📣", label: "Core Messaging Angle", value: result.positioning?.messaging, color: "#0EA5E9" },
                    { icon: "🎭", label: "Brand Voice", value: result.positioning?.voice, color: "#8B5CF6" },
                  ].map((item, i) => (
                    <div key={i} className="result-section" style={{ borderLeft: `4px solid ${item.color}` }}>
                      <div style={{ color: "#64748B", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>{item.icon} {item.label}</div>
                      <p style={{ color: "#E2E8F0", fontSize: 16, lineHeight: 1.7, fontWeight: 400 }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 1: Weekly Plan */}
            {activeTab === 1 && (
              <div className="fade-up" style={{ display: "grid", gap: 16 }}>
                {result.weeks?.map((week, i) => {
                  const wc = weekColors[i] || weekColors[0];
                  return (
                    <details key={i} open={i === 0} style={{ background: `${wc.bg}10`, border: `1px solid ${wc.border}30`, borderRadius: 14 }}>
                      <summary style={{ padding: "20px 24px", cursor: "pointer", color: "white", fontWeight: 800, fontSize: 17, display: "flex", alignItems: "center", gap: 12, listStyle: "none" }}>
                        <span style={{ background: wc.badge, color: wc.badgeText, padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>Week {week.week}</span>
                        {week.title}
                      </summary>
                      <div style={{ padding: "0 24px 24px" }}>
                        {week.setup && <WeekItem icon="⚙️" label="Platform Setup" value={week.setup} />}
                        {week.contentTypes && <WeekItem icon="📄" label="Content Types" value={week.contentTypes.join(" · ")} />}
                        {week.postingFrequency && <WeekItem icon="📅" label="Posting Frequency" value={week.postingFrequency} />}
                        {week.funnelSetup && <WeekItem icon="🔄" label="Funnel Setup" value={week.funnelSetup} />}
                        {week.paidStrategy && <WeekItem icon="💰" label="Paid Strategy" value={week.paidStrategy} />}
                        {week.themes && <WeekItem icon="🎨" label="Content Themes" value={week.themes.join(" · ")} />}
                        {week.storytelling && <WeekItem icon="📖" label="Storytelling Strategy" value={week.storytelling} />}
                        {week.community && <WeekItem icon="👥" label="Community Engagement" value={week.community} />}
                        {week.leadMagnet && <WeekItem icon="🎁" label="Lead Magnet" value={week.leadMagnet} />}
                        {week.conversionCampaign && <WeekItem icon="🎯" label="Conversion Campaign" value={week.conversionCampaign} />}
                        {week.retargeting && <WeekItem icon="🔁" label="Retargeting Plan" value={week.retargeting} />}
                        {week.offers && <WeekItem icon="🏷️" label="Offer Ideas" value={week.offers.join(" · ")} />}
                        {week.emailSequence && <WeekItem icon="📧" label="Email Sequence" value={week.emailSequence.join(" → ")} />}
                        {week.performanceActions && <WeekItem icon="📊" label="Performance Actions" value={week.performanceActions.join(" · ")} />}
                        {week.budgetAdjustment && <WeekItem icon="💵" label="Budget Adjustment" value={week.budgetAdjustment} />}
                        {week.amplification && <WeekItem icon="📢" label="Content Amplification" value={week.amplification} />}
                        {week.partnerships && <WeekItem icon="🤝" label="Partnership Ideas" value={week.partnerships.join(" · ")} />}
                      </div>
                    </details>
                  );
                })}
              </div>
            )}

            {/* TAB 2: Content Plan */}
            {activeTab === 2 && (
              <div className="fade-up">
                {result.contentPlan?.map((weekPlan, wi) => {
                  const wc = weekColors[wi] || weekColors[0];
                  return (
                    <div key={wi} style={{ marginBottom: 28 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <span style={{ background: wc.badge, color: wc.badgeText, padding: "5px 14px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>Week {weekPlan.week}</span>
                        <div style={{ flex: 1, height: 1, background: `${wc.border}30` }} />
                      </div>
                      <div style={{ display: "grid", gap: 12 }}>
                        {weekPlan.ideas?.map((idea, ii) => (
                          <div key={ii} className="result-section" style={{ borderLeft: `3px solid ${wc.border}` }}>
                            <div style={{ fontWeight: 700, color: "white", fontSize: 15, marginBottom: 10 }}>💡 {idea.title}</div>
                            <div style={{ color: "#94A3B8", fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>{idea.caption}</div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                              <span style={{ background: "rgba(79,70,229,0.15)", color: "#A5B4FC", padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>CTA: {idea.cta}</span>
                              {idea.hashtags?.slice(0, 5).map((h, hi) => (
                                <span key={hi} style={{ color: "#0EA5E9", fontSize: 12, fontWeight: 500 }}>#{h}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: Paid Strategy */}
            {activeTab === 3 && (
              <div className="fade-up" style={{ display: "grid", gap: 16 }}>
                {result.paidStrategy?.objective && (
                  <div className="result-section" style={{ borderLeft: "4px solid #F59E0B" }}>
                    <div style={{ color: "#64748B", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>🎯 Campaign Objective</div>
                    <p style={{ color: "#E2E8F0", lineHeight: 1.7 }}>{result.paidStrategy.objective}</p>
                  </div>
                )}
                {result.paidStrategy?.targeting && (
                  <div className="result-section" style={{ borderLeft: "4px solid #0EA5E9" }}>
                    <div style={{ color: "#64748B", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>👥 Audience Targeting</div>
                    <p style={{ color: "#E2E8F0", lineHeight: 1.7 }}>{result.paidStrategy.targeting}</p>
                  </div>
                )}
                {result.paidStrategy?.creativeAngles && (
                  <div className="result-section" style={{ borderLeft: "4px solid #8B5CF6" }}>
                    <div style={{ color: "#64748B", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>🎨 Creative Angles</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {result.paidStrategy.creativeAngles.map((a, i) => (
                        <div key={i} style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 8, padding: "10px 14px", color: "#C4B5FD", fontSize: 14 }}>
                          {i + 1}. {a}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.paidStrategy?.budgetAllocation && (
                  <div className="result-section" style={{ borderLeft: "4px solid #22C55E" }}>
                    <div style={{ color: "#64748B", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>💵 Budget Allocation</div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {result.paidStrategy.budgetAllocation.map((b, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                            <span style={{ color: "#E2E8F0", fontWeight: 600, fontSize: 14 }}>{b.platform}</span>
                            <span style={{ color: "#22C55E", fontWeight: 800, fontSize: 16 }}>{b.percentage}%</span>
                          </div>
                          <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${b.percentage}%`, height: "100%", background: "linear-gradient(90deg, #22C55E, #0EA5E9)", borderRadius: 3, transition: "width 1s" }} />
                          </div>
                          <p style={{ color: "#64748B", fontSize: 12, marginTop: 4 }}>{b.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: KPIs */}
            {activeTab === 4 && (
              <div className="fade-up" style={{ display: "grid", gap: 16 }}>
                {result.kpis?.metrics && (
                  <div className="result-section">
                    <div style={{ color: "#64748B", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>📊 Platform Metrics</div>
                    <div style={{ display: "grid", gap: 12 }}>
                      {result.kpis.metrics.map((m, i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 14 }}>
                          <div style={{ color: "#60A5FA", fontWeight: 700, marginBottom: 8 }}>📱 {m.platform}</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {m.metrics?.map((met, mi) => (
                              <span key={mi} style={{ background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#93C5FD", padding: "3px 10px", borderRadius: 6, fontSize: 12 }}>{met}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.kpis?.weeklyBenchmarks && (
                  <div className="result-section">
                    <div style={{ color: "#64748B", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 14 }}>📈 Weekly Benchmarks</div>
                    <div style={{ display: "grid", gap: 8 }}>
                      {result.kpis.weeklyBenchmarks.map((b, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <span style={{ background: "rgba(245,158,11,0.2)", color: "#FCD34D", width: 24, height: 24, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>W{i + 1}</span>
                          <p style={{ color: "#CBD5E1", fontSize: 14, lineHeight: 1.6 }}>{b}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {result.kpis?.conversionExpectations && (
                  <div className="result-section" style={{ borderLeft: "4px solid #22C55E" }}>
                    <div style={{ color: "#64748B", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>✅ Conversion Expectations</div>
                    <p style={{ color: "#E2E8F0", lineHeight: 1.7 }}>{result.kpis.conversionExpectations}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: Tools */}
            {activeTab === 5 && (
              <div className="fade-up" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { key: "scheduling", label: "📅 Scheduling", color: "#4F46E5" },
                  { key: "email", label: "📧 Email Marketing", color: "#0EA5E9" },
                  { key: "analytics", label: "📊 Analytics", color: "#22C55E" },
                  { key: "adManagement", label: "💰 Ad Management", color: "#F59E0B" },
                ].map(({ key, label, color }) => (
                  <div key={key} className="result-section" style={{ borderTop: `3px solid ${color}` }}>
                    <div style={{ color, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{label}</div>
                    {result.tools?.[key]?.map((t, i) => (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                        <div style={{ color: "#64748B", fontSize: 12, lineHeight: 1.5 }}>{t.reason}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Generate Again */}
            <div style={{ marginTop: 32, textAlign: "center" }}>
              <button className="btn-secondary" onClick={() => { setResult(null); setStep(0); }}>← Generate New Strategy</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function WeekItem({ icon, label, value }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ color: "#64748B", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 4 }}>{icon} {label}</div>
      <p style={{ color: "#CBD5E1", fontSize: 14, lineHeight: 1.65 }}>{value}</p>
    </div>
  );
}
