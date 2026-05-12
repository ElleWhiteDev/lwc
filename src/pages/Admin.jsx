import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
	rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./Admin.css";

const TABS = [
	"content",
	"events",
	"board",
	"news",
	"users",
	"audit",
	"profile",
	"settings",
];

function Admin() {
	const { user, logout } = useAuth();
	const [activeTab, setActiveTab] = useState("content");
	const isAdmin = Boolean(user?.isAdmin);

	// Debug logging
	console.log("Admin.jsx - User object:", user);
	console.log("Admin.jsx - isAdmin:", isAdmin);
	console.log("Admin.jsx - user?.isAdmin:", user?.isAdmin);
	console.log("Admin.jsx - user?.role:", user?.role);

	// Non-admin users only see: content, events, news, profile
	const visibleTabs = isAdmin
		? TABS
		: TABS.filter((tab) => ["content", "events", "news", "profile"].includes(tab));

	console.log("Admin.jsx - visibleTabs:", visibleTabs);

	return (
		<div className="admin-page">
			<div className="container">
				<header className="admin-header">
					<div>
						<h1>Admin Panel</h1>
						{user && (
							<p className="admin-subtitle">Signed in as {user.email}</p>
						)}
					</div>
					<button
						type="button"
						className="btn btn-cta-secondary"
						onClick={logout}
					>
						Log Out
					</button>
				</header>

				<nav className="admin-tabs" aria-label="Admin sections">
					{visibleTabs.map((tab) => (
						<button
							key={tab}
							type="button"
							className={
								tab === activeTab ? "admin-tab admin-tab-active" : "admin-tab"
							}
							onClick={() => setActiveTab(tab)}
						>
							{tab === "content" && "Content"}
							{tab === "events" && "Events"}
							{tab === "news" && "News"}
							{tab === "users" && "Users"}
							{tab === "board" && "Board Members"}
							{tab === "settings" && "Settings"}
							{tab === "profile" && "My Profile"}
							{tab === "newsletter" && "Newsletter"}
						{tab === "audit" && "Audit Log"}
						</button>
					))}
				</nav>

				<section className="admin-section">
					{activeTab === "content" && <ContentSection />}
					{activeTab === "events" && <EventsSection />}
					{activeTab === "news" && <NewsSection />}
					{activeTab === "users" && isAdmin && <UsersSection />}
					{activeTab === "board" && <BoardMembersSection />}
					{activeTab === "settings" && <SettingsSection />}
					{activeTab === "profile" && <ProfileSection />}
					{activeTab === "newsletter" && isAdmin && <NewsletterSection />}
				{activeTab === "audit" && <AuditLogSection />}
				</section>
			</div>
		</div>
	);
}

function ContentSection() {
	const [page, setPage] = useState("home");

	return (
		<div>
			<h2>Page Content</h2>
			<p className="admin-help-text">
				Edit content for each page using the visual form builder below.
			</p>
			<div className="admin-field-row">
				<label>
					Page
					<select
						value={page}
						onChange={(event) => setPage(event.target.value)}
					>
						<option value="home">Home</option>
						<option value="about">About</option>
						<option value="resources">Resources</option>
						<option value="siteConfig">Site Config</option>
					</select>
				</label>
			</div>

			{page === "home" && <HomeContentEditor />}
			{page === "about" && <AboutContentEditor />}
			{page === "resources" && <ResourcesContentEditor />}
			{page === "siteConfig" && <SiteConfigEditor />}
		</div>
	);
}

// Home Page Content Editor
function HomeContentEditor() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Hero Section
	const [heroSubtitle, setHeroSubtitle] = useState(
		"A Life Worth Celebrating is a nonprofit organization dedicated to advancing inclusion, education, and community engagement for LGBTQ+ individuals and allies in Winchester, Kentucky. Through public events, cultural programming, and visibility initiatives, we work to foster safety, dignity, and belonging—ensuring that every person has the opportunity to live a life worth celebrating.",
	);

	// Pride Festival Section
	const [prideFestivalTitle, setPrideFestivalTitle] = useState(
		"Pride Festival 2024",
	);
	const [prideFestivalDescription, setPrideFestivalDescription] = useState(
		"Thank you to everyone who joined us for an incredible Pride Festival! Together, we celebrated diversity, spread love, and created unforgettable memories. Our community came together with music, art, food, and most importantly — love.",
	);
	const [prideAttendees, setPrideAttendees] = useState("750+");
	const [prideVendors, setPrideVendors] = useState("35+");
	const [prideShows, setPrideShows] = useState("8");

	// Pride Festival Photos
	const [prideFestivalPhotos, setPrideFestivalPhotos] = useState([]);
	const [uploadProgress, setUploadProgress] = useState(null); // { current: filename, done: n, total: n }

	// CTA Section
	const [ctaHeading, setCtaHeading] = useState("Ready to Make a Difference?");
	const [ctaBody, setCtaBody] = useState(
		"Join our community of supporters and help us create a world where every life is celebrated.",
	);

	useEffect(() => {
		let isMounted = true;

		async function loadContent() {
			setLoading(true);
			setError("");
			try {
				const response = await fetch("/api/content/home");
				if (!isMounted) return;
				if (response.ok) {
					const data = await response.json();
					const content = data.data ?? {};

					// Only update if content exists, otherwise keep defaults
					if (content.heroSubtitle) setHeroSubtitle(content.heroSubtitle);
					if (content.prideFestivalTitle)
						setPrideFestivalTitle(content.prideFestivalTitle);
					if (content.prideFestivalDescription)
						setPrideFestivalDescription(content.prideFestivalDescription);
					if (content.prideAttendees) setPrideAttendees(content.prideAttendees);
					if (content.prideVendors) setPrideVendors(content.prideVendors);
					if (content.prideShows) setPrideShows(content.prideShows);
					if (Array.isArray(content.prideFestivalPhotos))
						setPrideFestivalPhotos(content.prideFestivalPhotos);
					if (content.ctaHeading) setCtaHeading(content.ctaHeading);
					if (content.ctaBody) setCtaBody(content.ctaBody);
				}
			} catch {
				if (isMounted) {
					setError("Failed to load content");
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}

		loadContent();

		return () => {
			isMounted = false;
		};
	}, []);

	const handlePhotoUpload = async (e) => {
		const files = Array.from(e.target.files);
		if (!files.length) return;
		setError("");
		let successCount = 0;
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			setUploadProgress({ current: file.name, done: i, total: files.length });
			try {
				const formData = new FormData();
				formData.append("image", file);
				const res = await fetch("/api/pride-festival-image", {
					method: "POST",
					credentials: "include",
					body: formData,
				});
				if (!res.ok) {
					const data = await res.json().catch(() => null);
					throw new Error(data?.message || "Upload failed");
				}
				const data = await res.json();
				setPrideFestivalPhotos((prev) => [...prev, data.imageUrl]);
				successCount++;
			} catch (err) {
				toast.error(`Failed to upload "${file.name}": ${err.message}`);
			}
		}
		setUploadProgress(null);
		e.target.value = "";
		if (successCount > 0)
			toast.success(`${successCount} photo${successCount > 1 ? "s" : ""} uploaded`);
	};

	const handlePhotoDelete = async (imageUrl) => {
		try {
			const res = await fetch("/api/pride-festival-image", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ imageUrl }),
			});
			if (!res.ok && res.status !== 204) {
				const data = await res.json().catch(() => null);
				throw new Error(data?.message || "Delete failed");
			}
			setPrideFestivalPhotos((prev) => prev.filter((url) => url !== imageUrl));
			toast.success("Photo removed");
		} catch (err) {
			toast.error(err.message || "Failed to delete photo");
		}
	};

	const handleSave = async (event) => {
		event.preventDefault();
		setError("");
		setSuccess("");

		const content = {
			heroSubtitle,
			prideFestivalTitle,
			prideFestivalDescription,
			prideAttendees,
			prideVendors,
			prideShows,
			prideFestivalPhotos,
			ctaHeading,
			ctaBody,
		};

		try {
			const response = await fetch("/api/content/home", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ data: content }),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.message || "Failed to save content");
			}

			setSuccess("Home page content saved successfully!");
			toast.success("Home page content saved successfully!");
			// Scroll to top to show success message
			window.scrollTo({ top: 0, behavior: "smooth" });
		} catch (err) {
			setError(err.message || "Failed to save content");
			toast.error(err.message || "Failed to save content");
			// Scroll to top to show error message
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	if (loading) {
		return <p>Loading content...</p>;
	}

	return (
		<form onSubmit={handleSave} className="admin-form">
			{error && <p className="form-error">{error}</p>}
			{success && <p className="form-success">{success}</p>}

			<h3
				style={{
					marginTop: "var(--spacing-xl)",
					marginBottom: "var(--spacing-md)",
				}}
			>
				Hero Section
			</h3>
			<label className="form-field">
				<span>Hero Subtitle</span>
				<textarea
					rows={3}
					value={heroSubtitle}
					onChange={(e) => setHeroSubtitle(e.target.value)}
					placeholder="A Life Worth Celebrating is a nonprofit organization..."
				/>
			</label>

			<h3
				style={{
					marginTop: "var(--spacing-xl)",
					marginBottom: "var(--spacing-md)",
				}}
			>
				Pride Festival Highlight
			</h3>
			<label className="form-field">
				<span>Festival Title</span>
				<input
					type="text"
					value={prideFestivalTitle}
					onChange={(e) => setPrideFestivalTitle(e.target.value)}
					placeholder="Pride Festival 2024"
				/>
			</label>
			<label className="form-field">
				<span>Festival Description</span>
				<textarea
					rows={4}
					value={prideFestivalDescription}
					onChange={(e) => setPrideFestivalDescription(e.target.value)}
					placeholder="Thank you to everyone who joined us..."
				/>
			</label>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(3, 1fr)",
					gap: "var(--spacing-md)",
				}}
			>
				<label className="form-field">
					<span>Attendees</span>
					<input
						type="text"
						value={prideAttendees}
						onChange={(e) => setPrideAttendees(e.target.value)}
						placeholder="750+"
					/>
				</label>
				<label className="form-field">
					<span>Vendors</span>
					<input
						type="text"
						value={prideVendors}
						onChange={(e) => setPrideVendors(e.target.value)}
						placeholder="35+"
					/>
				</label>
				<label className="form-field">
					<span>Shows</span>
					<input
						type="text"
						value={prideShows}
						onChange={(e) => setPrideShows(e.target.value)}
						placeholder="8"
					/>
				</label>
			</div>

			<h4 style={{ marginTop: "var(--spacing-lg)", marginBottom: "var(--spacing-sm)" }}>
				Festival Photos
			</h4>
			<label className="form-field">
				<span>Upload Photos (JPG, PNG — multiple allowed)</span>
				<input
					type="file"
					accept="image/*"
					multiple
					disabled={uploadProgress !== null}
					onChange={handlePhotoUpload}
				/>
			</label>
			{uploadProgress !== null && (
				<p style={{ color: "var(--medium-gray)", margin: 0, fontSize: "0.9rem" }}>
					Uploading {uploadProgress.done + 1} of {uploadProgress.total}: <strong>{uploadProgress.current}</strong>
				</p>
			)}
			{prideFestivalPhotos.length > 0 && (
				<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "var(--spacing-sm)", marginTop: "var(--spacing-sm)" }}>
					{prideFestivalPhotos.map((url) => (
						<div key={url} style={{ position: "relative" }}>
							<img
								src={url}
								alt="Festival photo"
								style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "var(--radius-md)" }}
							/>
							<button
								type="button"
								onClick={() => handlePhotoDelete(url)}
								style={{
									position: "absolute", top: 4, right: 4,
									background: "rgba(0,0,0,0.6)", color: "#fff",
									border: "none", borderRadius: "50%",
									width: 24, height: 24, cursor: "pointer",
									fontSize: "0.75rem", lineHeight: 1,
								}}
								aria-label="Remove photo"
							>
								✕
							</button>
						</div>
					))}
				</div>
			)}

			<h3
				style={{
					marginTop: "var(--spacing-xl)",
					marginBottom: "var(--spacing-md)",
				}}
			>
				Call to Action Section
			</h3>
			<label className="form-field">
				<span>CTA Heading</span>
				<input
					type="text"
					value={ctaHeading}
					onChange={(e) => setCtaHeading(e.target.value)}
					placeholder="Ready to Make a Difference?"
				/>
			</label>
			<label className="form-field">
				<span>CTA Body</span>
				<textarea
					rows={2}
					value={ctaBody}
					onChange={(e) => setCtaBody(e.target.value)}
					placeholder="Join our community of supporters..."
				/>
			</label>

			<button
				type="submit"
				className="btn btn-primary"
				style={{ marginTop: "var(--spacing-lg)" }}
			>
				Save Home Page Content
			</button>
		</form>
	);
}

