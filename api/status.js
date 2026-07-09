module.exports = async (req, res) => {
    const allow = [
        "https://baojian-personalweb.vercel.app",
        "https://swording-k.github.io",
    ];
    const origin = req.headers.origin;
    if (allow.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Vary", "Origin");
    }

    if (req.method === "OPTIONS") {
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-status-token");
        return res.status(204).end();
    }

    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    const ownerToken = process.env.OWNER_STATUS_TOKEN;
    const configured = Boolean(kvUrl && kvToken);

    // GET — public, read current status
    if (req.method === "GET") {
        if (!configured) {
            return res.status(200).json({ ok: true, text: null, updatedAt: null, persisted: false });
        }
        try {
            const auth = { Authorization: `Bearer ${kvToken}` };
            const rText = await fetch(`${kvUrl}/get/owner_status`, { method: "POST", headers: auth });
            const jText = await rText.json();
            const rTs = await fetch(`${kvUrl}/get/owner_status_ts`, { method: "POST", headers: auth });
            const jTs = await rTs.json();
            const text = jText.result ? jText.result.trim() || null : null;
            const updatedAt = jTs.result ? Number(jTs.result.trim()) || null : null;
            res.setHeader("Cache-Control", "public, max-age=30");
            return res.status(200).json({ ok: true, text, updatedAt, persisted: true });
        } catch (e) {
            return res.status(200).json({ ok: true, text: null, updatedAt: null, persisted: false });
        }
    }

    // POST — authed, update status
    if (req.method === "POST") {
        if (!ownerToken) {
            return res.status(503).json({ ok: false, error: "owner_token_not_configured" });
        }
        const sent = req.headers["x-status-token"];
        if (!sent || sent !== ownerToken) {
            return res.status(401).json({ ok: false, error: "unauthorized" });
        }
        if (!configured) {
            return res.status(503).json({ ok: false, error: "storage_unavailable" });
        }
        let body = {};
        try {
            body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
        } catch (e) {
            return res.status(400).json({ ok: false, error: "bad_json" });
        }
            const raw = typeof body.text === "string" ? body.text.trim() : "";
            if (raw.length > 40) {
                return res.status(400).json({ ok: false, error: "too_long", max: 40 });
            }
            try {
                const auth = { Authorization: `Bearer ${kvToken}`, "Content-Type": "application/json" };
                const ts = Date.now();
                if (raw === "") {
                    const d1 = await fetch(`${kvUrl}/del/owner_status`, { method: "POST", headers: auth });
                    const d1j = await d1.json().catch(() => ({}));
                    const d2 = await fetch(`${kvUrl}/del/owner_status_ts`, { method: "POST", headers: auth });
                    const d2j = await d2.json().catch(() => ({}));
                    return res.status(200).json({ ok: true, text: "", updatedAt: null, _del: [d1j, d2j] });
                }
                await fetch(`${kvUrl}/set/owner_status/${encodeURIComponent(raw)}`, {
                    method: "POST",
                    headers: auth,
                });
                await fetch(`${kvUrl}/set/owner_status_ts/${ts}`, {
                    method: "POST",
                    headers: auth,
                });
                return res.status(200).json({ ok: true, text: raw, updatedAt: ts });
        } catch (e) {
            return res.status(500).json({ ok: false, error: "storage_failed" });
        }
    }

    return res.status(405).json({ ok: false, error: "method_not_allowed" });
};
