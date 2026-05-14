import React from "react";

const SectionCard = ({ title, icon, children, className = "" }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-5 ${className}`}>
    <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900">
      {icon && <span className="text-blue-500">{icon}</span>}
      {title}
    </h3>
    {children}
  </div>
);

export default SectionCard;
