import React from "react";

const FieldLabel = ({ children, required, error }) => (
  <div>
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}{required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
    {error && <p className="mb-2 text-xs font-medium text-red-600">{error}</p>}
  </div>
);

export default FieldLabel;
