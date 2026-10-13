function auth(req, res, next) {
	const expectedToken = process.env.API_TOKEN;

	if (!expectedToken) {
		return res.status(500).json({
			success: false,
			error: { message: "Authentication is not configured" },
		});
	}

	const authorization = req.get("authorization");
	const token = authorization && authorization.match(/^Bearer\s+(.+)$/i);

	if (!token || token[1] !== expectedToken) {
		return res.status(401).json({
			success: false,
			error: { message: "A valid bearer token is required" },
		});
	}

	next();
}

module.exports = auth;