// About Page Content Editor
function AboutContentEditor() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Hero Section
	const [heroSubtitle, setHeroSubtitle] = useState(
		"Learn more about our mission, values, and the community we're building together.",
	);

	// Mission Section
	const [missionHeading, setMissionHeading] = useState("Our Mission");
	const [missionParagraph1, setMissionParagraph1] = useState(
		"A Life Worth Celebrating is a nonprofit organization dedicated to creating inclusive spaces where everyone feels valued, celebrated, and supported. We believe that every life deserves to be honored and that together, we can build a more loving and accepting community.",
	);
	const [missionParagraph2, setMissionParagraph2] = useState(
		"Through events, volunteer programs, and community outreach, we work to foster connection, spread joy, and advocate for equality. Our goal is simple: to make our community a place where every person can live authentically and proudly.",
	);

	// CTA Section
	const [ctaHeading, setCtaHeading] = useState("Get Involved");
	const [ctaBody, setCtaBody] = useState(
		"Whether you want to volunteer, attend an event, or support our cause, there are many ways to get involved with A Life Worth Celebrating.",
	);

	useEffect(() => {
		let isMounted = true;

		async function loadContent() {
			setLoading(true);
			setError("");
			try {
				const response = await fetch("/api/content/about");
				if (!isMounted) return;
				if (response.ok) {
					const data = await response.json();
					const content = data.data ?? {};

					if (content.heroSubtitle) setHeroSubtitle(content.heroSubtitle);
					if (content.missionHeading) setMissionHeading(content.missionHeading);
					if (content.missionParagraph1) setMissionParagraph1(content.missionParagraph1);
					if (content.missionParagraph2) setMissionParagraph2(content.missionParagraph2);
					if (content.ctaHeading) setCtaHeading(content.ctaHeading);
					if (content.ctaBody) setCtaBody(content.ctaBody);
				}
			} catch {
				if (isMounted) {
					setError("Failed to load content");
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}

		loadContent();

		return () => {
			isMounted = false;
		};
	}, []);

	const handleSave = async (event) => {
		event.preventDefault();
		setError("");
		setSuccess("");

		const content = {
			heroSubtitle,
			missionHeading,
			missionParagraph1,
			missionParagraph2,
			ctaHeading,
			ctaBody,
		};

		try {
			const response = await fetch("/api/content/about", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ data: content }),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.message || "Failed to save content");
			}

			setSuccess("About page content saved successfully!");
			toast.success("About page content saved successfully!");
			window.scrollTo({ top: 0, behavior: "smooth" });
		} catch (err) {
			setError(err.message || "Failed to save content");
			toast.error(err.message || "Failed to save content");
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	if (loading) {
		return <p>Loading content...</p>;
	}

	return (
		<form onSubmit={handleSave} className="admin-form">
			{error && <p className="form-error">{error}</p>}
			{success && <p className="form-success">{success}</p>}

			<h3
				style={{
					marginTop: "var(--spacing-xl)",
					marginBottom: "var(--spacing-md)",
				}}
			>
				Hero Section
			</h3>
			<label className="form-field">
				<span>Hero Subtitle</span>
				<textarea
					rows={3}
					value={heroSubtitle}
					onChange={(e) => setHeroSubtitle(e.target.value)}
					placeholder="Learn more about our mission, values..."
				/>
			</label>

			<h3
				style={{
					marginTop: "var(--spacing-xl)",
					marginBottom: "var(--spacing-md)",
				}}
			>
				Mission Section
			</h3>
			<label className="form-field">
				<span>Mission Heading</span>
				<input
					type="text"
					value={missionHeading}
					onChange={(e) => setMissionHeading(e.target.value)}
					placeholder="Our Mission"
				/>
			</label>
			<label className="form-field">
				<span>Mission Paragraph 1</span>
				<textarea
					rows={4}
					value={missionParagraph1}
					onChange={(e) => setMissionParagraph1(e.target.value)}
					placeholder="A Life Worth Celebrating is a nonprofit organization..."
				/>
			</label>
			<label className="form-field">
				<span>Mission Paragraph 2</span>
				<textarea
					rows={4}
					value={missionParagraph2}
					onChange={(e) => setMissionParagraph2(e.target.value)}
					placeholder="Through events, volunteer programs, and community outreach..."
				/>
			</label>

			<h3
				style={{
					marginTop: "var(--spacing-xl)",
					marginBottom: "var(--spacing-md)",
				}}
			>
				Call to Action Section
			</h3>
			<label className="form-field">
				<span>CTA Heading</span>
				<input
					type="text"
					value={ctaHeading}
					onChange={(e) => setCtaHeading(e.target.value)}
					placeholder="Get Involved"
				/>
			</label>
			<label className="form-field">
				<span>CTA Body</span>
				<textarea
					rows={3}
					value={ctaBody}
					onChange={(e) => setCtaBody(e.target.value)}
					placeholder="Whether you want to volunteer, attend an event..."
				/>
			</label>

			<button
				type="submit"
				className="btn btn-primary"
				style={{ marginTop: "var(--spacing-lg)" }}
			>
				Save About Page Content
			</button>
		</form>
	);
}

const ICON_LIBRARY = [
	{ emoji: "🎤", label: "Microphone – Performers" },
	{ emoji: "🎭", label: "Theater – Arts & Performance" },
	{ emoji: "🎵", label: "Music Note" },
	{ emoji: "🎶", label: "Music Notes" },
	{ emoji: "🎪", label: "Circus Tent – Events" },
	{ emoji: "🎉", label: "Party – Celebration" },
	{ emoji: "🛍️", label: "Shopping Bag – Vendors" },
	{ emoji: "🏪", label: "Store – Vendors" },
	{ emoji: "🤝", label: "Handshake – Sponsors" },
	{ emoji: "💰", label: "Money Bag – Funding" },
	{ emoji: "🏆", label: "Trophy – Awards" },
	{ emoji: "💜", label: "Purple Heart – Nonprofits" },
	{ emoji: "❤️", label: "Heart – Love" },
	{ emoji: "🌈", label: "Rainbow – Pride" },
	{ emoji: "✨", label: "Sparkles" },
	{ emoji: "🌟", label: "Star – Volunteers" },
	{ emoji: "⭐", label: "Star" },
	{ emoji: "🤲", label: "Open Hands – Giving" },
	{ emoji: "👥", label: "People – Community" },
	{ emoji: "🌻", label: "Sunflower – Community" },
	{ emoji: "📄", label: "Document – Packet" },
	{ emoji: "📋", label: "Clipboard – Forms" },
	{ emoji: "📝", label: "Memo – Forms" },
	{ emoji: "📎", label: "Paperclip – Attachments" },
	{ emoji: "🗺️", label: "Map" },
	{ emoji: "📍", label: "Pin – Location" },
	{ emoji: "📢", label: "Megaphone – Announcements" },
	{ emoji: "📧", label: "Email" },
	{ emoji: "💌", label: "Love Letter – Contact" },
	{ emoji: "🔗", label: "Link" },
	{ emoji: "📱", label: "Phone – Social / Mobile" },
	{ emoji: "📸", label: "Camera – Photos / Media" },
];

function IconPicker({ value, onChange }) {
	return (
		<div className="form-field">
			<span>Icon</span>
			<div style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))",
				gap: "6px",
				marginTop: "6px",
			}}>
				{ICON_LIBRARY.map(({ emoji, label }) => (
					<button
						key={emoji}
						type="button"
						title={label}
						aria-label={label}
						aria-pressed={value === emoji}
						onClick={() => onChange(emoji)}
						style={{
							fontSize: "1.5rem",
							lineHeight: 1,
							padding: "6px",
							border: value === emoji ? "2px solid var(--primary-purple)" : "2px solid transparent",
							borderRadius: "8px",
							background: value === emoji ? "rgba(139, 92, 246, 0.1)" : "var(--light-gray, #f3f4f6)",
							cursor: "pointer",
							transition: "border-color 0.15s, background 0.15s",
						}}
					>
						{emoji}
					</button>
				))}
			</div>
			{value && (
				<p style={{ marginTop: "6px", fontSize: "0.85rem", color: "var(--medium-gray)" }}>
					Selected: <span style={{ fontSize: "1.2rem" }}>{value}</span>
				</p>
			)}
		</div>
	);
}

// Resources Page Content Editor
function ResourcesContentEditor() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [heroSubtitle, setHeroSubtitle] = useState("Everything you need to get involved with A Life Worth Celebrating.");
	const [introText, setIntroText] = useState("Whether you’re looking to perform, vend, volunteer, or partner with us, you’ll find all of our forms and resources right here. If you have any questions or need assistance, don’t hesitate to reach out to us at alifeworthcelebratinginc@gmail.com — we’d love to hear from you.");
	const [links, setLinks] = useState([]);

	useEffect(() => {
		let isMounted = true;
		setLoading(true);
		fetch("/api/content/resources")
			.then((res) => res.ok ? res.json() : Promise.reject())
			.then((data) => {
				if (!isMounted) return;
				const content = data.data ?? {};
				if (content.heroSubtitle) setHeroSubtitle(content.heroSubtitle);
				if (content.introText) setIntroText(content.introText);
				if (Array.isArray(content.links)) setLinks(content.links);
			})
			.catch(() => { if (isMounted) setError("Failed to load content"); })
			.finally(() => { if (isMounted) setLoading(false); });
		return () => { isMounted = false; };
	}, []);

	const updateLink = (id, field, value) =>
		setLinks((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l));

	const addLink = () =>
		setLinks((prev) => [...prev, { id: crypto.randomUUID(), label: "", description: "", icon: "", href: "" }]);

	const removeLink = (id) =>
		setLinks((prev) => prev.filter((l) => l.id !== id));

	const handleSave = async (e) => {
		e.preventDefault();
		setError("");
		try {
			const res = await fetch("/api/content/resources", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ data: { heroSubtitle, introText, links } }),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => null);
				throw new Error(data?.message || "Failed to save content");
			}
			toast.success("Resources page saved!");
		} catch (err) {
			setError(err.message || "Failed to save content");
			toast.error(err.message || "Failed to save content");
		}
	};

	if (loading) return <p>Loading content...</p>;

	return (
		<form onSubmit={handleSave} className="admin-form">
			{error && <p className="form-error">{error}</p>}

			<h3 style={{ marginTop: "var(--spacing-xl)", marginBottom: "var(--spacing-md)" }}>
				Hero Section
			</h3>
			<label className="form-field">
				<span>Hero Subtitle</span>
				<textarea
					rows={2}
					value={heroSubtitle}
					onChange={(e) => setHeroSubtitle(e.target.value)}
					placeholder="Everything you need to get involved..."
				/>
			</label>

			<h3 style={{ marginTop: "var(--spacing-xl)", marginBottom: "var(--spacing-md)" }}>
				Intro Paragraph
			</h3>
			<label className="form-field">
				<span>Intro Text</span>
				<textarea
					rows={4}
					value={introText}
					onChange={(e) => setIntroText(e.target.value)}
					placeholder="Whether you're looking to perform, vend, volunteer..."
				/>
			</label>

			<h3 style={{ marginTop: "var(--spacing-xl)", marginBottom: "var(--spacing-md)" }}>
				Resource Links
			</h3>
			<p className="admin-help-text">Add, edit, or remove links shown on the Resources page.</p>

			<div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-lg)" }}>
				{links.map((link, index) => (
					<div key={link.id} style={{ border: "1px solid var(--light-gray, #e5e7eb)", borderRadius: "8px", padding: "var(--spacing-md)" }}>
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-sm)" }}>
							<strong style={{ color: "var(--medium-gray)" }}>Link {index + 1}</strong>
							<button
								type="button"
								className="btn btn-cta-secondary"
								style={{ padding: "4px 12px", fontSize: "0.85rem" }}
								onClick={() => removeLink(link.id)}
							>
								Remove
							</button>
						</div>
						<label className="form-field">
							<span>Label</span>
							<input
								type="text"
								value={link.label}
								onChange={(e) => updateLink(link.id, "label", e.target.value)}
								placeholder="Performers Form"
							/>
						</label>
						<IconPicker
							value={link.icon}
							onChange={(emoji) => updateLink(link.id, "icon", emoji)}
						/>
						<label className="form-field">
							<span>Description</span>
							<input
								type="text"
								value={link.description}
								onChange={(e) => updateLink(link.id, "description", e.target.value)}
								placeholder="Short description of this link"
							/>
						</label>
						<label className="form-field">
							<span>URL</span>
							<input
								type="url"
								value={link.href}
								onChange={(e) => updateLink(link.id, "href", e.target.value)}
								placeholder="https://"
							/>
						</label>
					</div>
				))}
			</div>

			<button
				type="button"
				className="btn btn-cta-secondary"
				style={{ marginTop: "var(--spacing-md)" }}
				onClick={addLink}
			>
				+ Add Link
			</button>

			<button
				type="submit"
				className="btn btn-primary"
				style={{ marginTop: "var(--spacing-lg)", display: "block" }}
			>
				Save Resources Page
			</button>
		</form>
	);
}

