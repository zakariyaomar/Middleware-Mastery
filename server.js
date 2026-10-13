const express = require("express");
const logger = require("./middleware/logger");
const auth = require("./middleware/auth");
const rateLimiter = require("./middleware/rateLimiter");
const { AppError, errorHandler } = require("./middleware/errorHandler");

const app = express();
const port = process.env.PORT || 3000;

const cities = [
	{ id: 1, name: "Nairobi", county: "Nairobi" },
	{ id: 2, name: "Nanyuki", county: "Laikipia" },
];

app.use(express.json());
app.use(logger);
app.use(rateLimiter);

app.get("/api/health", (req, res) => {
	res.json({ status: "ok" });
});

app.get("/api/cities", (req, res) => {
	res.json({ success: true, data: cities });
});

app.get("/api/cities/:id", (req, res, next) => {
	try {
		const city = cities.find((item) => item.id === Number.parseInt(req.params.id, 10));

		if (!city) {
			throw new AppError("City not found", 404);
		}

		res.json({ success: true, data: city });
	} catch (error) {
		next(error);
	}
});

app.post("/api/cities", auth, (req, res, next) => {
	try {
		const { name, county } = req.body;

		if (
			typeof name !== "string" ||
			typeof county !== "string" ||
			!name.trim() ||
			!county.trim()
		) {
			throw new AppError("Name and county are required", 400);
		}

		const nextId =
			cities.reduce((largestId, item) => Math.max(largestId, item.id), 0) + 1;
		const city = { id: nextId, name: name.trim(), county: county.trim() };
		cities.push(city);
		res.status(201).json({ success: true, data: city });
	} catch (error) {
		next(error);
	}
});

app.delete("/api/cities/:id", auth, (req, res, next) => {
	try {
		const cityIndex = cities.findIndex(
			(item) => item.id === Number.parseInt(req.params.id, 10),
		);

		if (cityIndex === -1) {
			throw new AppError("City not found", 404);
		}

		const [city] = cities.splice(cityIndex, 1);
		res.json({ success: true, data: city });
	} catch (error) {
		next(error);
	}
});

app.get("/api/broken-route", () => {
	throw new Error("Unexpected failure");
});

app.use(errorHandler);

if (require.main === module) {
	app.listen(port, () => {
		console.log(`Server listening on http://localhost:${port}`);
	});
}

module.exports = app;
