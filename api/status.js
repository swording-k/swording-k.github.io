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
    const configured = Boolean(kvUrl && kvToken);

    async function kvGet(key) {
        const r = await fetch(`${kvUrl}/get/${key}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${kvToken}` },
        });
        const j = await r.json();
        return j.result || null;
    }
    async function kvSet(key, value) {
        await fetch(`${kvUrl}/set/${key}/${encodeURIComponent(value)}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${kvToken}` },
        });
    }
    async function kvDel(key) {
        await fetch(`${kvUrl}/del/${key}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${kvToken}` },
        });
    }

    // GET — public, read current status
    if (req.method === "GET") {
        if (!configured) {
            return res.status(200).json({ ok: true, text: null, updatedAt: null, persisted: false });
        }
        try {
            const text = (await kvGet("owner_status") || "").trim() || null;
            const ts = Number((await kvGet("owner_status_ts") || "").trim()) || null;
            res.setHeader("Cache-Control", "public, max-age=30");
            return res.status(200).json({ ok: true, text, updatedAt: ts, persisted: true });
        } catch (e) {
            return res.status(200).json({ ok: true, text: null, updatedAt: null, persisted: false });
        }
    }

    // POST — authed, update status
    if (req.method === "POST") {
        let body = {};
        try {
            body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
        } catch (e) {
            return res.status(400).json({ ok: false, error: "bad_json" });
        }

        // One-time bootstrap: write the status token into KV (requires the env token)
        if (body.bootstrap_token && body.bootstrap_token === process.env.OWNER_STATUS_TOKEN) {
            if (!configured || !body.token) {
                return res.status(400).json({ ok: false, error: "bad_bootstrap" });
            }
            await kvSet("owner_status_token", body.token);
            return res.status(200).json({ ok: true, bootstrapped: true });
        }

        if (!configured) {
            return res.status(503).json({ ok: false, error: "storage_unavailable" });
        }
        const ownerToken = (await kvGet("owner_status_token") || "").trim() || null;
        if (!ownerToken) {
            return res.status(503).json({ ok: false, error: "owner_token_not_configured" });
        }

        const sent = req.headers["x-status-token"];
        if (!sent || sent !== ownerToken) {
            return res.status(401).json({ ok: false, error: "unauthorized" });
        }

        const raw = typeof body.text === "string" ? body.text.trim() : "";
        if (raw.length > 40) {
            return res.status(400).json({ ok: false, error: "too_long", max: 40 });
        }
        try {
            const ts = Date.now();
            if (raw === "") {
                await kvDel("owner_status");
                await kvDel("owner_status_ts");
                return res.status(200).json({ ok: true, text: "", updatedAt: null });
            }
            await kvSet("owner_status", raw);
            await kvSet("owner_status_ts", String(ts));
            return res.status(200).json({ ok: true, text: raw, updatedAt: ts });
        } catch (e) {
            return res.status(500).json({ ok: false, error: "storage_failed" });
        }
    }

    return res.status(405).json({ ok: false, error: "method_not_allowed" });
};