// Site Config Editor
function SiteConfigEditor() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [uploadingLogo, setUploadingLogo] = useState(false);

	// General
	const [siteName, setSiteName] = useState("A Life Worth Celebrating, Inc.");
	const [siteTagline, setSiteTagline] = useState(
		"Creating inclusive spaces for everyone",
	);
	const [orgName, setOrgName] = useState("A Life Worth Celebrating, Inc.");
	const [contactEmail, setContactEmail] = useState(
		"alifeworthcelebratinginc@gmail.com",
	);

	// Logo
	const [logoUrl, setLogoUrl] = useState("");

	// Social & Links
	const [facebookUrl, setFacebookUrl] = useState(
		"https://www.facebook.com/profile.php?id=61576987598719",
	);
	const [instagramUrl, setInstagramUrl] = useState("");
	const [xUrl, setXUrl] = useState("");
	const [tiktokUrl, setTiktokUrl] = useState("");
	const [donateUrl, setDonateUrl] = useState(
		"https://www.zeffy.com/en-US/ticketing/a-life-worth-celebrating-incs-shop",
	);

	useEffect(() => {
		let isMounted = true;

		async function loadContent() {
			setLoading(true);
			setError("");
			try {
				const response = await fetch("/api/content/siteConfig");
				if (!isMounted) return;
				if (response.ok) {
					const data = await response.json();
					const content = data.data ?? {};

					if (content.siteName) setSiteName(content.siteName);
					if (content.siteTagline) setSiteTagline(content.siteTagline);
					if (content.orgName) setOrgName(content.orgName);
					if (content.contactEmail) setContactEmail(content.contactEmail);
					if (content.logoUrl !== undefined) setLogoUrl(content.logoUrl);
					if (content.facebookUrl) setFacebookUrl(content.facebookUrl);
					if (content.instagramUrl !== undefined)
						setInstagramUrl(content.instagramUrl);
					if (content.xUrl !== undefined) setXUrl(content.xUrl);
					if (content.tiktokUrl !== undefined) setTiktokUrl(content.tiktokUrl);
					if (content.donateUrl) setDonateUrl(content.donateUrl);
				}
			} catch {
				if (isMounted) {
					setError("Failed to load site config");
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}

		loadContent();

		return () => {
			isMounted = false;
		};
	}, []);

	const handleLogoUpload = async (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setUploadingLogo(true);
		setError("");

		try {
			const formData = new FormData();
			formData.append("image", file);

			const response = await fetch("/api/site-logo", {
				method: "POST",
				credentials: "include",
				body: formData,
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.message || "Failed to upload logo");
			}

			const data = await response.json();
			setLogoUrl(data.imageUrl);
			toast.success("Logo uploaded successfully!");
			event.target.value = "";
		} catch (err) {
			setError(err.message || "Failed to upload logo");
			toast.error(err.message || "Failed to upload logo");
		} finally {
			setUploadingLogo(false);
		}
	};

	const handleSave = async (event) => {
		event.preventDefault();
		setError("");
		setSuccess("");

		const content = {
			siteName,
			siteTagline,
			orgName,
			contactEmail,
			logoUrl,
			facebookUrl,
			instagramUrl,
			xUrl,
			tiktokUrl,
			donateUrl,
		};

		try {
			const response = await fetch("/api/content/siteConfig", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ data: content }),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.message || "Failed to save site config");
			}

			setSuccess("Site configuration saved successfully!");
			toast.success("Site configuration saved successfully!");
			window.scrollTo({ top: 0, behavior: "smooth" });
		} catch (err) {
			setError(err.message || "Failed to save site config");
			toast.error(err.message || "Failed to save site config");
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	if (loading) {
		return <p>Loading site config...</p>;
	}

	return (
		<form onSubmit={handleSave} className="admin-form">
			{error && <p className="form-error">{error}</p>}
			{success && <p className="form-success">{success}</p>}

			<h3
				style={{
					marginTop: "var(--spacing-xl)",
					marginBottom: "var(--spacing-md)",
				}}
			>
				Logo
			</h3>
			<div className="form-field">
				{logoUrl && (
					<div style={{ marginBottom: "var(--spacing-md)" }}>
						<img
							src={logoUrl}
							alt="Site logo preview"
							style={{
								height: "60px",
								width: "auto",
								objectFit: "contain",
								display: "block",
								background: "var(--color-background-alt)",
								padding: "var(--spacing-sm)",
								borderRadius: "var(--radius-sm)",
								border: "1px solid var(--color-border)",
							}}
						/>
					</div>
				)}
				<label className="form-field">
					<span>
						{logoUrl ? "Replace Logo" : "Upload Logo"}
					</span>
					<input
						type="file"
						accept="image/*"
						onChange={handleLogoUpload}
						disabled={uploadingLogo}
					/>
				</label>
				{uploadingLogo && (
					<p style={{ fontSize: "0.9rem", color: "var(--color-text-light)" }}>
						Uploading...
					</p>
				)}
				{logoUrl && (
					<button
						type="button"
						className="btn btn-secondary"
						style={{ marginTop: "var(--spacing-sm)" }}
						onClick={() => setLogoUrl("")}
					>
						Remove Logo
					</button>
				)}
				<p
					style={{
						fontSize: "0.85rem",
						color: "var(--color-text-light)",
						marginTop: "var(--spacing-xs)",
					}}
				>
					If no logo is uploaded, the default wordmark will be shown in the
					header.
				</p>
			</div>

			<h3
				style={{
					marginTop: "var(--spacing-xl)",
					marginBottom: "var(--spacing-md)",
				}}
			>
				General
			</h3>
			<label className="form-field">
				<span>Site Name</span>
				<input
					type="text"
					value={siteName}
					onChange={(e) => setSiteName(e.target.value)}
					placeholder="A Life Worth Celebrating, Inc."
				/>
			</label>
			<label className="form-field">
				<span>Organization Name</span>
				<input
					type="text"
					value={orgName}
					onChange={(e) => setOrgName(e.target.value)}
					placeholder="A Life Worth Celebrating, Inc."
				/>
			</label>
			<label className="form-field">
				<span>Tagline</span>
				<input
					type="text"
					value={siteTagline}
					onChange={(e) => setSiteTagline(e.target.value)}
					placeholder="Creating inclusive spaces for everyone"
				/>
			</label>
			<label className="form-field">
				<span>Contact Email</span>
				<input
					type="email"
					value={contactEmail}
					onChange={(e) => setContactEmail(e.target.value)}
					placeholder="contact@example.com"
				/>
			</label>

			<h3
				style={{
					marginTop: "var(--spacing-xl)",
					marginBottom: "var(--spacing-md)",
				}}
			>
				Links
			</h3>
			<label className="form-field">
				<span>Donate URL</span>
				<input
					type="url"
					value={donateUrl}
					onChange={(e) => setDonateUrl(e.target.value)}
					placeholder="https://..."
				/>
			</label>
			<label className="form-field">
				<span>Facebook URL</span>
				<input
					type="url"
					value={facebookUrl}
					onChange={(e) => setFacebookUrl(e.target.value)}
					placeholder="https://facebook.com/..."
				/>
			</label>
			<label className="form-field">
				<span>Instagram URL</span>
				<input
					type="url"
					value={instagramUrl}
					onChange={(e) => setInstagramUrl(e.target.value)}
					placeholder="https://instagram.com/..."
				/>
			</label>
			<label className="form-field">
				<span>X (Twitter) URL</span>
				<input
					type="url"
					value={xUrl}
					onChange={(e) => setXUrl(e.target.value)}
					placeholder="https://x.com/..."
				/>
			</label>
			<label className="form-field">
				<span>TikTok URL</span>
				<input
					type="url"
					value={tiktokUrl}
					onChange={(e) => setTiktokUrl(e.target.value)}
					placeholder="https://tiktok.com/@..."
				/>
			</label>

			<button
				type="submit"
				className="btn btn-primary"
				style={{ marginTop: "var(--spacing-lg)" }}
			>
				Save Site Configuration
			</button>
		</form>
	);
}

// Sortable Event Row Component
function SortableEventRow({
	event,
	handleEditClick,
	handleDelete,
	handleTogglePublished,
}) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: event.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<tr ref={setNodeRef} style={style} {...attributes}>
			<td
				{...listeners}
				style={{
					cursor: "grab",
					userSelect: "none",
					textAlign: "center",
					fontSize: "20px",
				}}
			>
				⋮⋮
			</td>
			<td>{event.title}</td>
			<td>{event.date || "No date"}</td>
			<td>{event.time || "No time"}</td>
			<td>{event.location || "No location"}</td>
			<td>
				<button
					type="button"
					className="btn btn-rainbow"
					onClick={() => handleEditClick(event)}
					style={{ marginRight: "var(--spacing-sm)" }}
				>
					Edit
				</button>
				<button
					type="button"
					className="btn btn-danger"
					onClick={() => handleDelete(event.id)}
					style={{ marginRight: "var(--spacing-sm)" }}
				>
					Delete
				</button>
				{event.is_published ? (
					<button
						type="button"
						className="btn btn-primary"
						onClick={() => handleTogglePublished(event)}
					>
						Unpublish
					</button>
				) : (
					<button
						type="button"
						className="btn btn-primary"
						onClick={() => handleTogglePublished(event)}
					>
						Publish
					</button>
				)}
			</td>
		</tr>
	);
}

