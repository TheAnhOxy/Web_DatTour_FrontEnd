import React, { useEffect, useMemo, useState } from "react";
import {
  useCreatePromotionMutation,
  useDeletePromotionMutation,
  usePromotionsQuery,
  useTogglePromotionMutation,
  useUpdatePromotionMutation,
  useValidatePromotionQuery,
} from "../api/hooks/promotionHooks";
import { PromotionSidebar } from "../components/promotion/PromotionSidebar";
import { PromotionTable } from "../components/promotion/PromotionTable";
import { FiActivity, FiAlertCircle, FiCheckCircle, FiHash, FiSearch } from "react-icons/fi";

const pageSize = 10;

const toDateTimeLocal = (value) => (value ? value.slice(0, 16) : "");

export const PromotionPage = () => {
  const [page, setPage] = useState(0);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [promotionToDelete, setPromotionToDelete] = useState(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
  const [validateCode, setValidateCode] = useState("");
  const [validateEnabled, setValidateEnabled] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountPercent: "",
    maxDiscount: "",
    usageLimit: "",
    validFrom: "",
    validTo: "",
    isActive: true,
  });

  const { data: pageData, isLoading } = usePromotionsQuery({ page, size: pageSize });
  const promotions = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? 0;

  const { data: validateResult, isFetching: isValidating } = useValidatePromotionQuery(validateCode, validateEnabled);

  const createMutation = useCreatePromotionMutation({
    onSuccess: () => {
      setSelectedPromotion(null);
      setFormData({
        code: "",
        discountPercent: "",
        maxDiscount: "",
        usageLimit: "",
        validFrom: "",
        validTo: "",
        isActive: true,
      });
      setValidateCode("");
      setValidateEnabled(false);
    },
  });

  const updateMutation = useUpdatePromotionMutation({
    onSuccess: () => {
      setSelectedPromotion(null);
      setFormData({
        code: "",
        discountPercent: "",
        maxDiscount: "",
        usageLimit: "",
        validFrom: "",
        validTo: "",
        isActive: true,
      });
      setValidateCode("");
      setValidateEnabled(false);
    },
  });

  const deleteMutation = useDeletePromotionMutation({
    onSuccess: () => {
      setPromotionToDelete(null);
      setDeleteConfirmInput("");
      if (selectedPromotion?.id === promotionToDelete?.id) {
        setSelectedPromotion(null);
        setFormData({
          code: "",
          discountPercent: "",
          maxDiscount: "",
          usageLimit: "",
          validFrom: "",
          validTo: "",
          isActive: true,
        });
      }
    },
  });

  const toggleMutation = useTogglePromotionMutation();

  useEffect(() => {
    if (totalPages > 0 && page >= totalPages) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  const activeCount = useMemo(
    () => promotions.filter((promotion) => promotion.isActive && new Date(promotion.validTo) > new Date()).length,
    [promotions],
  );

  const expiredCount = useMemo(
    () => promotions.filter((promotion) => new Date(promotion.validTo) < new Date()).length,
    [promotions],
  );

  const fullCount = useMemo(
    () => promotions.filter((promotion) => Number(promotion.usedCount || 0) >= Number(promotion.usageLimit || 0)).length,
    [promotions],
  );

  const handleEdit = (promotion) => {
    setSelectedPromotion(promotion);
    setFormData({
      code: promotion.code || "",
      discountPercent: String(promotion.discountPercent ?? ""),
      maxDiscount: String(promotion.maxDiscount ?? ""),
      usageLimit: String(promotion.usageLimit ?? ""),
      validFrom: toDateTimeLocal(promotion.validFrom),
      validTo: toDateTimeLocal(promotion.validTo),
      isActive: Boolean(promotion.isActive),
    });
    setValidateCode(promotion.code || "");
    setValidateEnabled(false);
  };

  const handleStartCreate = () => {
    setSelectedPromotion(null);
    setFormData({
      code: "",
      discountPercent: "",
      maxDiscount: "",
      usageLimit: "",
      validFrom: "",
      validTo: "",
      isActive: true,
    });
    setValidateCode("");
    setValidateEnabled(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      code: formData.code.trim().toUpperCase(),
      discountPercent: Number(formData.discountPercent),
      maxDiscount: Number(formData.maxDiscount),
      usageLimit: Number(formData.usageLimit),
      validFrom: formData.validFrom ? `${formData.validFrom}:00` : null,
      validTo: formData.validTo ? `${formData.validTo}:00` : null,
      isActive: Boolean(formData.isActive),
    };

    if (selectedPromotion) {
      updateMutation.mutate({ id: selectedPromotion.id, ...payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const handleDelete = (promotion) => {
    setPromotionToDelete(promotion);
    setDeleteConfirmInput("");
  };

  const handleConfirmDelete = () => {
    if (!promotionToDelete) return;
    if (deleteConfirmInput.trim() !== promotionToDelete.code) return;
    deleteMutation.mutate(promotionToDelete.id);
  };

  const handleValidate = () => {
    setValidateEnabled(true);
  };

  const cardStyle = (tone) => `rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,0.05)] ${tone || ""}`;

  const statCards = [
    { label: "Tổng mã", value: totalElements, icon: FiHash, accent: "text-blue-600 bg-blue-50 border-blue-200" },
    { label: "Đang chạy", value: activeCount, icon: FiActivity, accent: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { label: "Hết hạn", value: expiredCount, icon: FiAlertCircle, accent: "text-rose-600 bg-rose-50 border-rose-200" },
    { label: "Dùng hết", value: fullCount, icon: FiCheckCircle, accent: "text-amber-600 bg-amber-50 border-amber-200" },
  ];

  return (
    <div className="space-y-5 text-slate-700">
      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-white px-6 py-6">
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight text-blue-600 md:text-[42px]">
                Quản lý Khuyến mãi
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                Tạo, cập nhật và theo dõi các mã khuyến mãi trong hệ thống.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-6 py-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.35fr)]">
          {statCards.map((card) => {
            const IconComponent = card.icon;
            const labelClass = card.accent.split(" ")[0];
            return (
              <div key={card.label} className={cardStyle()}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.22em] ${labelClass}`}>{card.label}</p>
                    <p className="mt-1.5 text-3xl font-black tracking-tight text-slate-950">{card.value}</p>
                  </div>
                  <div className={`grid h-10 w-10 place-items-center rounded-2xl border ${card.accent}`}>
                    <IconComponent className="text-base" />
                  </div>
                </div>
              </div>
            );
          })}

          <div className={cardStyle()}>
            <div className="flex items-center gap-3">
              <input
                value={validateCode}
                onChange={(event) => setValidateCode(event.target.value.toUpperCase())}
                placeholder="Nhập mã để kiểm tra"
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleValidate}
                disabled={isValidating || !validateCode.trim()}
                aria-label="Kiểm tra mã"
                className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiSearch className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 px-6 pb-6 xl:grid-cols-[minmax(0,1.7fr)_320px] xl:items-start">
          <PromotionTable
            promotions={promotions}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={(promotion) => toggleMutation.mutate(promotion.id)}
            togglePending={toggleMutation.isPending}
            deletePending={deleteMutation.isPending}
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={setPage}
          />

          <div className="w-full xl:sticky xl:top-6">
            <PromotionSidebar
              isEditing={Boolean(selectedPromotion)}
              editingPromotion={selectedPromotion}
              formData={formData}
              onFormChange={(field, value) => setFormData((prev) => ({ ...prev, [field]: value }))}
              onSubmit={handleSubmit}
              onStartCreate={handleStartCreate}
              isSaving={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </div>
      </section>

      {promotionToDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-white/10 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.24)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-rose-700">
                Xác nhận xóa
              </div>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950">
                Xóa mã {promotionToDelete.code}?
              </h3>
            </div>

            <div className="space-y-4 px-6 py-5 text-sm text-slate-600">
              <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
                Chỉ xóa được mã chưa có lượt dùng.
              </p>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-slate-600">
                  Nhập đúng mã để xác nhận
                </label>
                <input
                  type="text"
                  value={deleteConfirmInput}
                  onChange={(event) => setDeleteConfirmInput(event.target.value.toUpperCase())}
                  placeholder={promotionToDelete.code}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-1 focus:ring-rose-200"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-5">
              <button
                type="button"
                onClick={() => {
                  setPromotionToDelete(null);
                  setDeleteConfirmInput("");
                }}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending || deleteConfirmInput.trim() !== promotionToDelete.code}
                className="rounded-2xl border border-rose-500 bg-rose-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Đang xóa..." : "Xóa khuyến mãi"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};