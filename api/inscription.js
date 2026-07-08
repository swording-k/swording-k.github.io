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
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        return res.status(204).end();
    }

    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    const configured = Boolean(kvUrl && kvToken);

    // Graceful degradation when KV is not connected.
    if (!configured) {
        if (req.method === "GET") {
            return res.status(200).json({ ok: true, items: [], persisted: false });
        }
        return res.status(503).json({ ok: false, error: "storage_unavailable", persisted: false });
    }

    const auth = { Authorization: `Bearer ${kvToken}` };
    const LIST_KEY = "inscriptions";
    const MAX_ITEMS = 200;
    const RATE_KEY_PREFIX = "ins_rate:";
    const RATE_WINDOW_MS = 60 * 1000; // one inscription per IP per minute
    const MAX_LEN = 60;

    const clientIp =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.headers["x-real-ip"] ||
        "unknown";
    const ipHash = Buffer.from(clientIp).toString("base64").replace(/=+$/, "").slice(0, 24);

    if (req.method === "GET") {
        try {
            const r = await fetch(`${kvUrl}/lrange/${LIST_KEY}/0/39`, {
                method: "POST",
                headers: auth,
            });
            const j = await r.json();
            const raw = Array.isArray(j.result) ? j.result : [];
            const items = raw
                .map((s) => {
                    try {
                        return JSON.parse(s);
                    } catch {
                        return null;
                    }
                })
                .filter(Boolean);
            return res.status(200).json({ ok: true, items, persisted: true });
        } catch (e) {
            return res.status(200).json({ ok: true, items: [], persisted: false });
        }
    }

    if (req.method === "POST") {
        let body;
        try {
            body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
        } catch {
            return res.status(400).json({ ok: false, error: "invalid_json" });
        }

        const text = String(body.text || "").trim();
        const name = String(body.name || "").trim();
        if (!text) return res.status(400).json({ ok: false, error: "empty_text" });
        if (text.length > MAX_LEN) {
            return res.status(400).json({ ok: false, error: "too_long", max: MAX_LEN });
        }

        try {
            // Rate limit check.
            const rlKey = RATE_KEY_PREFIX + ipHash;
            const rlRes = await fetch(`${kvUrl}/get/${rlKey}`, {
                method: "POST",
                headers: auth,
            });
            const rlJson = await rlRes.json();
            const last = Number(rlJson.result) || 0;
            const now = Date.now();
            if (last && now - last < RATE_WINDOW_MS) {
                const wait = Math.ceil((RATE_WINDOW_MS - (now - last)) / 1000);
                return res.status(429).json({ ok: false, error: "rate_limited", wait });
            }

            const entry = {
                id: now.toString(36) + Math.random().toString(36).slice(2, 7),
                t: now,
                text,
                name: name ? name.slice(0, 20) : "无名",
            };

            await fetch(`${kvUrl}/lpush/${LIST_KEY}`, {
                method: "POST",
                headers: { ...auth, "Content-Type": "application/json" },
                body: JSON.stringify(entry),
            });
            await fetch(`${kvUrl}/ltrim/${LIST_KEY}/0/${MAX_ITEMS - 1}`, {
                method: "POST",
                headers: auth,
            });
            await fetch(`${kvUrl}/set/${rlKey}/${now}`, {
                method: "POST",
                headers: auth,
            });
            await fetch(`${kvUrl}/pexpire/${rlKey}/${RATE_WINDOW_MS}`, {
                method: "POST",
                headers: auth,
            });

            return res.status(201).json({ ok: true, item: entry });
        } catch (e) {
            return res.status(500).json({ ok: false, error: "storage_error" });
        }
    }

    return res.status(405).json({ ok: false, error: "method_not_allowed" });
};
