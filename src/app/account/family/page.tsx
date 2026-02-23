"use client";

import { useEffect, useState, useCallback, Fragment } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  type FamilyMember,
} from "@/lib/familyMembers";
import { Loader2, Plus, Pencil, Trash2, X, User, Mail, Phone, Globe, Calendar, FileText, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const POPULAR_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia", "Austria",
  "Bahrain", "Bangladesh", "Belgium", "Brazil", "Canada", "China", "Colombia",
  "Denmark", "Egypt", "Ethiopia", "Finland", "France", "Germany", "Ghana",
  "Greece", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Italy", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kuwait", "Lebanon", "Libya", "Malaysia",
  "Mexico", "Morocco", "Nepal", "Netherlands", "New Zealand", "Nigeria",
  "Norway", "Oman", "Pakistan", "Palestine", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Singapore",
  "Somalia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan",
  "Sweden", "Switzerland", "Syria", "Thailand", "Tunisia", "Turkey",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Uzbekistan", "Vietnam", "Yemen", "Zimbabwe",
];

const emptyForm: Partial<FamilyMember> = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  countryCode: "+971",
  nationality: "",
  applyingFrom: "",
  passportNumber: "",
  profession: "",
  dob: "",
  passportExpiry: "",
};

export default function AccountFamilyPage() {
  const { user } = useAuth();
  const [list, setList] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<FamilyMember>>({ ...emptyForm });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const members = await getFamilyMembers(user.uid);
      setList(members);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load family members");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (m: FamilyMember) => {
    setForm({
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      phone: m.phone,
      countryCode: m.countryCode || "+971",
      nationality: m.nationality,
      applyingFrom: m.applyingFrom,
      passportNumber: m.passportNumber,
      profession: m.profession,
      dob: m.dob,
      passportExpiry: m.passportExpiry,
    });
    setEditingId(m.id);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.firstName?.trim() || !form.lastName?.trim()) {
      toast.error("First and last name are required.");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateFamilyMember(user.uid, editingId, form);
        toast.success("Member updated.");
      } else {
        await addFamilyMember(user.uid, form as Omit<FamilyMember, "id" | "createdAt" | "updatedAt">);
        toast.success("Member added.");
      }
      closeModal();
      load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Remove this family member?")) return;
    try {
      await deleteFamilyMember(user.uid, id);
      toast.success("Member removed.");
      load();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Family members</h1>
          <p className="mt-1 text-sm text-slate-500">
            Save family member details to quickly auto-fill when applying for visas.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          <Plus className="h-4 w-4" />
          Add member
        </button>
      </div>

      {/* Members list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
          <User className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">No family members yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Add members to quickly fill their details when applying for visas.
          </p>
          <button
            type="button"
            onClick={openAdd}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add your first member
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((m) => {
            const fullName = [m.firstName, m.lastName].filter(Boolean).join(" ");
            const initials = `${(m.firstName || "?")[0]}${(m.lastName || "?")[0]}`.toUpperCase();
            return (
              <div
                key={m.id}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow transition"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 font-bold text-sm ring-2 ring-emerald-100">
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 truncate">{fullName}</p>
                    {m.email && (
                      <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Mail className="h-3 w-3" /> {m.email}
                      </p>
                    )}
                    {m.phone && (
                      <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Phone className="h-3 w-3" /> {m.countryCode || ""}{m.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  {m.nationality && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Globe className="h-3 w-3 text-slate-400" />
                      {m.nationality}
                    </div>
                  )}
                  {m.passportNumber && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <FileText className="h-3 w-3 text-slate-400" />
                      {m.passportNumber}
                    </div>
                  )}
                  {m.profession && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <ShieldCheck className="h-3 w-3 text-slate-400" />
                      {m.profession}
                    </div>
                  )}
                  {m.dob && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {m.dob}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => openEdit(m)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(m.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-white px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                {editingId ? "Edit family member" : "Add family member"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <div className="px-5 py-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">First name *</label>
                  <input
                    value={form.firstName || ""}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Last name *</label>
                  <input
                    value={form.lastName || ""}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email || ""}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    value={form.phone || ""}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    placeholder="+971 50 123 4567"
                  />
                </div>
              </div>

              {/* Nationality — country selector */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nationality</label>
                  <select
                    value={form.nationality || ""}
                    onChange={(e) => setForm((f) => ({ ...f, nationality: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  >
                    <option value="">Select country</option>
                    {POPULAR_COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Applying from</label>
                  <select
                    value={form.applyingFrom || ""}
                    onChange={(e) => setForm((f) => ({ ...f, applyingFrom: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  >
                    <option value="">Select country</option>
                    {POPULAR_COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Passport number</label>
                  <input
                    value={form.passportNumber || ""}
                    onChange={(e) => setForm((f) => ({ ...f, passportNumber: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    placeholder="AB1234567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Profession</label>
                  <input
                    value={form.profession || ""}
                    onChange={(e) => setForm((f) => ({ ...f, profession: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    placeholder="Software Engineer"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Date of birth</label>
                  <input
                    type="date"
                    value={form.dob || ""}
                    onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Passport expiry</label>
                  <input
                    type="date"
                    value={form.passportExpiry || ""}
                    onChange={(e) => setForm((f) => ({ ...f, passportExpiry: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 flex items-center justify-end gap-3 rounded-b-2xl border-t border-slate-100 bg-slate-50 px-5 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? "Update" : "Add member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