// Sortable Event Image Component
function SortableEventImage({ image, onDelete }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: image.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={{
				...style,
				position: "relative",
				border: "1px solid var(--color-border)",
				borderRadius: "var(--radius-md)",
				overflow: "hidden",
				cursor: "grab",
			}}
			{...attributes}
			{...listeners}
		>
			<img
				src={image.image_url}
				alt="Event"
				style={{
					width: "100%",
					height: "150px",
					objectFit: "cover",
					display: "block",
					pointerEvents: "none",
				}}
			/>
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onDelete(image.id);
				}}
				className="btn btn-danger"
				style={{
					position: "absolute",
					top: "var(--spacing-xs)",
					right: "var(--spacing-xs)",
					padding: "var(--spacing-xs) var(--spacing-sm)",
					fontSize: "0.75rem",
					pointerEvents: "auto",
				}}
			>
				Delete
			</button>
			<div
				style={{
					position: "absolute",
					bottom: "var(--spacing-xs)",
					left: "var(--spacing-xs)",
					background: "rgba(0, 0, 0, 0.7)",
					color: "white",
					padding: "2px 8px",
					borderRadius: "4px",
					fontSize: "12px",
					pointerEvents: "none",
				}}
			>
				⋮⋮ Drag
			</div>
		</div>
	);
}

function EventsSection() {
	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [editingId, setEditingId] = useState(null);
	const [title, setTitle] = useState("");
	const [date, setDate] = useState("");
	const [time, setTime] = useState("");
	const [location, setLocation] = useState("");
	const [description, setDescription] = useState("");
	const [link, setLink] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [displayOrder, setDisplayOrder] = useState(0);
	const [images, setImages] = useState([]);
	const [uploadingImages, setUploadingImages] = useState(false);
	const [isPublished, setIsPublished] = useState(false);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	useEffect(() => {
		let isMounted = true;

		async function loadEvents() {
			setLoading(true);
			setError("");
			try {
				const response = await fetch("/api/admin/events", {
					credentials: "include",
				});
				if (!isMounted) return;
				if (response.ok) {
					const data = await response.json();
					setEvents(data.events ?? []);
				} else {
					setError("Failed to load events");
				}
			} catch {
				if (isMounted) setError("Failed to load events");
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		loadEvents();

		return () => {
			isMounted = false;
		};
	}, []);

	const refreshEvents = async () => {
		try {
			const response = await fetch("/api/admin/events", {
				credentials: "include",
			});
			if (response.ok) {
				const data = await response.json();
				setEvents(data.events ?? []);
			}
		} catch {
			// ignore
		}
	};

	const handleDragEnd = async (event) => {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return;
		}

		const oldIndex = events.findIndex((e) => e.id === active.id);
		const newIndex = events.findIndex((e) => e.id === over.id);

		if (oldIndex === -1 || newIndex === -1) {
			return;
		}

		// Optimistically update the UI
		const newEvents = arrayMove(events, oldIndex, newIndex);

		// Update display_order for all items
		const updatedEvents = newEvents.map((event, index) => ({
			...event,
			display_order: index,
		}));

		setEvents(updatedEvents);

		// Send update to backend
		try {
			const updates = updatedEvents.map((event) => ({
				id: event.id,
				displayOrder: event.display_order,
			}));

			const response = await fetch("/api/events/reorder", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ updates }),
			});

			if (!response.ok) {
				throw new Error("Failed to update order");
			}

			toast.success("Events reordered successfully!");
		} catch (err) {
			setError(err.message || "Failed to update order");
			toast.error(err.message || "Failed to update order");
			// Refresh to get the correct order from server
			await refreshEvents();
		}
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");

		try {
			const url = editingId ? `/api/events/${editingId}` : "/api/events";
			const method = editingId ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					title,
					date,
					time,
					location,
					description,
					link,
					imageUrl,
					displayOrder: parseInt(displayOrder, 10) || 0,
					isPublished: isPublished,
				}),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(
					data?.message || `Failed to ${editingId ? "update" : "create"} event`,
				);
			}

			// Clear form
			setEditingId(null);
			setTitle("");
			setDate("");
			setTime("");
			setLocation("");
			setDescription("");
			setLink("");
			setImageUrl("");
			setDisplayOrder(0);
			setIsPublished(false);

			await refreshEvents();

			toast.success(`Event ${editingId ? "updated" : "created"} successfully!`);
			// Scroll to Events section header
			setTimeout(() => {
				const eventsHeader = document.querySelector("#events-section-header");
				if (eventsHeader) {
					eventsHeader.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			}, 100);
		} catch (err) {
			setError(
				err.message || `Failed to ${editingId ? "update" : "create"} event`,
			);
			toast.error(
				err.message || `Failed to ${editingId ? "update" : "create"} event`,
			);
			// Scroll to Events section header to show error
			setTimeout(() => {
				const eventsHeader = document.querySelector("#events-section-header");
				if (eventsHeader) {
					eventsHeader.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			}, 100);
		}
	};

	const handleEditClick = (eventRecord) => {
		setEditingId(eventRecord.id);
		setTitle(eventRecord.title || "");

		// Convert date to YYYY-MM-DD format for date input
		let formattedDate = "";
		if (eventRecord.date) {
			const parsedDate = new Date(eventRecord.date);
			if (!isNaN(parsedDate.getTime())) {
				// Valid date - format as YYYY-MM-DD
				formattedDate = parsedDate.toISOString().split("T")[0];
			}
			// If invalid date, leave empty so user must select a valid date
		}
		setDate(formattedDate);

		setTime(eventRecord.time || "");
		setLocation(eventRecord.location || "");
		setDescription(eventRecord.description || "");
		setLink(eventRecord.link || "");
		setImageUrl(eventRecord.image_url || "");
		setDisplayOrder(eventRecord.display_order || 0);
		setImages(eventRecord.images || []);
		setIsPublished(eventRecord.is_published || false);
		// Scroll to title label - use setTimeout to ensure state updates first
		setTimeout(() => {
			const titleLabel = document.querySelector("#event-title-label");
			if (titleLabel) {
				titleLabel.scrollIntoView({ behavior: "smooth", block: "start" });
				// Focus the input after scrolling
				const titleInput = document.querySelector("#event-title-input");
				if (titleInput) {
					titleInput.focus();
				}
			}
		}, 100);
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setTitle("");
		setDate("");
		setTime("");
		setLocation("");
		setDescription("");
		setLink("");
		setImageUrl("");
		setDisplayOrder(0);
		setImages([]);
		setIsPublished(false);
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Delete this event?")) return;

		try {
			const response = await fetch(`/api/events/${id}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!response.ok && response.status !== 204) {
				throw new Error("Failed to delete event");
			}

			await refreshEvents();
			toast.success("Event deleted successfully!");
		} catch (err) {
			setError(err.message || "Failed to delete event");
			toast.error(err.message || "Failed to delete event");
		}
	};

	const handleTogglePublished = async (eventRecord) => {
		try {
			const response = await fetch(`/api/events/${eventRecord.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ isPublished: !eventRecord.is_published }),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.message || "Failed to update event");
			}

			await refreshEvents();
			toast.success(
				`Event ${!eventRecord.is_published ? "published" : "unpublished"} successfully!`,
			);
		} catch (err) {
			setError(err.message || "Failed to update event");
			toast.error(err.message || "Failed to update event");
		}
	};

	const handleImageUpload = async (event) => {
		const files = event.target.files;
		if (!files || files.length === 0 || !editingId) return;

		setUploadingImages(true);
		setError("");

		try {
			const formData = new FormData();
			for (let i = 0; i < files.length; i++) {
				formData.append("images", files[i]);
			}

			const response = await fetch(`/api/events/${editingId}/images`, {
				method: "POST",
				credentials: "include",
				body: formData,
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.message || "Failed to upload images");
			}

			const data = await response.json();
			setImages([...images, ...data.images]);
			event.target.value = ""; // Reset file input
		} catch (err) {
			setError(err.message || "Failed to upload images");
		} finally {
			setUploadingImages(false);
		}
	};

	const handleDeleteImage = async (imageId) => {
		if (!editingId) return;

		try {
			const response = await fetch(
				`/api/events/${editingId}/images/${imageId}`,
				{
					method: "DELETE",
					credentials: "include",
				},
			);

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.message || "Failed to delete image");
			}

			setImages(images.filter((img) => img.id !== imageId));
			toast.success("Image deleted successfully!");
		} catch (err) {
			setError(err.message || "Failed to delete image");
			toast.error(err.message || "Failed to delete image");
		}
	};

	const handleImageDragEnd = async (event) => {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return;
		}

		const oldIndex = images.findIndex((img) => img.id === active.id);
		const newIndex = images.findIndex((img) => img.id === over.id);

		if (oldIndex === -1 || newIndex === -1) {
			return;
		}

		// Optimistically update the UI
		const newImages = arrayMove(images, oldIndex, newIndex);
		setImages(newImages);

		// Send update to backend
		try {
			const imageIds = newImages.map((img) => img.id);

			const response = await fetch(`/api/events/${editingId}/images/reorder`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ imageIds }),
			});

			if (!response.ok) {
				throw new Error("Failed to reorder images");
			}

			toast.success("Images reordered successfully!");
		} catch (err) {
			setError(err.message || "Failed to reorder images");
			toast.error(err.message || "Failed to reorder images");
			// Refresh images from server on error
			if (editingId) {
				const response = await fetch(`/api/events/${editingId}/images`, {
					credentials: "include",
				});
				if (response.ok) {
					const data = await response.json();
					setImages(data.images ?? []);
				}
			}
		}
	};

	return (
		<div>
			<h2 id="events-section-header">Events</h2>
			{error && <p className="form-error">{error}</p>}
			{loading ? (
				<p>Loading events...</p>
			) : (
				<>
					<p
						style={{
							marginBottom: "var(--spacing-md)",
							color: "var(--color-text-light)",
						}}
					>
						💡 Drag and drop rows to reorder events. The order here determines
						how they appear on the Events page.
					</p>
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<table className="admin-table">
							<thead>
								<tr>
									<th>Drag</th>
									<th>Title</th>
									<th>Date</th>
									<th>Time</th>
									<th>Location</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{events.length === 0 ? (
									<tr>
										<td colSpan="7" style={{ textAlign: "center" }}>
											No events yet. Create one below!
										</td>
									</tr>
								) : (
									<SortableContext
										items={events.map((e) => e.id)}
										strategy={verticalListSortingStrategy}
									>
										{events.map((eventRecord) => (
											<SortableEventRow
												key={eventRecord.id}
												event={eventRecord}
												handleEditClick={handleEditClick}
												handleDelete={handleDelete}
												handleTogglePublished={handleTogglePublished}
											/>
										))}
									</SortableContext>
								)}
							</tbody>
						</table>
					</DndContext>
				</>
			)}

			<h3>{editingId ? "Edit Event" : "Create Event"}</h3>
			<form onSubmit={handleSubmit} className="admin-form events-form">
				<label className="form-field" id="event-title-label">
					<span>Title</span>
					<input
						id="event-title-input"
						type="text"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						required
					/>
				</label>
				<label className="form-field">
					<span>Date</span>
					<input
						type="date"
						value={date}
						onChange={(event) => setDate(event.target.value)}
						required
					/>
				</label>
				<label className="form-field">
					<span>Time</span>
					<input
						type="text"
						value={time}
						onChange={(event) => setTime(event.target.value)}
						placeholder="e.g., 6:00 PM - 9:00 PM"
					/>
				</label>
				<label className="form-field">
					<span>Location</span>
					<input
						type="text"
						value={location}
						onChange={(event) => setLocation(event.target.value)}
						placeholder="e.g., Winchester Community Center"
					/>
				</label>
				<label className="form-field">
					<span>Description</span>
					<textarea
						rows={3}
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						placeholder="Event description..."
					/>
				</label>
				<label className="form-field">
					<span>Link (optional)</span>
					<input
						type="text"
						value={link}
						onChange={(event) => setLink(event.target.value)}
						placeholder="https://example.com/event-details"
					/>
				</label>

				<label className="form-field" style={{ flexDirection: "row", alignItems: "center", gap: "var(--spacing-md)" }}>
					<input
						type="checkbox"
						checked={isPublished}
						onChange={(event) => setIsPublished(event.target.checked)}
						style={{ width: "auto", margin: 0 }}
					/>
					<span style={{ margin: 0 }}>Publish this event (make it visible on the Events page)</span>
				</label>

				{editingId && (
					<div className="form-field">
						<span>Event Images</span>
						<div style={{ marginTop: "var(--spacing-sm)" }}>
							{images.length > 0 && (
								<DndContext
									sensors={sensors}
									collisionDetection={closestCenter}
									onDragEnd={handleImageDragEnd}
								>
									<SortableContext
										items={images.map((img) => img.id)}
										strategy={rectSortingStrategy}
									>
										<div
											style={{
												display: "grid",
												gridTemplateColumns:
													"repeat(auto-fill, minmax(150px, 1fr))",
												gap: "var(--spacing-md)",
												marginBottom: "var(--spacing-md)",
											}}
										>
											{images.map((image) => (
												<SortableEventImage
													key={image.id}
													image={image}
													onDelete={handleDeleteImage}
												/>
											))}
										</div>
									</SortableContext>
								</DndContext>
							)}
							<input
								type="file"
								accept="image/*"
								multiple
								onChange={handleImageUpload}
								disabled={uploadingImages}
								style={{ display: "block", marginTop: "var(--spacing-sm)" }}
							/>
							{uploadingImages && (
								<p
									style={{
										marginTop: "var(--spacing-sm)",
										color: "var(--color-info)",
									}}
								>
									Uploading images...
								</p>
							)}
							<p
								style={{
									fontSize: "0.875rem",
									color: "var(--color-text-light)",
									marginTop: "var(--spacing-xs)",
								}}
							>
								Upload multiple images (max 10MB each). You can only upload
								images after creating the event.
							</p>
						</div>
					</div>
				)}

				<div style={{ display: "flex", gap: "var(--spacing-md)" }}>
					<button type="submit" className="btn btn-primary">
						{editingId ? "Update Event" : "Create Event"}
					</button>
					{editingId && (
						<button
							type="button"
							className="btn btn-secondary"
							onClick={handleCancelEdit}
						>
							Cancel
						</button>
					)}
				</div>
			</form>
		</div>
	);
}

