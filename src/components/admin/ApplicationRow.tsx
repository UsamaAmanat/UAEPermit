"use client";

import { useRouter } from "next/navigation";

export type ApplicationStatus =
  | "pending"
  | "processing"
  | "issued"
  | "rejected"
  | "cancelled"
  | string;

export interface ApplicationRowProps {
  application: {
    id: string;
    trackingId: string;
    applicantName: string;
    countryName: string;
    visaType: string;
    createdAt: string | Date;
    status: ApplicationStatus;
    isUrgent?: boolean;
  };
  /**
   * Optional custom link for the row.
   * If not provided, it will navigate to `/admin/applications/{id}`
   */
  detailHref?: string;
}

/**
 * Small helper to format date nicely
 */
function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Map status → label + tailwind classes
 */
function getStatusStyles(status: ApplicationStatus) {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case "pending":
      return {
        label: "Pending",
        className:
          "bg-amber-50 text-amber-700 border border-amber-200",
      };
    case "processing":
      return {
        label: "Processing",
        className:
          "bg-sky-50 text-sky-700 border border-sky-200",
      };
    case "issued":
    case "visa issued":
      return {
        label: "Visa Issued",
        className:
          "bg-emerald-50 text-emerald-700 border border-emerald-200",
      };
    case "rejected":
      return {
        label: "Rejected",
        className:
          "bg-rose-50 text-rose-700 border border-rose-200",
      };
    case "cancelled":
    case "canceled":
      return {
        label: "Cancelled",
        className:
          "bg-slate-50 text-slate-600 border border-slate-200",
      };
    default:
      return {
        label: status || "—",
        className:
          "bg-slate-50 text-slate-600 border border-slate-200",
      };
  }
}

/**
 * Premium-looking row for the Applications table
 */
export default function ApplicationRow({
  application,
  detailHref,
}: ApplicationRowProps) {
  const router = useRouter();
  const {
    id,
    trackingId,
    applicantName,
    countryName,
    visaType,
    createdAt,
    status,
    isUrgent,
  } = application;

  const statusMeta = getStatusStyles(status);

  const handleClick = () => {
    const href = detailHref ?? `/admin/applications/${id}`;
    router.push(href);
  };

  return (
    <tr
      onClick={handleClick}
      className="
        group cursor-pointer
        border-b border-slate-100
        hover:bg-slate-50/70
        transition-colors
      "
    >
      {/* Tracking ID */}
      <td className="px-4 py-3 text-sm font-medium text-[#3C4161] whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 px-3 rounded-full bg-slate-100 text-[11px] font-semibold tracking-wide uppercase text-slate-700">
            {trackingId}
          </span>
          {isUrgent && (
            <span className="inline-flex items-center rounded-full bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1 animate-pulse" />
              Urgent
            </span>
          )}
        </div>
      </td>

      {/* Applicant Name */}
      <td className="px-4 py-3 text-sm text-slate-800">
        <div className="flex flex-col">
          <span className="font-semibold text-[#3C4161]">
            {applicantName || "—"}
          </span>
          <span className="text-xs text-slate-500">
            {countryName || "Country not set"}
          </span>
        </div>
      </td>

      {/* Visa Type */}
      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {visaType || "—"}
        </span>
      </td>

      {/* Created Date */}
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
        {formatDate(createdAt)}
      </td>

      {/* Status pill */}
      <td className="px-4 py-3 text-sm text-right">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusMeta.className}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current/60 mr-1.5" />
          {statusMeta.label}
        </span>
      </td>

      {/* Chevron / arrow */}
      <td className="px-3 py-3 text-right w-8">
        <span
          className="
            inline-flex items-center justify-center
            w-8 h-8 rounded-full
            text-slate-400
            group-hover:text-[#3946A7]
            group-hover:bg-[#3946A7]/8
            transition-colors
          "
        >
          {/* simple right arrow icon */}
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M9 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </td>
    </tr>
  );
}
