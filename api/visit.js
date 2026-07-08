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
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        return res.status(204).end();
    }

    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    const configured = Boolean(kvUrl && kvToken);

    const cookie = req.headers.cookie || "";
    const counted = cookie.includes("kunwu_visited=1");

    let count = 0;
    let firstVisit = false;
    let persisted = false;

    if (configured) {
        try {
            const auth = { Authorization: `Bearer ${kvToken}` };
            if (!counted) {
                const r = await fetch(`${kvUrl}/incr/visit_count`, {
                    method: "POST",
                    headers: auth,
                });
                const j = await r.json();
                count = Number(j.result) || 0;
                firstVisit = true;
                res.setHeader(
                    "Set-Cookie",
                    "kunwu_visited=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure"
                );
            } else {
                const r = await fetch(`${kvUrl}/get/visit_count`, {
                    method: "POST",
                    headers: auth,
                });
                const j = await r.json();
                count = Number(j.result) || 0;
            }
            persisted = true;
        } catch (e) {
            persisted = false;
            count = 0;
        }
    }

    res.status(200).json({ count, firstVisit, persisted });
};
