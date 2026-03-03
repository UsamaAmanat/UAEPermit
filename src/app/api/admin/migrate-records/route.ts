import { NextRequest, NextResponse } from "next/server";
import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import oldRecords from "@/lib/oldRecords";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789ABCDEFGHJKLMNPQRSTUVWXYZ", 10);

function mapOldToNewStatus(orderStat: number, payStat: number) {
  if (payStat === 0) return "pending";
  if (orderStat === 4 || orderStat === 3) return "issued";
  if (orderStat === 7) return "rejected";
  if (orderStat === 2 || orderStat === 1) return "processing";
  return "submitted";
}

export async function POST(req: NextRequest) {
  try {
    const { offset = 0, limit = 50 } = await req.json();

    const totalRecords = oldRecords.length;
    const slice = oldRecords.slice(offset, offset + limit);

    if (slice.length === 0) {
      return NextResponse.json({ success: true, finished: true, message: "No more records" });
    }

    // Process using firestore batch, max 500 per batch.
    const batch = writeBatch(db);
    const applicationsRef = collection(db, "applications");

    for (const record of slice) {
      const newAppRef = doc(applicationsRef); 

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let parsedApplicants: any[] = [];
      try {
        if (record.applicants && typeof record.applicants === "string") {
          const arr = JSON.parse(record.applicants);
          if (Array.isArray(arr)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            parsedApplicants = arr.map((a: any) => ({
              id: Date.now().toString() + Math.random().toString(36).substring(7),
              firstName: a.first_name || "",
              lastName: a.last_name || "",
              email: a.email || "",
              phone: a.phone || "",
              countryCode: "",
              nationality: "",
              applyingFrom: "",
              dob: "",
              passportNumber: a.passport_no || "",
              passportExpiry: "",
              profession: a.profession || "",
              purposeOfTravel: a.purpose || "",
              tentativeTravelDate: a.travel_date || "",
              status: mapOldToNewStatus(record.order_status, record.payment_status),
            }));
          }
        }
      } catch (err) {
        console.warn("Failed to parse applicants for record", record.id);
      }

      batch.set(newAppRef, {
        plan: {
          id: "",
          country: record.country_name || "Unknown",
          visa: record.product_name || "Unknown",
          entry: record.visa_type_description || "Unknown",
          price: (record.total || 0).toString(),
          processingTime: "",
          validity: "",
        },
        applicants: parsedApplicants,
        extraFastSelected: false,
        extraFastFeePerApplicant: 0,
        grandTotal: record.total || 0,
        status: mapOldToNewStatus(record.order_status, record.payment_status),
        trackingId: record.tracking_id || nanoid(),
        orderId: null,
        leadSource: null,
        createAccount: false,
        userId: null,
        createdAt: new Date(record.created_at || Date.now()),
        updatedAt: new Date(record.updated_at || Date.now()),
        paymentStatus: record.payment_status === 1 ? "paid" : "pending",
        paidAmount: record.payment_status === 1 ? record.total : 0,
        paidCurrency: record.currency || "usd",
        testImport: true, 
      });
    }

    // Commit writes
    await batch.commit();

    return NextResponse.json({
      success: true,
      processed: slice.length,
      nextOffset: offset + slice.length,
      totalRecords,
      finished: offset + slice.length >= totalRecords
    });
  } catch (err: any) {
    console.error("Migration error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
