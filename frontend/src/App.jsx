import { useMemo, useRef, useState } from "react";
import { processFNOL } from "./api";

function classNames(...arr) {
  return arr.filter(Boolean).join(" ");
}

function Pill({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-gray-100 text-gray-800 border-gray-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-800 border-rose-200",
    info: "bg-sky-50 text-sky-800 border-sky-200",
  };

  return (
    <span
      className={classNames(
        "inline-flex items-center px-3 py-1 text-xs font-semibold border rounded-full",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function Card({ children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {children}
    </div>
  );
}

function CardHeader({ left, right }) {
  return (
    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

function CardBody({ children }) {
  return <div className="px-5 py-5">{children}</div>;
}

function FieldRow({ label, value }) {
  return (
    <div className="grid grid-cols-12 gap-3 py-2 border-b border-gray-100 last:border-b-0">
      <div className="col-span-5 text-sm text-gray-500">{label}</div>
      <div className="col-span-7 text-sm font-medium text-gray-900 break-words text-right">
        {value ? value : <span className="text-gray-400">—</span>}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "px-3 py-2 text-sm font-semibold rounded-lg",
        active
          ? "bg-gray-900 text-white"
          : "text-gray-700 hover:bg-gray-100"
      )}
    >
      {children}
    </button>
  );
}

export default function App() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);

  const [tab, setTab] = useState("summary"); // summary | fields | raw
  const [result, setResult] = useState(null);
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const extracted = result?.extractedFields || {};
  const missing = result?.missingFields || [];

  const routeTone = useMemo(() => {
    const r = (result?.recommendedRoute || "").toLowerCase();
    if (r.includes("investigation")) return "danger";
    if (r.includes("manual")) return "warning";
    if (r.includes("specialist")) return "info";
    if (r.includes("fast")) return "success";
    return "neutral";
  }, [result]);

  async function handleProcess() {
    setError("");
    setResult(null);
    setRaw("");

    if (!file) {
      setError("Select a FNOL PDF/TXT file first.");
      return;
    }

    try {
      setLoading(true);
      const data = await processFNOL(file);
      setResult(data);
      setRaw(JSON.stringify(data, null, 2));
      setTab("summary");
    } catch (e) {
      setError(e.message || "Failed to process claim.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setResult(null);
    setRaw("");
    setError("");
    setTab("summary");
    if (inputRef.current) inputRef.current.value = "";
  }

  function downloadJSON() {
    if (!raw) return;
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "claim_output.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              FNOL Claims Processing Agent
            </h1>
            <p className="text-sm text-gray-500">
              Extract fields • Validate • Route claim • Generate JSON
            </p>
          </div>

          <div className="text-xs text-gray-500">
            API: <span className="font-mono">127.0.0.1:8000</span>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="max-w-6xl mx-auto px-5 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader
              left={<SectionTitle title="Upload FNOL" subtitle="PDF or TXT" />}
              right={
                <button
                  onClick={handleReset}
                  className="text-sm font-semibold px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  Reset
                </button>
              }
            />
            <CardBody>
              <div className="space-y-4">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-sm"
                  />
                  <div className="mt-2 text-xs text-gray-600">
                    Selected:{" "}
                    <span className="font-semibold text-gray-900">
                      {file?.name || "None"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleProcess}
                  disabled={loading}
                  className="w-full bg-gray-900 text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Process Claim"}
                </button>

                {error && (
                  <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 p-3 rounded-xl">
                    {error}
                  </div>
                )}

                {result && (
                  <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-900">
                        Recommended Route
                      </div>
                      <Pill tone={routeTone}>{result.recommendedRoute}</Pill>
                    </div>

                    <div className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">
                        Reason:
                      </span>{" "}
                      {result.reasoning}
                    </div>

                    <div className="text-sm">
                      <span className="font-semibold text-gray-900">
                        Missing Fields:
                      </span>{" "}
                      {missing.length === 0 ? (
                        <span className="text-emerald-700 font-semibold">
                          None
                        </span>
                      ) : (
                        <span className="text-rose-700 font-semibold">
                          {missing.join(", ")}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={downloadJSON}
                        className="flex-1 text-sm font-semibold px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        Download JSON
                      </button>
                      <button
                        onClick={() => setTab("raw")}
                        className="flex-1 text-sm font-semibold px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        View Raw
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              left={<SectionTitle title="Quick Checks" subtitle="Routing priority" />}
            />
            <CardBody>
              <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
                <li>
                  <span className="font-semibold">Investigation</span> if description contains{" "}
                  <span className="font-mono">fraud / inconsistent / staged</span>
                </li>
                <li>
                  <span className="font-semibold">Specialist</span> if claim type is{" "}
                  <span className="font-mono">injury</span>
                </li>
                <li>
                  <span className="font-semibold">Manual review</span> if mandatory fields are missing
                </li>
                <li>
                  <span className="font-semibold">Fast-track</span> if damage{" "}
                  <span className="font-mono">&lt; 25000</span>
                </li>
              </ul>
            </CardBody>
          </Card>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              left={
                <SectionTitle
                  title="Claim Output"
                  subtitle="Structured extracted fields and raw JSON output"
                />
              }
              right={
                <div className="flex items-center gap-2">
                  <TabButton
                    active={tab === "summary"}
                    onClick={() => setTab("summary")}
                  >
                    Summary
                  </TabButton>
                  <TabButton
                    active={tab === "fields"}
                    onClick={() => setTab("fields")}
                  >
                    Extracted Fields
                  </TabButton>
                  <TabButton active={tab === "raw"} onClick={() => setTab("raw")}>
                    Raw JSON
                  </TabButton>
                </div>
              }
            />

            <CardBody>
              {!result ? (
                <div className="text-sm text-gray-500">
                  Upload a FNOL document and click <b>Process Claim</b> to see results.
                </div>
              ) : tab === "summary" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Mandatory Fields Status
                    </h3>
                    <FieldRow
                      label="Mandatory Missing"
                      value={missing.length === 0 ? "No" : "Yes"}
                    />
                    <FieldRow
                      label="Missing Fields List"
                      value={missing.length === 0 ? "—" : missing.join(", ")}
                    />
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Routing Decision
                    </h3>
                    <FieldRow label="Route" value={result.recommendedRoute} />
                    <FieldRow label="Reason" value={result.reasoning} />
                  </div>
                </div>
              ) : tab === "fields" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="border border-gray-200 rounded-xl">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Policy Information
                      </h3>
                    </div>
                    <div className="px-4 py-3">
                      <FieldRow label="Policy Number" value={extracted.policyNumber} />
                      <FieldRow label="Policyholder Name" value={extracted.policyholderName} />
                      <FieldRow label="Effective Dates" value={extracted.effectiveDates} />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Incident Information
                      </h3>
                    </div>
                    <div className="px-4 py-3">
                      <FieldRow label="Date" value={extracted.incidentDate} />
                      <FieldRow label="Time" value={extracted.incidentTime} />
                      <FieldRow label="Location" value={extracted.incidentLocation} />
                      <FieldRow label="Description" value={extracted.incidentDescription} />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Involved Parties
                      </h3>
                    </div>
                    <div className="px-4 py-3">
                      <FieldRow label="Claimant" value={extracted.claimant} />
                      <FieldRow label="Third Parties" value={extracted.thirdParties} />
                      <FieldRow label="Contact Details" value={extracted.contactDetails} />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Asset & Cost Details
                      </h3>
                    </div>
                    <div className="px-4 py-3">
                      <FieldRow label="Asset Type" value={extracted.assetType} />
                      <FieldRow label="Asset ID" value={extracted.assetId} />
                      <FieldRow label="Estimated Damage" value={extracted.estimatedDamage} />
                      <FieldRow label="Initial Estimate" value={extracted.initialEstimate} />
                      <FieldRow label="Claim Type" value={extracted.claimType} />
                      <FieldRow label="Attachments" value={extracted.attachments} />
                    </div>
                  </div>
                </div>
              ) : (
                <textarea
                  value={raw}
                  readOnly
                  className="w-full h-[520px] text-xs font-mono p-4 rounded-xl border border-gray-200 bg-gray-50"
                />
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-5 pb-8 text-xs text-gray-500">
        Tip: Keep backend running at <span className="font-mono">127.0.0.1:8000</span>. Upload FNOL files from backend/data.
      </div>
    </div>
  );
}
