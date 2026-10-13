const windowMs = 15 * 60 * 1000;
const maxRequests = 100;
const requests = new Map();

function rateLimiter(req, res, next) {
	const now = Date.now();
	const key = req.ip;
	let record = requests.get(key);

	if (!record || record.resetAt <= now) {
		record = { count: 0, resetAt: now + windowMs };
		requests.set(key, record);
	}

	record.count += 1;
	res.set("RateLimit-Limit", String(maxRequests));
	res.set("RateLimit-Remaining", String(Math.max(0, maxRequests - record.count)));
	res.set("RateLimit-Reset", String(Math.ceil(record.resetAt / 1000)));

	if (record.count > maxRequests) {
		return res.status(429).json({
			success: false,
			error: { message: "Too many requests; please try again later" },
		});
	}

	if (requests.size > 10_000) {
		for (const [requestKey, requestRecord] of requests) {
			if (requestRecord.resetAt <= now) {
				requests.delete(requestKey);
			}
		}
	}

	next();
}

module.exports = rateLimiter;
