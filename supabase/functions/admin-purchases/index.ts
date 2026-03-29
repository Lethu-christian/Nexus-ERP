import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

const respond = (data: object, status = 200) =>
    new Response(JSON.stringify(data), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        // Fetch all purchases with user info — service role bypasses RLS completely
        const { data: purchases, error: purchasesErr } = await supabase
            .from("purchases")
            .select("*")
            .order("created_at", { ascending: false });

        if (purchasesErr) {
            console.error("Error fetching purchases:", purchasesErr);
            return respond({ success: false, error: purchasesErr.message }, 500);
        }

        // For purchases with a user_id, fetch the matching profile
        const userIds = [...new Set((purchases || []).map((p: any) => p.user_id).filter(Boolean))];

        let profilesMap: Record<string, { full_name: string; username: string; email: string }> = {};

        if (userIds.length > 0) {
            // Fetch profiles
            const { data: profiles } = await supabase
                .from("profiles")
                .select("id, full_name, username, avatar_url")
                .in("id", userIds);

            // Also fetch user emails from auth.users
            const { data: authUsers } = await supabase.auth.admin.listUsers();
            const emailMap: Record<string, string> = {};
            if (authUsers?.users) {
                authUsers.users.forEach((u: any) => { emailMap[u.id] = u.email; });
            }

            (profiles || []).forEach((p: any) => {
                profilesMap[p.id] = {
                    full_name: p.full_name || "Unknown",
                    username: p.username || "unknown",
                    email: emailMap[p.id] || "",
                };
            });
        }

        // Attach profile info to each purchase
        const enriched = (purchases || []).map((p: any) => ({
            ...p,
            profile: p.user_id ? (profilesMap[p.user_id] || { full_name: "Guest", username: "guest", email: "" }) : { full_name: "Guest", username: "guest", email: "" },
        }));

        return respond({ success: true, purchases: enriched });

    } catch (err: any) {
        console.error("Unhandled error:", err);
        return respond({ success: false, error: err?.message || String(err) }, 500);
    }
});
