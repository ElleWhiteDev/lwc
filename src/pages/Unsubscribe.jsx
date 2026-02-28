import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import "./Unsubscribe.css";

function Unsubscribe() {
	const [searchParams] = useSearchParams();
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");

	const email = searchParams.get("email");
	const token = searchParams.get("token");

	const handleUnsubscribe = async () => {
		if (!email || !token) {
			setError("Invalid unsubscribe link. Please check your email for the correct link.");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const response = await fetch("/api/newsletter/unsubscribe", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, token }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to unsubscribe");
			}

			setSuccess(true);
			toast.success(data.message || "Successfully unsubscribed!");
		} catch (err) {
			setError(err.message || "Failed to unsubscribe. Please try again.");
			toast.error(err.message || "Failed to unsubscribe");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		// Auto-unsubscribe if email and token are present
		if (email && token && !success && !error) {
			handleUnsubscribe();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [email, token]);

	return (
		<div className="unsubscribe-page">
			<div className="container">
				<div className="unsubscribe-card">
					{loading && (
						<div className="unsubscribe-content">
							<h1>Unsubscribing...</h1>
							<p>Please wait while we process your request.</p>
						</div>
					)}

					{success && (
						<div className="unsubscribe-content success">
							<h1>✓ Successfully Unsubscribed</h1>
							<p>You have been removed from our newsletter mailing list.</p>
							<p>We're sorry to see you go! If you change your mind, you can always resubscribe from our homepage.</p>
							<a href="/" className="btn btn-primary" style={{ marginTop: "var(--spacing-lg)" }}>
								Return to Homepage
							</a>
						</div>
					)}

					{error && !success && (
						<div className="unsubscribe-content error">
							<h1>Unsubscribe Failed</h1>
							<p className="error-message">{error}</p>
							<a href="/" className="btn btn-primary" style={{ marginTop: "var(--spacing-lg)" }}>
								Return to Homepage
							</a>
						</div>
					)}

					{!loading && !success && !error && (
						<div className="unsubscribe-content">
							<h1>Unsubscribe from Newsletter</h1>
							<p>Processing your unsubscribe request...</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default Unsubscribe;

