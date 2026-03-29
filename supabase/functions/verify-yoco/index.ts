import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const YOCO_SECRET_KEY = Deno.env.get("YOCO_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const YOCO_API_BASE = "https://payments.yoco.com/api";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const respond = (data: object, status = 200) =>
    new Response(JSON.stringify(data), {
        status: 200, // Always 200 so supabase.functions.invoke() can read the JSON body
        headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "X-Actual-Status": status.toString(),
        },
    });

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

    try {
        if (!YOCO_SECRET_KEY) {
            return respond({ success: false, error: "YOCO_SECRET_KEY not configured in Supabase secrets" }, 500);
        }

        const rawBody = await req.text();
        if (!rawBody) return respond({ success: false, error: "Empty request body" }, 400);

        let body: any;
        try { body = JSON.parse(rawBody); }
        catch (e: any) { return respond({ success: false, error: "Invalid JSON: " + e.message }, 400); }

        const { mode } = body;

        // ── MODE: CREATE CHECKOUT ────────────────────────────────────────────────
        if (mode === "create") {
            const { amountInCents, successUrl, cancelUrl, metadata } = body;

            if (!Number.isInteger(amountInCents) || amountInCents <= 0) {
                return respond({ success: false, error: "amountInCents must be a positive integer" }, 400);
            }
            if (typeof successUrl !== "string" || !successUrl.startsWith("http")) {
                return respond({ success: false, error: "successUrl must be a valid URL" }, 400);
            }

            const payload: Record<string, unknown> = {
                amount: amountInCents,
                currency: "ZAR",
                successUrl,
            };
            if (cancelUrl) payload.cancelUrl = cancelUrl;
            if (metadata) payload.metadata = metadata;

            const res = await fetch(`${YOCO_API_BASE}/checkouts`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${YOCO_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const rawYoco = await res.text();
            let yocoData: any = {};
            try { yocoData = JSON.parse(rawYoco); } catch { }

            if (!res.ok) {
                console.error("Yoco create checkout error:", yocoData);
                return respond({
                    success: false,
                    error: yocoData?.message || `Yoco API Error (${res.status})`,
                    details: yocoData,
                }, 400);
            }

            console.log("Checkout created:", yocoData.id, "→", yocoData.redirectUrl);
            return respond({
                success: true,
                redirectUrl: yocoData.redirectUrl,
                checkoutId: yocoData.id,
            });
        }

        // ── MODE: VERIFY CHECKOUT ────────────────────────────────────────────────
        if (mode === "verify") {
            const { checkoutId, description, userId } = body;

            if (typeof checkoutId !== "string" || checkoutId.length < 5) {
                return respond({ success: false, error: "checkoutId is required" }, 400);
            }

            const res = await fetch(`${YOCO_API_BASE}/checkouts/${checkoutId}`, {
                headers: { Authorization: `Bearer ${YOCO_SECRET_KEY}` },
            });

            const raw = await res.text();
            let yocoData: any = {};
            try { yocoData = JSON.parse(raw); } catch { }

            if (!res.ok) {
                return respond({
                    success: false,
                    error: `Yoco verification failed (${res.status})`,
                    details: yocoData,
                }, 400);
            }

            // Checkout can be "complete" or "completed"
            const paid =
                yocoData?.status === "complete" ||
                yocoData?.status === "completed" ||
                !!yocoData?.paymentId;

            if (!paid) {
                console.warn("Payment not completed. Status:", yocoData?.status);
                return respond({ success: false, error: "Payment not completed", status: yocoData?.status }, 400);
            }

            // Idempotency check - don't double-record
            const { data: existing } = await supabase
                .from("purchases")
                .select("id")
                .eq("reference", checkoutId)
                .maybeSingle();

            if (!existing) {
                const purchaseRecord: Record<string, unknown> = {
                    reference: checkoutId,
                    amount: typeof yocoData?.amount === "number" ? yocoData.amount / 100 : 0,
                    description: description || "LCX STUDIOS Purchase",
                    status: "success",
                };
                // Only add user_id if it's a valid UUID provided
                if (userId && typeof userId === "string" && userId.length > 10) {
                    purchaseRecord.user_id = userId;
                }
                const { error: dbErr } = await supabase.from("purchases").insert(purchaseRecord);
                if (dbErr) console.warn("Could not record purchase:", dbErr.message);
                else console.log("Purchase recorded ✅ for user:", userId || "guest");
            } else {
                console.log("Purchase already recorded (idempotent):", checkoutId);
            }

            console.log("Payment verified ✅:", checkoutId, yocoData?.status);
            return respond({
                success: true,
                status: yocoData?.status,
                amount: yocoData?.amount,
                currency: yocoData?.currency,
            });
        }


        return respond({ success: false, error: "Invalid mode. Use 'create' or 'verify'." }, 400);

    } catch (err: any) {
        console.error("Unhandled error:", err);
        return respond({ success: false, error: err?.message || String(err) }, 500);
    }
});
