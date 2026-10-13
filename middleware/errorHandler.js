class AppError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.name = "AppError";
		this.statusCode = statusCode;
		Error.captureStackTrace(this, this.constructor);
	}
}

function errorHandler(error, req, res, next) {
	if (res.headersSent) {
		return next(error);
	}

	const statusCode =
		Number.isInteger(error.statusCode) &&
		error.statusCode >= 400 &&
		error.statusCode < 600
			? error.statusCode
			: 500;
	const message =
		statusCode === 500 ? "Internal server error" : error.message;

	if (statusCode === 500) {
		console.error(error);
	}

	res.status(statusCode).json({
		success: false,
		error: { message },
	});
}

module.exports = { AppError, errorHandler };
