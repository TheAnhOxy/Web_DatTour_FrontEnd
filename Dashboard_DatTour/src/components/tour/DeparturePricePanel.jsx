import React, { useState, useEffect } from "react";
import { FiTrash2, FiChevronDown, FiDollarSign, FiShield, FiPlus, FiLoader, FiInfo } from "react-icons/fi";
import {
  usePricingRulesQuery, useCreatePricingRuleMutation, useUpdatePricingRuleMutation,
  useDeletePricingRuleMutation, useTogglePricingRuleMutation,
  useUpsertPriceConfigMutation, usePriceConfigQuery,
} from "../../api/hooks/departureHooks";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) => { const n = Number(String(v ?? "").replace(/\D/g, "")); return n > 0 ? new Intl.NumberFormat("vi-VN").format(n) : ""; };
const fieldCls = "h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";
const selectCls = "h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm outline-none focus:border-blue-400";

const RULE_TYPES = {
  EARLY_BIRD: { label: "Early Bird 🕐", desc: "Giảm khi đặt sớm trước ngày khởi hành" },
  LAST_MINUTE: { label: "Last Minute ⚡", desc: "Giảm khi đặt gần ngày khởi hành" },
  GROUP_DISCOUNT: { label: "Nhóm 👥", desc: "Giảm khi số khách đủ điều kiện" },
  SLOT_BASED: { label: "Slot Based 🎟️", desc: "Giảm dựa trên số chỗ còn lại" },
};

const ADJ_TYPES = {
  PERCENT: "% Giảm",
  PERCENT_SURCHARGE: "% Phụ thu",
  FIXED: "Giảm cố định (VND)",
};