function UsersSection() {
	const { user: currentUser } = useAuth();
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [role, setRole] = useState("user");

	useEffect(() => {
		let isMounted = true;

		async function loadUsers() {
			setLoading(true);
			setError("");
			try {
				const response = await fetch("/api/admin/users", {
					credentials: "include",
				});
				if (!isMounted) return;
				if (response.ok) {
					const data = await response.json();
					setUsers(data.users ?? []);
				} else {
					setError("Failed to load users");
				}
			} catch {
				if (isMounted) setError("Failed to load users");
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		loadUsers();

		return () => {
			isMounted = false;
		};
	}, []);

	const refreshUsers = async () => {
		try {
			const response = await fetch("/api/admin/users", {
				credentials: "include",
			});
			if (response.ok) {
				const data = await response.json();
				setUsers(data.users ?? []);
			}
		} catch {
			// ignore
		}
	};

	const handleCreate = async (event) => {
		event.preventDefault();
		setError("");

		try {
			const response = await fetch("/api/admin/users", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ name, email, role }),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.message || "Failed to create user");
			}

			setName("");
			setEmail("");
			setRole("user");
			await refreshUsers();
			toast.success("User created successfully! We've sent them an intro email to set up their account.");
		} catch (err) {
			setError(err.message || "Failed to create user");
			toast.error(err.message || "Failed to create user");
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Delete this user?")) return;

		try {
			const response = await fetch(`/api/admin/users/${id}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!response.ok && response.status !== 204) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.message || "Failed to delete user");
			}

			await refreshUsers();
			toast.success("User deleted successfully!");
		} catch (err) {
			setError(err.message || "Failed to delete user");
			toast.error(err.message || "Failed to delete user");
		}
	};

	const handleResetPassword = async (id) => {
		const newPassword = window.prompt("Enter a new password for this user:");
		if (!newPassword) {
			console.log("Reset password cancelled - no password entered");
			return;
		}

		console.log("Resetting password for user ID:", id);
		console.log("New password length:", newPassword.length);

		try {
			const response = await fetch(`/api/admin/users/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ password: newPassword }),
			});

			console.log("Reset password response status:", response.status);

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				console.error("Reset password failed:", data);
				throw new Error(data?.message || "Failed to reset password");
			}

			const result = await response.json();
			console.log("Reset password success:", result);

			await refreshUsers();
			toast.success("Password reset successfully!");
		} catch (err) {
			console.error("Reset password error:", err);
			setError(err.message || "Failed to reset password");
			toast.error(err.message || "Failed to reset password");
		}
	};

	const handleRoleChange = async (userId, newRole) => {
		try {
			const response = await fetch(`/api/admin/users/${userId}/role`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ role: newRole }),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.message || "Failed to update role");
			}

			await refreshUsers();
			toast.success("User role updated successfully!");
		} catch (err) {
			setError(err.message || "Failed to update role");
			toast.error(err.message || "Failed to update role");
		}
	};

	return (
		<div>
			<h2>Users</h2>
			{error && <p className="form-error">{error}</p>}
			{loading ? (
				<p>Loading users...</p>
			) : (
				<table className="admin-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Email</th>
							<th>Role</th>
							<th>Created</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.map((userRecord) => (
							<tr key={userRecord.id}>
								<td>
									<div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
										<span>{userRecord.name}</span>
										{userRecord.isMainAdmin && (
											<span style={{
												display: "inline-block",
												padding: "2px 8px",
												background: "var(--primary-purple)",
												color: "white",
												borderRadius: "4px",
												fontSize: "0.75rem",
												fontWeight: "600",
												whiteSpace: "nowrap"
											}}>
												Main Admin
											</span>
										)}
									</div>
								</td>
								<td>{userRecord.email}</td>
								<td>
									{userRecord.isMainAdmin ? (
										<span style={{
											display: "inline-block",
											padding: "6px 16px",
											background: "rgba(139, 92, 246, 0.1)",
											color: "var(--primary-purple)",
											border: "1px solid rgba(139, 92, 246, 0.3)",
											borderRadius: "20px",
											fontSize: "0.875rem",
											fontWeight: "600",
											textTransform: "capitalize"
										}}>
											{userRecord.role}
										</span>
									) : (
										<select
											value={userRecord.role || "user"}
											onChange={(e) => handleRoleChange(userRecord.id, e.target.value)}
											style={{
												padding: "8px 12px",
												borderRadius: "6px",
												border: "2px solid #e5e7eb",
												background: "white",
												cursor: "pointer",
												fontSize: "0.875rem",
												fontWeight: "500",
												color: "#374151",
												textTransform: "capitalize",
												transition: "all 0.2s ease",
												outline: "none",
												minWidth: "120px"
											}}
											onFocus={(e) => {
												e.target.style.borderColor = "var(--primary-purple)";
												e.target.style.boxShadow = "0 0 0 3px rgba(139, 92, 246, 0.1)";
											}}
											onBlur={(e) => {
												e.target.style.borderColor = "#e5e7eb";
												e.target.style.boxShadow = "none";
											}}
										>
											<option value="user">User</option>
											<option value="admin">Admin</option>
											{currentUser?.isAdmin && <option value="superuser">Superuser</option>}
										</select>
									)}
								</td>
								<td>
									{userRecord.created_at
										? new Date(userRecord.created_at).toLocaleString()
										: ""}
								</td>
								<td>
									{currentUser?.id === userRecord.id ||
									userRecord.isMainAdmin ? (
										<span style={{ color: "#666", fontStyle: "italic" }}>
											{currentUser?.id === userRecord.id
												? "Current User"
												: "Protected"}
										</span>
									) : (
										<div style={{ display: "flex", gap: "8px" }}>
											<button
												type="button"
												className="btn btn-primary"
												onClick={() => handleResetPassword(userRecord.id)}
												style={{ minWidth: "140px" }}
											>
												Reset Password
											</button>
											<button
												type="button"
												className="btn btn-danger"
												onClick={() => handleDelete(userRecord.id)}
												style={{ minWidth: "140px" }}
											>
												Delete
											</button>
										</div>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			<h3>Create User</h3>
			<p style={{ marginBottom: "var(--spacing-md)", color: "var(--color-text-light)" }}>
				An intro email will be sent to the new user to set up their password.
			</p>
			<form onSubmit={handleCreate} className="admin-form">
				<label className="form-field">
					<span>Name</span>
					<input
						type="text"
						value={name}
						onChange={(event) => setName(event.target.value)}
						required
					/>
				</label>
				<label className="form-field">
					<span>Email</span>
					<input
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						required
					/>
				</label>
				<label className="form-field">
					<span>Role</span>
					<select
						value={role}
						onChange={(event) => setRole(event.target.value)}
						required
						style={{
							padding: "var(--spacing-sm)",
							borderRadius: "var(--radius-md)",
							border: "1px solid #ccc",
							background: "white",
							fontSize: "1rem"
						}}
					>
						<option value="user">User</option>
						<option value="admin">Admin</option>
						{currentUser?.isAdmin && <option value="superuser">Superuser</option>}
					</select>
				</label>
				<button type="submit" className="btn btn-primary">
					Create User
				</button>
			</form>
		</div>
	);
}

function ProfileSection() {
	const { user, setUser } = useAuth();

	const [name, setName] = useState(user?.name ?? "");
	const [email, setEmail] = useState(user?.email ?? "");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setName(user?.name ?? "");
		setEmail(user?.email ?? "");
	}, [user]);

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");
		setSuccess("");

		if (password && password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		if (!name && !email && !password) {
			setError("Nothing to update");
			return;
		}

		setLoading(true);

		try {
			const response = await fetch("/api/admin/me", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					name: name || undefined,
					email: email || undefined,
					password: password || undefined,
				}),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.message || "Failed to update profile");
			}

			const updated = await response.json();
			setUser((prev) =>
				prev
					? {
							...prev,
							id: updated.id,
							email: updated.email,
							name: updated.name,
						}
					: { id: updated.id, email: updated.email, name: updated.name },
			);
			setPassword("");
			setConfirmPassword("");
			setSuccess("Profile updated");
			toast.success("Profile updated successfully!");
			// Scroll to top to show success message
			window.scrollTo({ top: 0, behavior: "smooth" });
		} catch (err) {
			setError(err.message || "Failed to update profile");
			toast.error(err.message || "Failed to update profile");
			// Scroll to top to show error message
			window.scrollTo({ top: 0, behavior: "smooth" });
		} finally {
			setLoading(false);
		}
	};

	const handleRequestSuperuser = async () => {
		if (!window.confirm("Request superuser access? An email will be sent to the admin.")) {
			return;
		}

		try {
			const response = await fetch("/api/admin/request-superuser", {
				method: "POST",
				credentials: "include",
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.message || "Failed to send request");
			}

			toast.success("Superuser access request sent to admin!");
		} catch (err) {
			toast.error(err.message || "Failed to send request");
		}
	};

	return (
		<div>
			<h2>My Profile</h2>

			{/* Show current role and superuser request button for non-admin users */}
			{user && (
				<div style={{
					marginBottom: "var(--spacing-lg)",
					padding: "var(--spacing-md)",
					background: "#f8f9fa",
					borderRadius: "var(--radius-md)",
					border: "1px solid #e9ecef"
				}}>
					<p style={{ margin: "0 0 var(--spacing-sm) 0", color: "#666", fontSize: "0.875rem" }}>
						<strong>Current Role:</strong> <span style={{
							textTransform: "capitalize",
							color: user.role === "admin" || user.role === "superuser" ? "var(--primary-purple)" : "#333"
						}}>{user.role}</span>
					</p>
					{user.role === "user" && (
						<button
							type="button"
							className="btn btn-primary"
							onClick={handleRequestSuperuser}
							style={{ marginTop: "var(--spacing-sm)" }}
						>
							Request Superuser Access
						</button>
					)}
				</div>
			)}

			<form onSubmit={handleSubmit} className="admin-form">
				<label className="form-field">
					<span>Name</span>
					<input
						type="text"
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</label>
				<label className="form-field">
					<span>Email</span>
					<input
						type="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
					/>
				</label>
				<label className="form-field">
					<span>New Password</span>
					<div style={{ position: "relative" }}>
						<input
							type={showPassword ? "text" : "password"}
							value={password}
							onChange={(event) => setPassword(event.target.value)}
							style={{ paddingRight: "40px" }}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							style={{
								position: "absolute",
								right: "8px",
								top: "50%",
								transform: "translateY(-50%)",
								background: "none",
								border: "none",
								cursor: "pointer",
								padding: "4px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "var(--color-text-light)",
							}}
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							{showPassword ? "👁️" : "👁️‍🗨️"}
						</button>
					</div>
				</label>
				<label className="form-field">
					<span>Confirm New Password</span>
					<div style={{ position: "relative" }}>
						<input
							type={showConfirmPassword ? "text" : "password"}
							value={confirmPassword}
							onChange={(event) => setConfirmPassword(event.target.value)}
							style={{ paddingRight: "40px" }}
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							style={{
								position: "absolute",
								right: "8px",
								top: "50%",
								transform: "translateY(-50%)",
								background: "none",
								border: "none",
								cursor: "pointer",
								padding: "4px",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								color: "var(--color-text-light)",
							}}
							aria-label={
								showConfirmPassword ? "Hide password" : "Show password"
							}
						>
							{showConfirmPassword ? "👁️" : "👁️‍🗨️"}
						</button>
					</div>
				</label>
				{error && <p className="form-error">{error}</p>}
				{success && <p className="form-success">{success}</p>}
				<button type="submit" className="btn btn-primary" disabled={loading}>
					{loading ? "Saving..." : "Save Changes"}
				</button>
			</form>
		</div>
	);
}

