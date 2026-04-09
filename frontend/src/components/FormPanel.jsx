const FORM_SECTIONS = [
  {
    label: "Personal Information",
    fields: [
      { key: "full_name", label: "Full Name" },
      { key: "date_of_birth", label: "Date of Birth" },
      { key: "mobile_number", label: "Mobile Number" },
      { key: "email", label: "Email Address" },
      { key: "age", label: "Age" },
    ]
  },
  {
    label: "Address",
    fields: [
      { key: "address", label: "Address" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
    ]
  },
  {
    label: "Employment & Income",
    fields: [
      { key: "employment_type", label: "Employment Type" },
      { key: "employer_name", label: "Employer Name" },
      { key: "monthly_income", label: "Monthly Income" },
    ]
  },
  {
    label: "Education & Loan",
    fields: [
      { key: "university_name", label: "University" },
      { key: "course_name", label: "Course Name" },
      { key: "country_of_study", label: "Country of Study" },
      { key: "loan_amount_requested", label: "Loan Amount" },
      { key: "preferred_tenure_years", label: "Tenure (Years)" },
      { key: "loan_purpose", label: "Loan Purpose" },
    ]
  }
]

function FieldDot({ value, isActive }) {
  if (value) return (
    <span className="w-2 h-2 rounded-full bg-green-500 inline-block flex-shrink-0" />
  )
  if (isActive) return (
    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block flex-shrink-0 animate-pulse" />
  )
  return (
    <span className="w-2 h-2 rounded-full bg-slate-200 inline-block flex-shrink-0" />
  )
}

function FormField({ label, value, isActive }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 mb-1">
        <FieldDot value={value} isActive={isActive} />
        <span className="text-[11px] text-slate-500">{label}</span>
      </div>
      <input
        readOnly
        value={value || ""}
        placeholder={isActive ? "Priya is listening..." : "Waiting..."}
        className={`w-full px-3 py-2 rounded-lg text-[13px] border outline-none transition-all
          ${value
            ? "border-green-400 bg-green-50 text-green-800"
            : isActive
            ? "border-blue-400 bg-blue-50 text-blue-700 shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
            : "border-slate-200 text-slate-400 bg-white"
          }`}
      />
      {value && (
        <p className="text-[10px] text-green-600 mt-1">AI filled · tap to correct</p>
      )}
    </div>
  )
}

export default function FormPanel({
  formData,
  progressPercent,
  fieldsCompleted,
  totalFields,
  loanOffer,
  stage,
  fraudSignals
}) {
  // Find which field is currently being filled (first null after last filled)
  const allFields = FORM_SECTIONS.flatMap(s => s.fields)
  const firstEmptyIndex = allFields.findIndex(f => !formData[f.key])
  const activeKey = firstEmptyIndex >= 0 ? allFields[firstEmptyIndex].key : null

  return (
    <div className="flex-1 flex flex-col border-r border-slate-200 overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-white">
        <div className="text-[13px] font-semibold text-slate-800">
          Poonawalla Fincorp · Education Loan
        </div>
        <div className="text-[11px] text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          {fieldsCompleted} / {totalFields} fields
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-6 pt-4 pb-1">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">
          {progressPercent}% complete · {totalFields - fieldsCompleted} fields remaining
        </p>
      </div>

      {/* Fraud signal warning */}
      {fraudSignals?.length > 0 && (
        <div className="mx-6 mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-[11px] text-red-700 font-medium">
            ⚠ Age mismatch detected — declared vs estimated age differ significantly
          </p>
        </div>
      )}

      {/* Form fields */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {FORM_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              {section.label}
            </p>
            <div className="grid grid-cols-2 gap-x-3">
              {section.fields.map(f => (
                <FormField
                  key={f.key}
                  label={f.label}
                  value={formData[f.key]}
                  isActive={activeKey === f.key}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Consent badge */}
        {formData.verbal_consent_given && (
          <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 rounded-xl p-3 mt-2">
            <div className="w-4 h-4 rounded bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                <path d="M1 3.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-[11px] text-green-800 font-medium">Verbal consent recorded</p>
              {formData.consent_timestamp && (
                <p className="text-[10px] text-green-600 mt-0.5">
                  at {new Date(formData.consent_timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Loan offer */}
        {loanOffer && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-2">
            <p className="text-[12px] font-bold text-blue-800 mb-3">
              🎉 Your Personalised Loan Offer
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Eligible Amount", value: `₹${(loanOffer.eligible_amount / 100000).toFixed(1)}L` },
                { label: "Interest Rate", value: `${loanOffer.interest_rate}% p.a.` },
                { label: "EMI (5 yr)", value: `₹${loanOffer.emi_for_5_years?.toLocaleString()}` },
                { label: "Tenure Options", value: loanOffer.tenure_options?.join(" / ") + " yrs" },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-lg p-2.5 border border-blue-100">
                  <p className="text-[15px] font-bold text-blue-700">{item.value}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
            {loanOffer.offer_valid_till && (
              <p className="text-[10px] text-blue-500 mt-2 text-center">
                Offer valid till {loanOffer.offer_valid_till}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}