const PRICE_FIELDS = [
  { label: "Người lớn", sub: "Adult", field: "adultPrice", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { label: "Trẻ 10-14", sub: "10–14 tuổi", field: "child1014Price", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  { label: "Trẻ 4-9", sub: "4–9 tuổi", field: "child49Price", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  { label: "Em bé", sub: "Dưới 4 tuổi", field: "babyPrice", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
];

const EMPTY_RULE = {
  ruleName: "", ruleType: "EARLY_BIRD", adjustmentType: "PERCENT",
  adjustmentValue: "", minDaysBefore: "", maxDaysBefore: "",
  minSlotsLeft: "", maxSlotsLeft: "", priority: 1, isActive: true,
};

// ── Rule preview helper ───────────────────────────────────────────────────────
const RulePreview = ({ data }) => {
  const parts = [];
  if (data.minDaysBefore || data.maxDaysBefore) {
    const min = data.minDaysBefore || "?", max = data.maxDaysBefore || "?";
    parts.push(`Đặt trước ${min}–${max} ngày`);
  }
  if (data.minSlotsLeft || data.maxSlotsLeft) {
    const min = data.minSlotsLeft || "?", max = data.maxSlotsLeft || "?";
    parts.push(`Nhóm ${min}–${max} khách`);
  }
  const val = data.adjustmentValue;
  const adjLabel = data.adjustmentType === "PERCENT" ? `giảm ${val}%` : data.adjustmentType === "FIXED" ? `giảm ${Number(val).toLocaleString("vi-VN")} VND` : `phụ thu ${val}%`;
  if (!val) return null;
  return (
    <div className="mt-3 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
      <span className="font-bold">Kết quả: </span>
      {parts.length > 0 ? parts.join(" & ") + " → " : ""}{adjLabel}
    </div>
  );
};

// ── New rule form — MODULE LEVEL to prevent focus loss ────────────────────────
const NewRuleForm = ({ data, onChange, onSave, onCancel, isSaving }) => (
  <div className="mb-4 rounded-xl border-2 border-blue-300 bg-white shadow-sm">
    <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-4 py-3 rounded-t-xl">
      <div>
        <p className="text-sm font-bold text-blue-700">✏️ Thêm quy tắc mới</p>
        <p className="text-xs text-blue-500">Điền thông tin bên dưới rồi nhấn "Lưu"</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onSave} disabled={isSaving}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
          {isSaving ? <FiLoader className="animate-spin h-3 w-3" /> : "✓"} {isSaving ? "Đang lưu..." : "Lưu quy tắc"}
        </button>
        <button onClick={onCancel} className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50">Hủy</button>
      </div>
    </div>
    <div className="p-4 space-y-4">
      {/* Row 1: name */}
      <div>
        <label className="mb-1 block text-xs font-bold text-slate-600">Tên quy tắc *</label>
        <input value={data.ruleName} onChange={e => onChange("ruleName", e.target.value)}
          placeholder='VD: "Early Bird - Đặt sớm 30 ngày"' className={fieldCls} />
      </div>

      {/* Row 2: type + adj type + value + priority */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">Loại quy tắc</label>
          <select value={data.ruleType} onChange={e => onChange("ruleType", e.target.value)} className={selectCls}>
            {Object.entries(RULE_TYPES).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
          </select>
          <p className="mt-0.5 text-[10px] text-slate-400">{RULE_TYPES[data.ruleType]?.desc}</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">Kiểu điều chỉnh</label>
          <select value={data.adjustmentType} onChange={e => onChange("adjustmentType", e.target.value)} className={selectCls}>
            {Object.entries(ADJ_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-600">
            Mức giảm
            <span className="text-[10px] text-slate-400 font-normal">({data.adjustmentType === "FIXED" ? "VND" : "%"})</span>
          </label>
          <input type="number" value={data.adjustmentValue} onChange={e => onChange("adjustmentValue", e.target.value)}
            placeholder={data.adjustmentType === "FIXED" ? "500000" : "10"} className={fieldCls} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">Độ ưu tiên</label>
          <input type="number" min={1} value={data.priority} onChange={e => onChange("priority", Number(e.target.value))} className={fieldCls} />
          <p className="mt-0.5 text-[10px] text-slate-400">Số nhỏ = ưu tiên cao hơn</p>
        </div>
      </div>

      {/* Row 3: conditions */}
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
        <p className="mb-2 text-xs font-bold text-slate-500 uppercase tracking-wide">Điều kiện áp dụng (tùy chọn)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Min ngày trước</label>
            <input type="number" min={0} value={data.minDaysBefore} onChange={e => onChange("minDaysBefore", e.target.value)}
              placeholder="VD: 30" className={fieldCls} />
            <p className="mt-0.5 text-[10px] text-slate-400">Đặt trước ít nhất N ngày</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Max ngày trước</label>
            <input type="number" min={0} value={data.maxDaysBefore} onChange={e => onChange("maxDaysBefore", e.target.value)}
              placeholder="VD: 90" className={fieldCls} />
            <p className="mt-0.5 text-[10px] text-slate-400">Đặt trước tối đa N ngày</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Min slot/khách</label>
            <input type="number" min={0} value={data.minSlotsLeft} onChange={e => onChange("minSlotsLeft", e.target.value)}
              placeholder="VD: 4" className={fieldCls} />
            <p className="mt-0.5 text-[10px] text-slate-400">Nhóm ít nhất N người</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Max slot/khách</label>
            <input type="number" min={0} value={data.maxSlotsLeft} onChange={e => onChange("maxSlotsLeft", e.target.value)}
              placeholder="VD: 10" className={fieldCls} />
            <p className="mt-0.5 text-[10px] text-slate-400">Nhóm tối đa N người</p>
          </div>
        </div>
      </div>

      <RulePreview data={data} />
    </div>
  </div>
);

// ── Existing rule row — MODULE LEVEL ─────────────────────────────────────────
const ExistingRuleRow = ({ rule, expanded, onToggleExpand, onToggleActive, onDelete, onUpdate }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-slate-50" onClick={onToggleExpand}>
      <FiChevronDown className={`shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800">{rule.ruleName || <span className="italic text-slate-400">Chưa đặt tên</span>}</p>
        <p className="text-[11px] text-slate-400">{RULE_TYPES[rule.ruleType]?.desc ?? rule.ruleType}</p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{RULE_TYPES[rule.ruleType]?.label ?? rule.ruleType}</span>
        {rule.adjustmentValue != null && rule.adjustmentValue !== "" && (
          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
            {rule.adjustmentValue}{rule.adjustmentType === "PERCENT" ? "%" : " VND"}
          </span>
        )}
        {(rule.minDaysBefore || rule.maxDaysBefore) && (
          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-600">
            {rule.minDaysBefore ?? "?"}–{rule.maxDaysBefore ?? "?"}d
          </span>
        )}
      </div>
      <button onClick={e => { e.stopPropagation(); onToggleActive(); }}
        className={`cursor-pointer shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${rule.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
        {rule.isActive ? "✓ Đang dùng" : "Tắt"}
      </button>
      <button onClick={e => { e.stopPropagation(); onDelete(); }}
        className="cursor-pointer shrink-0 rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500"><FiTrash2 /></button>
    </div>

    {expanded && (
      <div className="border-t border-slate-100 bg-slate-50 px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-4">
            <label className="mb-1 block text-xs font-bold text-slate-600">Tên quy tắc</label>
            <input defaultValue={rule.ruleName} key={`name-${rule.id}`} onBlur={e => onUpdate("ruleName", e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">Loại quy tắc</label>
            <select defaultValue={rule.ruleType} key={`type-${rule.id}`} onBlur={e => onUpdate("ruleType", e.target.value)} className={selectCls}>
              {Object.entries(RULE_TYPES).map(([v, { label }]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">Kiểu điều chỉnh</label>
            <select defaultValue={rule.adjustmentType} key={`adjtype-${rule.id}`} onBlur={e => onUpdate("adjustmentType", e.target.value)} className={selectCls}>
              {Object.entries(ADJ_TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">Mức giảm</label>
            <input type="number" defaultValue={rule.adjustmentValue} key={`adjval-${rule.id}`} onBlur={e => onUpdate("adjustmentValue", e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-600">Độ ưu tiên</label>
            <input type="number" defaultValue={rule.priority} key={`prio-${rule.id}`} onBlur={e => onUpdate("priority", Number(e.target.value))} className={fieldCls} />
          </div>
        </div>
        <div className="rounded-lg bg-white border border-slate-200 p-3">
          <p className="mb-2 text-xs font-bold text-slate-500 uppercase">Điều kiện</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["minDaysBefore", "Min ngày trước", "Đặt trước ít nhất N ngày"],
              ["maxDaysBefore", "Max ngày trước", "Đặt trước tối đa N ngày"],
              ["minSlotsLeft", "Min khách", "Nhóm ít nhất N người"],
              ["maxSlotsLeft", "Max khách", "Nhóm tối đa N người"],
            ].map(([f, l, hint]) => (
              <div key={f}>
                <label className="mb-1 block text-xs font-semibold text-slate-600">{l}</label>
                <input type="number" defaultValue={rule[f] ?? ""} key={`${f}-${rule.id}`}
                  onBlur={e => onUpdate(f, e.target.value || null)} placeholder="—" className={fieldCls} />
                <p className="mt-0.5 text-[10px] text-slate-400">{hint}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
);

// ── Main panel ────────────────────────────────────────────────────────────────
const DeparturePricePanel = ({ departure, tourId }) => {
  const depId = departure.id;
  const { data: priceConfig, isLoading: pcLoading } = usePriceConfigQuery(depId);
  const { data: rules = [], isLoading: rulesLoading } = usePricingRulesQuery(depId);
  const upsertPrice = useUpsertPriceConfigMutation(depId, tourId);
  const createRule = useCreatePricingRuleMutation(depId);
  const updateRule = useUpdatePricingRuleMutation(depId);
  const deleteRule = useDeletePricingRuleMutation(depId);
  const toggleRule = useTogglePricingRuleMutation(depId);

  const [pf, setPf] = useState({ adultPrice: "", child1014Price: "", child49Price: "", babyPrice: "" });
  const [showNewRuleForm, setShowNewRuleForm] = useState(false);
  const [newRule, setNewRule] = useState({ ...EMPTY_RULE });
  const [expandedRules, setExpandedRules] = useState({});

  useEffect(() => {
    if (priceConfig && typeof priceConfig === "object") {
      setPf({
        adultPrice: String(priceConfig.adultPrice ?? ""),
        child1014Price: String(priceConfig.child1014Price ?? ""),
        child49Price: String(priceConfig.child49Price ?? ""),
        babyPrice: String(priceConfig.babyPrice ?? ""),
      });
    }
  }, [priceConfig]);

  const handleSavePrice = () => upsertPrice.mutate({
    adultPrice: Number(String(pf.adultPrice).replace(/\D/g, "") || 0),
    child1014Price: Number(String(pf.child1014Price).replace(/\D/g, "") || 0),
    child49Price: Number(String(pf.child49Price).replace(/\D/g, "") || 0),
    babyPrice: Number(String(pf.babyPrice).replace(/\D/g, "") || 0),
  });

  const setNr = (f, v) => setNewRule(p => ({ ...p, [f]: v }));

  const handleCreateRule = () => {
    if (!newRule.ruleName.trim()) { alert("Vui lòng nhập tên quy tắc"); return; }
    createRule.mutate({
      ...newRule,
      adjustmentValue: Number(newRule.adjustmentValue) || 0,
      minDaysBefore: newRule.minDaysBefore !== "" ? Number(newRule.minDaysBefore) : null,
      maxDaysBefore: newRule.maxDaysBefore !== "" ? Number(newRule.maxDaysBefore) : null,
      minSlotsLeft: newRule.minSlotsLeft !== "" ? Number(newRule.minSlotsLeft) : null,
      maxSlotsLeft: newRule.maxSlotsLeft !== "" ? Number(newRule.maxSlotsLeft) : null,
      priority: Number(newRule.priority) || 1,
    }, { onSuccess: () => { setShowNewRuleForm(false); setNewRule({ ...EMPTY_RULE }); } });
  };

  const handleUpdateRule = (rule, field, value) =>
    updateRule.mutate({ ruleId: rule.id, payload: { ...rule, [field]: value } });

  return (
    <div className="border-t border-blue-100 bg-slate-50 px-5 py-5 space-y-6">
      {/* Price by age */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <FiDollarSign className="text-emerald-500" />
          <h4 className="text-sm font-bold text-slate-700">Cấu hình giá theo độ tuổi</h4>
          {pcLoading && <FiLoader className="animate-spin text-slate-400 h-3.5 w-3.5" />}
          {!pcLoading && !priceConfig && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] text-amber-700">Chưa cấu hình — nhập và lưu</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PRICE_FIELDS.map(({ label, sub, field, color, bg, border }) => (
            <div key={field} className={`rounded-xl border ${border} ${bg} p-3`}>
              <p className="mb-0.5 text-[11px] font-bold text-slate-500">{label}</p>
              <p className="mb-2 text-[10px] text-slate-400">{sub}</p>
              <div className="flex items-baseline gap-1">
                <input type="text" value={fmt(pf[field])}
                  onChange={e => setPf(p => ({ ...p, [field]: e.target.value.replace(/\D/g, "") }))}
                  placeholder="0" className={`w-full bg-transparent text-lg font-bold outline-none ${color}`} />
                <span className="shrink-0 text-[10px] text-slate-400">VND</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing rules */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiShield className="text-slate-500" />
            <h4 className="text-sm font-bold text-slate-700">Quy tắc giảm giá</h4>
            {rules.length > 0 && <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-600">{rules.length}</span>}
            <span title="Quy tắc xác định điều kiện và mức giảm giá tự động" className="cursor-help text-slate-400"><FiInfo className="h-3.5 w-3.5" /></span>
          </div>
          <button onClick={() => { setShowNewRuleForm(true); setNewRule({ ...EMPTY_RULE, priority: rules.length + 1 }); }}
            disabled={showNewRuleForm}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            <FiPlus className="h-3.5 w-3.5" /> Thêm quy tắc
          </button>
        </div>

        {showNewRuleForm && <NewRuleForm data={newRule} onChange={setNr} onSave={handleCreateRule}
          onCancel={() => { setShowNewRuleForm(false); setNewRule({ ...EMPTY_RULE }); }} isSaving={createRule.isPending} />}

        {rulesLoading ? (
          <p className="text-center text-sm text-slate-400 py-4">Đang tải...</p>
        ) : rules.length === 0 && !showNewRuleForm ? (
          <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center">
            <p className="text-sm font-semibold text-slate-400">Chưa có quy tắc nào</p>
            <p className="mt-1 text-xs text-slate-400">Bấm "+ Thêm quy tắc" để tạo quy tắc giảm giá tự động</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rules.map(rule => (
              <ExistingRuleRow key={rule.id} rule={rule}
                expanded={!!expandedRules[rule.id]}
                onToggleExpand={() => setExpandedRules(p => ({ ...p, [rule.id]: !p[rule.id] }))}
                onToggleActive={() => toggleRule.mutate(rule.id)}
                onDelete={() => { if (window.confirm("Xóa quy tắc này?")) deleteRule.mutate(rule.id); }}
                onUpdate={(field, value) => handleUpdateRule(rule, field, value)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end border-t border-slate-200 pt-4">
        <button onClick={handleSavePrice} disabled={upsertPrice.isPending}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-700 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
          {upsertPrice.isPending ? <FiLoader className="animate-spin h-4 w-4" /> : "💾"}
          {upsertPrice.isPending ? "Đang lưu..." : "Lưu cấu hình giá"}
        </button>
      </div>
    </div>
  );
};

export default DeparturePricePanel;