function AuditLogSection() {
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		let isMounted = true;

		async function loadLogs() {
			setLoading(true);
			setError("");
			try {
				const response = await fetch("/api/admin/audit-logs?limit=100", {
					credentials: "include",
				});
				if (!isMounted) return;
				if (response.ok) {
					const data = await response.json();
					setLogs(data.logs ?? []);
				} else {
					setError("Failed to load audit logs");
				}
			} catch {
				if (isMounted) setError("Failed to load audit logs");
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		loadLogs();

		return () => {
			isMounted = false;
		};
	}, []);

	return (
		<div>
			<h2>Audit Log</h2>
			{error && <p className="form-error">{error}</p>}
			{loading ? (
				<p>Loading audit logs...</p>
			) : (
				<table className="admin-table">
					<thead>
						<tr>
							<th>When</th>
							<th>User</th>
							<th>Action</th>
							<th>Entity</th>
						</tr>
					</thead>
					<tbody>
						{logs.map((log) => {
							// Format entity display
							let entityDisplay = log.entity_type || "";

							if (log.entity_type === "event" && log.new_data?.title) {
								entityDisplay = `Event - ${log.new_data.title}`;
							} else if (
								log.entity_type === "event" &&
								log.previous_data?.title
							) {
								entityDisplay = `Event - ${log.previous_data.title}`;
							} else if (log.entity_type === "event" && log.entity_id) {
								entityDisplay = `Event #${log.entity_id}`;
							} else if (log.entity_type === "user" && log.new_data?.name) {
								entityDisplay = `User - ${log.new_data.name}`;
							} else if (
								log.entity_type === "user" &&
								log.previous_data?.name
							) {
								entityDisplay = `User - ${log.previous_data.name}`;
							} else if (log.entity_type === "user" && log.entity_id) {
								entityDisplay = `User #${log.entity_id}`;
							} else if (
								log.entity_type === "board_member" &&
								log.new_data?.name
							) {
								entityDisplay = `Board Member - ${log.new_data.name}`;
							} else if (
								log.entity_type === "board_member" &&
								log.previous_data?.name
							) {
								entityDisplay = `Board Member - ${log.previous_data.name}`;
							} else if (log.entity_type === "board_member" && log.entity_id) {
								entityDisplay = `Board Member #${log.entity_id}`;
							} else if (log.entity_slug) {
								entityDisplay = `${log.entity_type} (${log.entity_slug})`;
							} else if (log.entity_id) {
								entityDisplay = `${log.entity_type} #${log.entity_id}`;
							}

							// Format date without comma (remove comma between date and time)
							let formattedDate = "";
							if (log.created_at) {
								const date = new Date(log.created_at);
								formattedDate = date.toLocaleString().replace(",", "");
							}

							return (
								<tr key={log.id}>
									<td>{formattedDate}</td>
									<td>{log.user_name || log.user_email || "(unknown)"}</td>
									<td>{log.action}</td>
									<td>{entityDisplay}</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			)}
		</div>
	);
}

// Sortable Board Member Row Component
function SortableBoardMemberRow({ member, handleEditClick, handleDelete }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: member.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<tr ref={setNodeRef} style={style} {...attributes}>
			<td
				{...listeners}
				style={{
					cursor: "grab",
					userSelect: "none",
					textAlign: "center",
					fontSize: "20px",
				}}
			>
				⋮⋮
			</td>
			<td>{member.name}</td>
			<td>{member.title}</td>
			<td>
				{member.image_url ? (
					<img
						src={member.image_url}
						alt={member.name}
						style={{
							width: "50px",
							height: "50px",
							objectFit: "cover",
							borderRadius: "4px",
						}}
					/>
				) : (
					"No image"
				)}
			</td>
			<td>
				<button
					type="button"
					className="btn btn-rainbow"
					onClick={() => handleEditClick(member)}
					style={{ marginRight: "var(--spacing-sm)" }}
				>
					Edit
				</button>
				<button
					type="button"
					className="btn btn-danger"
					onClick={() => handleDelete(member.id)}
				>
					Delete
				</button>
			</td>
		</tr>
	);
}

const NEWS_PLATFORM_LABELS = { facebook: "Facebook", instagram: "Instagram", twitter: "X", tiktok: "TikTok" };

function newsFormatDate(iso) {
	return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function SortableNewsCard({ post, onTogglePublished }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id });
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : post.is_published ? 1 : 0.6,
	};

	return (
		<div
			ref={setNodeRef}
			style={{
				...style,
				display: "flex",
				alignItems: "flex-start",
				gap: "var(--spacing-md)",
				background: post.is_published ? "var(--color-background)" : "var(--color-background-alt)",
				border: "1px solid var(--color-border)",
				borderRadius: "var(--radius-md)",
				padding: "var(--spacing-md)",
				marginBottom: "var(--spacing-sm)",
			}}
			{...attributes}
		>
			<div
				{...listeners}
				style={{ cursor: "grab", userSelect: "none", fontSize: "20px", color: "var(--color-text-light)", paddingTop: "2px", flexShrink: 0 }}
				aria-label="Drag to reorder"
			>
				⋮⋮
			</div>
			{post.image && (
				<img
					src={post.image}
					alt=""
					style={{ width: 64, height: 64, objectFit: "cover", borderRadius: "var(--radius-sm)", flexShrink: 0 }}
				/>
			)}
			<div style={{ flex: 1, minWidth: 0 }}>
				<div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-xs)", flexWrap: "wrap" }}>
					<span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", background: "var(--color-primary)", color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
						{NEWS_PLATFORM_LABELS[post.source] ?? post.source}
					</span>
					<span style={{ fontSize: "0.8rem", color: "var(--color-text-light)" }}>
						{newsFormatDate(post.date)}
					</span>
					{!post.is_published && (
						<span style={{ fontSize: "0.75rem", color: "var(--color-text-light)", fontStyle: "italic" }}>Hidden</span>
					)}
				</div>
				<p style={{ fontSize: "0.875rem", margin: "0 0 var(--spacing-xs)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
					{post.text || "(no text)"}
				</p>
				{post.url && (
					<a href={post.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.8rem", color: "var(--color-primary)" }}>
						View original →
					</a>
				)}
			</div>
			<button
				type="button"
				className={post.is_published ? "btn btn-danger" : "btn btn-rainbow"}
				style={{ fontSize: "0.8rem", padding: "4px 10px", whiteSpace: "nowrap", flexShrink: 0 }}
				onClick={() => onTogglePublished(post.id, post.source, !post.is_published)}
			>
				{post.is_published ? "Hide" : "Show"}
			</button>
		</div>
	);
}

function NewsSection() {
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	const loadPosts = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const endpoints = [
				{ url: "/api/facebook/posts", key: "posts", normalize: (p) => ({ id: `fb-${p.id}`, source: "facebook", text: p.message, image: p.full_picture || null, date: p.created_time, url: p.permalink_url }) },
				{ url: "/api/instagram/posts", key: "posts", normalize: (p) => ({ id: `ig-${p.id}`, source: "instagram", text: p.caption, image: p.media_url || p.thumbnail_url || null, date: p.timestamp, url: p.permalink }) },
				{ url: "/api/twitter/posts", key: "posts", normalize: (p) => ({ id: `x-${p.id}`, source: "twitter", text: p.text, image: p.media_url || null, date: p.created_at, url: p.permalink_url }) },
				{ url: "/api/tiktok/posts", key: "posts", normalize: (p) => ({ id: `tt-${p.id}`, source: "tiktok", text: p.video_description || p.title || "", image: p.cover_image_url || null, date: new Date(p.create_time * 1000).toISOString(), url: p.share_url }) },
			];
			const results = await Promise.allSettled([
				...endpoints.map(({ url, key, normalize }) =>
					fetch(url, { credentials: "include" }).then((r) => r.json()).then((d) => (d[key] || []).map(normalize))
				),
				fetch("/api/news/overrides").then((r) => r.json()).then((d) => d.overrides || []),
			]);
			const postResults = results.slice(0, endpoints.length);
			const overridesResult = results[endpoints.length];
			const overrides = overridesResult.status === "fulfilled" ? overridesResult.value : [];
			const overrideMap = Object.fromEntries(overrides.map((o) => [o.post_id, o]));
			const all = postResults
				.filter((r) => r.status === "fulfilled")
				.flatMap((r) => r.value)
				.map((post) => ({
					...post,
					is_published: overrideMap[post.id]?.is_published ?? true,
					display_order: overrideMap[post.id]?.display_order ?? null,
				}))
				.sort((a, b) => {
					const aOrder = a.display_order ?? Infinity;
					const bOrder = b.display_order ?? Infinity;
					if (aOrder !== bOrder) return aOrder - bOrder;
					return new Date(b.date) - new Date(a.date);
				});
			setPosts(all);
		} catch {
			setError("Failed to load news posts");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { loadPosts(); }, [loadPosts]);

	const handleDragEnd = async (event) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const oldIndex = posts.findIndex((p) => p.id === active.id);
		const newIndex = posts.findIndex((p) => p.id === over.id);
		if (oldIndex === -1 || newIndex === -1) return;
		const newPosts = arrayMove(posts, oldIndex, newIndex).map((p, i) => ({ ...p, display_order: i }));
		setPosts(newPosts);
		try {
			const res = await fetch("/api/news/admin/reorder", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ updates: newPosts.map((p) => ({ postId: p.id, source: p.source, displayOrder: p.display_order })) }),
			});
			if (!res.ok) throw new Error("Failed to reorder");
			toast.success("News reordered!");
		} catch (err) {
			toast.error(err.message || "Failed to reorder");
			await loadPosts();
		}
	};

	const handleTogglePublished = async (postId, source, newIsPublished) => {
		setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, is_published: newIsPublished } : p)));
		try {
			const res = await fetch(`/api/news/admin/${encodeURIComponent(postId)}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ source, isPublished: newIsPublished }),
			});
			if (!res.ok) throw new Error("Failed to update");
			toast.success(newIsPublished ? "Post shown" : "Post hidden");
		} catch (err) {
			setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, is_published: !newIsPublished } : p)));
			toast.error(err.message || "Failed to update post");
		}
	};

	return (
		<div>
			<h2>News Management</h2>
			<p className="admin-help-text">
				Posts are pulled automatically from connected social platforms. Drag to reorder or hide posts you don&apos;t want shown on the home page. Connect platforms in the <strong>Settings</strong> tab.
			</p>
			{error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
			{loading ? (
				<p>Loading posts...</p>
			) : posts.length === 0 ? (
				<div style={{ padding: "var(--spacing-xl)", background: "var(--color-background-alt)", borderRadius: "var(--radius-md)", marginTop: "var(--spacing-lg)", textAlign: "center" }}>
					<p>No posts found. Make sure your social accounts are connected in the <strong>Settings</strong> tab.</p>
				</div>
			) : (
				<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
					<SortableContext items={posts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
						<div style={{ marginTop: "var(--spacing-lg)" }}>
							{posts.map((post) => (
								<SortableNewsCard key={post.id} post={post} onTogglePublished={handleTogglePublished} />
							))}
						</div>
					</SortableContext>
				</DndContext>
			)}
		</div>
	);
}

// Board Members Section
function BoardMembersSection() {
	const [boardMembers, setBoardMembers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const [editingId, setEditingId] = useState(null);
	const [name, setName] = useState("");
	const [title, setTitle] = useState("");
	const [imageUrl, setImageUrl] = useState("");
	const [displayOrder, setDisplayOrder] = useState(0);
	const [uploadingImage, setUploadingImage] = useState(false);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	useEffect(() => {
		let isMounted = true;

		async function loadBoardMembers() {
			setLoading(true);
			setError("");

			try {
				const response = await fetch("/api/board-members", {
					credentials: "include",
				});

				if (!isMounted) return;

				if (response.ok) {
					const data = await response.json();
					setBoardMembers(data.boardMembers ?? []);
				} else {
					setError("Failed to load board members");
				}
			} catch {
				if (isMounted) setError("Failed to load board members");
			} finally {
				if (isMounted) setLoading(false);
			}
		}

		loadBoardMembers();

		return () => {
			isMounted = false;
		};
	}, []);

	const refreshBoardMembers = async () => {
		try {
			const response = await fetch("/api/board-members", {
				credentials: "include",
			});

			if (response.ok) {
				const data = await response.json();
				setBoardMembers(data.boardMembers ?? []);
			}
		} catch (err) {
			console.error("Error refreshing board members:", err);
		}
	};

	const handleImageUpload = async (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setUploadingImage(true);
		setError("");

		try {
			const formData = new FormData();
			formData.append("image", file);

			const response = await fetch("/api/board-member-image", {
				method: "POST",
				credentials: "include",
				body: formData,
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.message || "Failed to upload image");
			}

			const data = await response.json();
			setImageUrl(data.imageUrl);
			toast.success("Image uploaded successfully!");
			event.target.value = ""; // Reset file input
		} catch (err) {
			setError(err.message || "Failed to upload image");
			toast.error(err.message || "Failed to upload image");
		} finally {
			setUploadingImage(false);
		}
	};

	const handleDragEnd = async (event) => {
		const { active, over } = event;

		if (!over || active.id === over.id) {
			return;
		}

		const oldIndex = boardMembers.findIndex((m) => m.id === active.id);
		const newIndex = boardMembers.findIndex((m) => m.id === over.id);

		if (oldIndex === -1 || newIndex === -1) {
			return;
		}

		// Optimistically update the UI
		const newBoardMembers = arrayMove(boardMembers, oldIndex, newIndex);

		// Update display_order for all items
		const updatedMembers = newBoardMembers.map((member, index) => ({
			...member,
			display_order: index,
		}));

		setBoardMembers(updatedMembers);

		// Send update to backend
		try {
			const updates = updatedMembers.map((member) => ({
				id: member.id,
				displayOrder: member.display_order,
			}));

			const response = await fetch("/api/board-members/reorder", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({ updates }),
			});

			if (!response.ok) {
				throw new Error("Failed to update order");
			}

			toast.success("Board members reordered successfully!");
		} catch (err) {
			setError(err.message || "Failed to update order");
			toast.error(err.message || "Failed to update order");
			// Refresh to get the correct order from server
			await refreshBoardMembers();
		}
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		setError("");

		if (!name.trim() || !title.trim()) {
			setError("Name and title are required");
			return;
		}

		try {
			const url = editingId
				? `/api/board-members/${editingId}`
				: "/api/board-members";
			const method = editingId ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					name,
					title,
					imageUrl: imageUrl || null,
					displayOrder: parseInt(displayOrder, 10) || 0,
				}),
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.message || "Failed to save board member");
			}

			setName("");
			setTitle("");
			setImageUrl("");
			setDisplayOrder(0);
			setEditingId(null);
			await refreshBoardMembers();

			toast.success(
				`Board member ${editingId ? "updated" : "added"} successfully!`,
			);
			// Scroll to Board Members section header
			setTimeout(() => {
				const boardMembersHeader = document.querySelector("#board-members-section-header");
				if (boardMembersHeader) {
					boardMembersHeader.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			}, 100);
		} catch (err) {
			setError(err.message || "Failed to save board member");
			toast.error(err.message || "Failed to save board member");
			// Scroll to Board Members section header to show error
			setTimeout(() => {
				const boardMembersHeader = document.querySelector("#board-members-section-header");
				if (boardMembersHeader) {
					boardMembersHeader.scrollIntoView({ behavior: "smooth", block: "start" });
				}
			}, 100);
		}
	};

	const handleEditClick = (member) => {
		setEditingId(member.id);
		setName(member.name || "");
		setTitle(member.title || "");
		setImageUrl(member.image_url || "");
		setDisplayOrder(member.display_order || 0);
		// Scroll to name label - use setTimeout to ensure state updates first
		setTimeout(() => {
			const nameLabel = document.querySelector("#board-member-name-label");
			if (nameLabel) {
				nameLabel.scrollIntoView({ behavior: "smooth", block: "start" });
				// Focus the input after scrolling
				const nameInput = document.querySelector("#board-member-name-input");
				if (nameInput) {
					nameInput.focus();
				}
			}
		}, 100);
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setName("");
		setTitle("");
		setImageUrl("");
		setDisplayOrder(0);
	};

	const handleDelete = async (id) => {
		if (!confirm("Are you sure you want to delete this board member?")) {
			return;
		}

		try {
			const response = await fetch(`/api/board-members/${id}`, {
				method: "DELETE",
				credentials: "include",
			});

			if (!response.ok) {
				const data = await response.json().catch(() => null);
				throw new Error(data?.message || "Failed to delete board member");
			}

			await refreshBoardMembers();
			toast.success("Board member deleted successfully!");
		} catch (err) {
			setError(err.message || "Failed to delete board member");
			toast.error(err.message || "Failed to delete board member");
		}
	};

	return (
		<div>
			<h2 id="board-members-section-header">Board Members</h2>

			{error && <p className="form-error">{error}</p>}

			{loading ? (
				<p>Loading board members...</p>
			) : (
				<>
					<p
						style={{
							marginBottom: "var(--spacing-md)",
							color: "var(--color-text-light)",
						}}
					>
						💡 Drag and drop rows to reorder board members. The order here
						determines how they appear on the About page.
					</p>
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<table className="admin-table">
							<thead>
								<tr>
									<th>Drag</th>
									<th>Name</th>
									<th>Title</th>
									<th>Image</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{boardMembers.length === 0 ? (
									<tr>
										<td colSpan="6" style={{ textAlign: "center" }}>
											No board members yet. Create one below!
										</td>
									</tr>
								) : (
									<SortableContext
										items={boardMembers.map((m) => m.id)}
										strategy={verticalListSortingStrategy}
									>
										{boardMembers.map((member) => (
											<SortableBoardMemberRow
												key={member.id}
												member={member}
												handleEditClick={handleEditClick}
												handleDelete={handleDelete}
											/>
										))}
									</SortableContext>
								)}
							</tbody>
						</table>
					</DndContext>
				</>
			)}

			<h3>{editingId ? "Edit Board Member" : "Add Board Member"}</h3>
			<form onSubmit={handleSubmit} className="admin-form board-members-form">
				<label className="form-field" id="board-member-name-label">
					<span>Name *</span>
					<input
						id="board-member-name-input"
						type="text"
						value={name}
						onChange={(event) => setName(event.target.value)}
						placeholder="John Doe"
						required
					/>
				</label>
				<label className="form-field">
					<span>Title *</span>
					<input
						type="text"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						placeholder="President"
						required
					/>
				</label>
				<label className="form-field">
					<span>Profile Image (optional)</span>
					{imageUrl && (
						<div
							style={{
								marginBottom: "var(--spacing-md)",
								display: "flex",
								alignItems: "center",
								gap: "var(--spacing-md)",
							}}
						>
							<img
								src={imageUrl}
								alt="Preview"
								style={{
									width: "80px",
									height: "80px",
									objectFit: "cover",
									borderRadius: "var(--radius-md)",
									border: "2px solid var(--color-border)",
								}}
							/>
							<button
								type="button"
								onClick={() => setImageUrl("")}
								className="btn btn-secondary"
								style={{ fontSize: "0.875rem", padding: "0.5rem 1rem" }}
							>
								Remove Image
							</button>
						</div>
					)}
					<div className="file-upload-wrapper">
						<input
							type="file"
							accept="image/*"
							onChange={handleImageUpload}
							disabled={uploadingImage}
							className="file-input"
							id="board-member-image-upload"
						/>
						<label htmlFor="board-member-image-upload" className="file-input-label">
							{uploadingImage ? "Uploading..." : imageUrl ? "Change Image" : "Choose Image"}
						</label>
					</div>
					{uploadingImage && (
						<p
							style={{
								marginTop: "var(--spacing-sm)",
								color: "var(--primary-purple)",
								fontSize: "0.875rem",
							}}
						>
							⏳ Uploading image...
						</p>
					)}
					<small
						style={{
							color: "var(--color-text-light)",
							marginTop: "var(--spacing-xs)",
							display: "block",
						}}
					>
						Upload a profile photo for this board member (JPG, PNG, or GIF)
					</small>
				</label>
				<div style={{ display: "flex", gap: "var(--spacing-md)" }}>
					<button type="submit" className="btn btn-primary">
						{editingId ? "Update Board Member" : "Add Board Member"}
					</button>
					{editingId && (
						<button
							type="button"
							className="btn btn-secondary"
							onClick={handleCancelEdit}
						>
							Cancel
						</button>
					)}
				</div>
			</form>
		</div>
	);
}

// Newsletter Section
function NewsletterSection() {
	const handleExportSubscribers = () => {
		window.location.href = "/api/newsletter/subscribers/export";
	};

	return (
		<div>
			<h3>Newsletter Subscribers</h3>
			<p style={{ color: "var(--color-text-light)", marginBottom: "var(--spacing-lg)" }}>
				Download a CSV of all newsletter subscriber emails.
			</p>
			<button type="button" className="btn btn-primary" onClick={handleExportSubscribers}>
				Export Emails to CSV
			</button>
		</div>
	);
}

// Settings Section - Social Media Integration and other settings
function SettingsSection() {
	const [activeSettingsTab, setActiveSettingsTab] = useState("social");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	// Facebook credentials
	const [facebookPageId, setFacebookPageId] = useState("");
	const [facebookAccessToken, setFacebookAccessToken] = useState("");

	// Instagram credentials
	const [instagramUserId, setInstagramUserId] = useState("");
	const [instagramAccessToken, setInstagramAccessToken] = useState("");

	// X/Twitter credentials
	const [xUsername, setXUsername] = useState("");
	const [xBearerToken, setXBearerToken] = useState("");

	// TikTok credentials
	const [tiktokClientKey, setTiktokClientKey] = useState("");
	const [tiktokClientSecret, setTiktokClientSecret] = useState("");
	const [tiktokConnected, setTiktokConnected] = useState(false);

	const settingsTabs = [
		{ id: "social", label: "Social Media" },
		{ id: "newsletter", label: "Newsletter" }
	];

	// Load current settings
	useEffect(() => {
		async function loadSettings() {
			try {
				const response = await fetch("/api/content/siteConfig");
				if (response.ok) {
					const data = await response.json();
					const content = data.data ?? {};

					if (content.facebookPageId) setFacebookPageId(content.facebookPageId);
					if (content.facebookAccessToken) setFacebookAccessToken(content.facebookAccessToken);
					if (content.instagramUserId) setInstagramUserId(content.instagramUserId);
					if (content.instagramAccessToken) setInstagramAccessToken(content.instagramAccessToken);
					if (content.xUsername) setXUsername(content.xUsername);
					if (content.xBearerToken) setXBearerToken(content.xBearerToken);
					if (content.tiktokClientKey) setTiktokClientKey(content.tiktokClientKey);
					if (content.tiktokClientSecret) setTiktokClientSecret(content.tiktokClientSecret);
					if (content.tiktokAccessToken) setTiktokConnected(true);
				}
			} catch (err) {
				console.error("Error loading settings:", err);
			}
		}
		loadSettings();
	}, []);

	const handleSaveFacebook = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const response = await fetch("/api/content/siteConfig", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ data: { facebookPageId, facebookAccessToken } }),
			});

			if (response.ok) {
				setSuccess("Facebook settings saved successfully!");
				setTimeout(() => setSuccess(""), 3000);
			} else {
				const data = await response.json();
				setError(data.error || "Failed to save Facebook settings");
			}
		} catch {
			setError("An error occurred while saving");
		} finally {
			setLoading(false);
		}
	};

	const handleSaveInstagram = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const response = await fetch("/api/content/siteConfig", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ data: { instagramUserId, instagramAccessToken } }),
			});

			if (response.ok) {
				setSuccess("Instagram settings saved successfully!");
				setTimeout(() => setSuccess(""), 3000);
			} else {
				const data = await response.json();
				setError(data.error || "Failed to save Instagram settings");
			}
		} catch {
			setError("An error occurred while saving");
		} finally {
			setLoading(false);
		}
	};

	const handleSaveX = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const response = await fetch("/api/content/siteConfig", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ data: { xUsername, xBearerToken } }),
			});

			if (response.ok) {
				setSuccess("X (Twitter) settings saved successfully!");
				setTimeout(() => setSuccess(""), 3000);
			} else {
				const data = await response.json();
				setError(data.error || "Failed to save X settings");
			}
		} catch {
			setError("An error occurred while saving");
		} finally {
			setLoading(false);
		}
	};

	const handleSaveTikTok = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		setSuccess("");

		try {
			const response = await fetch("/api/content/siteConfig", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ data: { tiktokClientKey, tiktokClientSecret } }),
			});

			if (response.ok) {
				setSuccess("TikTok credentials saved! Click \"Connect TikTok Account\" to authorize.");
				setTimeout(() => setSuccess(""), 5000);
			} else {
				const data = await response.json();
				setError(data.error || "Failed to save TikTok credentials");
			}
		} catch {
			setError("An error occurred while saving");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<h2>Settings</h2>

			{error && (
				<div style={{
					padding: "var(--spacing-md)",
					marginBottom: "var(--spacing-lg)",
					background: "#fee",
					color: "#c00",
					borderRadius: "var(--radius-md)"
				}}>
					{error}
				</div>
			)}

			{success && (
				<div style={{
					padding: "var(--spacing-md)",
					marginBottom: "var(--spacing-lg)",
					background: "#efe",
					color: "#060",
					borderRadius: "var(--radius-md)"
				}}>
					{success}
				</div>
			)}

			{/* Settings Tabs */}
			<nav style={{
				display: "flex",
				gap: "var(--spacing-sm)",
				marginBottom: "var(--spacing-xl)",
				borderBottom: "2px solid var(--color-border)"
			}}>
				{settingsTabs.map((tab) => (
					<button
						key={tab.id}
						type="button"
						onClick={() => setActiveSettingsTab(tab.id)}
						style={{
							background: "none",
							border: "none",
							padding: "var(--spacing-md) var(--spacing-lg)",
							fontSize: "1rem",
							fontWeight: "500",
							color: activeSettingsTab === tab.id ? "var(--primary-purple)" : "var(--color-text-light)",
							cursor: "pointer",
							borderBottom: activeSettingsTab === tab.id ? "3px solid var(--primary-purple)" : "3px solid transparent",
							transition: "all 0.2s ease",
							marginBottom: "-2px"
						}}
					>
						{tab.label}
					</button>
				))}
			</nav>

			{/* Social Media Tab */}
			{activeSettingsTab === "social" && (
				<div>
					<p style={{ marginBottom: "var(--spacing-xl)", color: "var(--color-text-light)" }}>
						Connect your social media accounts to automatically pull posts into the News section.
					</p>

			{/* Facebook Integration */}
			<form onSubmit={handleSaveFacebook}>
				<h3
					style={{
						marginTop: "var(--spacing-xl)",
						marginBottom: "var(--spacing-md)",
					}}
				>
					Facebook News Feed
				</h3>
				<p style={{ color: "var(--medium-gray)", fontSize: "0.9rem", marginBottom: "var(--spacing-md)" }}>
					Powers the news feed on the homepage. Get a Page Access Token from{" "}
					<a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer">
						Meta Graph API Explorer
					</a>{" "}
					with the <code>pages_read_engagement</code> permission.
				</p>
				<label className="form-field">
					<span>Facebook Page ID</span>
					<input
						type="text"
						value={facebookPageId}
						onChange={(e) => setFacebookPageId(e.target.value)}
						placeholder="e.g. 61576987598719"
					/>
				</label>
				<label className="form-field">
					<span>Facebook Page Access Token</span>
					<input
						type="password"
						value={facebookAccessToken}
						onChange={(e) => setFacebookAccessToken(e.target.value)}
						placeholder="Paste your long-lived Page Access Token"
						autoComplete="off"
					/>
				</label>
				<button
					type="submit"
					className="btn btn-primary"
					disabled={loading}
					style={{ marginTop: "var(--spacing-md)" }}
				>
					{loading ? "Saving..." : "Save Facebook Settings"}
				</button>
			</form>

			{/* Instagram Integration */}
			<form onSubmit={handleSaveInstagram}>
				<h3
					style={{
						marginTop: "var(--spacing-xl)",
						marginBottom: "var(--spacing-md)",
					}}
				>
					Instagram News Feed
				</h3>
				<p style={{ color: "var(--medium-gray)", fontSize: "0.9rem", marginBottom: "var(--spacing-md)" }}>
					Requires an Instagram Business or Creator account connected to your Facebook Page.
					Use the same{" "}
					<a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer">
						Graph API Explorer
					</a>{" "}
					token with <code>instagram_basic</code> permission. Your Instagram User ID is the numeric
					ID from the Graph API, not your username.
				</p>
				<label className="form-field">
					<span>Instagram User ID</span>
					<input
						type="text"
						value={instagramUserId}
						onChange={(e) => setInstagramUserId(e.target.value)}
						placeholder="e.g. 17841400000000000"
					/>
				</label>
				<label className="form-field">
					<span>Instagram Access Token</span>
					<input
						type="password"
						value={instagramAccessToken}
						onChange={(e) => setInstagramAccessToken(e.target.value)}
						placeholder="Paste your long-lived Page Access Token"
						autoComplete="off"
					/>
				</label>
				<button
					type="submit"
					className="btn btn-primary"
					disabled={loading}
					style={{ marginTop: "var(--spacing-md)" }}
				>
					{loading ? "Saving..." : "Save Instagram Settings"}
				</button>
			</form>

			{/* TikTok Integration */}
			<form onSubmit={handleSaveTikTok}>
				<h3
					style={{
						marginTop: "var(--spacing-xl)",
						marginBottom: "var(--spacing-md)",
					}}
				>
					TikTok News Feed
				</h3>
				<p style={{ color: "var(--medium-gray)", fontSize: "0.9rem", marginBottom: "var(--spacing-md)" }}>
					Requires a TikTok Developer account. Create an app at{" "}
					<a href="https://developers.tiktok.com/" target="_blank" rel="noopener noreferrer">
						developers.tiktok.com
					</a>
					{" "}with the <code>video.list</code> scope. Save your credentials below,
					then click Connect to authorize your TikTok account.
				</p>
				<label className="form-field">
					<span>TikTok Client Key</span>
					<input
						type="text"
						value={tiktokClientKey}
						onChange={(e) => setTiktokClientKey(e.target.value)}
						placeholder="Your TikTok app Client Key"
					/>
				</label>
				<label className="form-field">
					<span>TikTok Client Secret</span>
					<input
						type="password"
						value={tiktokClientSecret}
						onChange={(e) => setTiktokClientSecret(e.target.value)}
						placeholder="Your TikTok app Client Secret"
						autoComplete="off"
					/>
				</label>
				<div style={{ display: "flex", gap: "var(--spacing-md)", alignItems: "center", marginTop: "var(--spacing-md)", flexWrap: "wrap" }}>
					<button
						type="submit"
						className="btn btn-secondary"
						disabled={loading}
					>
						{loading ? "Saving..." : "Save TikTok Credentials"}
					</button>
					<button
						type="button"
						className="btn btn-primary"
						disabled={!tiktokClientKey || !tiktokClientSecret}
						onClick={() => { window.location.href = "/api/tiktok/auth"; }}
					>
						{tiktokConnected ? "Reconnect TikTok Account" : "Connect TikTok Account"}
					</button>
					{tiktokConnected && (
						<span style={{ color: "#060", fontSize: "0.9rem", fontWeight: 500 }}>
							&#10003; Connected
						</span>
					)}
				</div>
			</form>

			{/* Twitter/X Integration */}
			<form onSubmit={handleSaveX}>
				<h3
					style={{
						marginTop: "var(--spacing-xl)",
						marginBottom: "var(--spacing-md)",
					}}
				>
					X (Twitter) News Feed
				</h3>
				<p style={{ color: "var(--medium-gray)", fontSize: "0.9rem", marginBottom: "var(--spacing-md)" }}>
					Requires an{" "}
					<a href="https://developer.x.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer">
						X Developer account
					</a>
					. Create an app and copy the Bearer Token from the Keys &amp; Tokens tab.
					Works for public accounts with no user login required.
				</p>
				<label className="form-field">
					<span>X Username</span>
					<input
						type="text"
						value={xUsername}
						onChange={(e) => setXUsername(e.target.value)}
						placeholder="e.g. lwcwinchester (without @)"
					/>
				</label>
				<label className="form-field">
					<span>X Bearer Token</span>
					<input
						type="password"
						value={xBearerToken}
						onChange={(e) => setXBearerToken(e.target.value)}
						placeholder="Paste your Bearer Token"
						autoComplete="off"
					/>
				</label>
				<button
					type="submit"
					className="btn btn-primary"
					disabled={loading}
					style={{ marginTop: "var(--spacing-md)" }}
				>
					{loading ? "Saving..." : "Save X (Twitter) Settings"}
				</button>
			</form>
		</div>
	)}

	{/* Newsletter Tab */}
	{activeSettingsTab === "newsletter" && <NewsletterSection />}
		</div>
	);
}

export default Admin;
