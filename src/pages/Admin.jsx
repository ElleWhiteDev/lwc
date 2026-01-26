import { useState, useEffect } from "react";
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
						<option value="siteConfig">Site Config</option>
					</select>
				</label>
			</div>

			{page === "home" && <HomeContentEditor />}
			{page === "about" && <AboutContentEditor />}
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
			prideFestivalTitle,
			prideFestivalDescription,
			prideAttendees,
			prideVendors,
			prideShows,
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

// Placeholder for About page editor
function AboutContentEditor() {
	return (
		<div
			style={{
				padding: "var(--spacing-xl)",
				background: "var(--color-background-alt)",
				borderRadius: "var(--radius-md)",
				marginTop: "var(--spacing-lg)",
			}}
		>
			<h3>About Page Editor</h3>
			<p>Visual form builder for About page coming soon...</p>
			<p
				style={{
					fontSize: "0.9rem",
					color: "var(--color-text-light)",
					marginTop: "var(--spacing-md)",
				}}
			>
				This will include forms for: Mission statement, Info blocks (Love,
				Inclusion, Celebration), and Board Members.
			</p>
		</div>
	);
}

// Placeholder for Site Config editor
function SiteConfigEditor() {
	return (
		<div
			style={{
				padding: "var(--spacing-xl)",
				background: "var(--color-background-alt)",
				borderRadius: "var(--radius-md)",
				marginTop: "var(--spacing-lg)",
			}}
		>
			<h3>Site Configuration Editor</h3>
			<p>Visual form builder for site configuration coming soon...</p>
			<p
				style={{
					fontSize: "0.9rem",
					color: "var(--color-text-light)",
					marginTop: "var(--spacing-md)",
				}}
			>
				This will include: Site name, tagline, social media links, contact info,
				etc.
			</p>
		</div>
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

// News Section - Manage news posts (Facebook + Manual)
function NewsSection() {
	return (
		<div>
			<h2>News Management</h2>
			<p className="admin-help-text">
				Manage news posts from Facebook and create custom news posts. Once
				Facebook is connected, posts will appear here automatically. You can
				reorder, hide, or delete posts.
			</p>
			<div
				style={{
					padding: "var(--spacing-xl)",
					background: "var(--color-background-alt)",
					borderRadius: "var(--radius-md)",
					marginTop: "var(--spacing-lg)",
				}}
			>
				<h3>News Management Coming Soon</h3>
				<p>This section will allow you to:</p>
				<ul
					style={{
						marginLeft: "var(--spacing-lg)",
						marginTop: "var(--spacing-md)",
					}}
				>
					<li>
						View Facebook posts automatically pulled from your connected page
					</li>
					<li>Reorder news posts (drag-and-drop)</li>
					<li>Hide or delete Facebook posts</li>
					<li>Create custom news posts manually</li>
					<li>Publish/unpublish news posts</li>
				</ul>
				<p
					style={{
						fontSize: "0.9rem",
						color: "var(--color-text-light)",
						marginTop: "var(--spacing-md)",
					}}
				>
					Connect your Facebook page in the Settings tab to enable automatic
					post importing.
				</p>
			</div>
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

// Settings Section - Social Media Integration and other settings
function SettingsSection() {
	return (
		<div>
			<h2>Settings</h2>
			<p style={{ marginBottom: "var(--spacing-xl)", color: "var(--color-text-light)" }}>
				Connect your social media accounts to automatically pull posts into the News section.
			</p>

			{/* Facebook Integration */}
			<h3
				style={{
					marginTop: "var(--spacing-xl)",
					marginBottom: "var(--spacing-md)",
				}}
			>
				Facebook Integration
			</h3>
			<div
				style={{
					padding: "var(--spacing-xl)",
					background: "var(--color-background-alt)",
					borderRadius: "var(--radius-md)",
					marginBottom: "var(--spacing-xl)",
				}}
			>
				<p style={{ marginBottom: "var(--spacing-md)" }}>
					Connect your Facebook page to automatically pull posts into the News
					section.
				</p>
				<p
					style={{
						fontSize: "0.9rem",
						color: "var(--color-text-light)",
						marginBottom: "var(--spacing-lg)",
					}}
				>
					<strong>Coming Soon:</strong> This feature is currently under
					development. You'll be able to connect your Facebook page and
					automatically import posts.
				</p>

				<label className="form-field">
					<span>Facebook Page ID</span>
					<input type="text" placeholder="Your Facebook Page ID" disabled />
				</label>

				<label className="form-field">
					<span>Access Token</span>
					<input type="password" placeholder="Facebook Access Token" disabled />
				</label>

				<button type="button" className="btn btn-primary" disabled>
					Connect Facebook (Coming Soon)
				</button>
			</div>

			{/* Instagram Integration */}
			<h3
				style={{
					marginTop: "var(--spacing-xl)",
					marginBottom: "var(--spacing-md)",
				}}
			>
				Instagram Integration
			</h3>
			<div
				style={{
					padding: "var(--spacing-xl)",
					background: "var(--color-background-alt)",
					borderRadius: "var(--radius-md)",
					marginBottom: "var(--spacing-xl)",
				}}
			>
				<p style={{ marginBottom: "var(--spacing-md)" }}>
					Connect your Instagram account to automatically pull posts into the News
					section.
				</p>
				<p
					style={{
						fontSize: "0.9rem",
						color: "var(--color-text-light)",
						marginBottom: "var(--spacing-lg)",
					}}
				>
					<strong>Coming Soon:</strong> This feature is currently under
					development. You'll be able to connect your Instagram account and
					automatically import posts.
				</p>

				<label className="form-field">
					<span>Instagram Business Account ID</span>
					<input type="text" placeholder="Your Instagram Business Account ID" disabled />
				</label>

				<label className="form-field">
					<span>Access Token</span>
					<input type="password" placeholder="Instagram Access Token" disabled />
				</label>

				<button type="button" className="btn btn-primary" disabled>
					Connect Instagram (Coming Soon)
				</button>
			</div>

			{/* TikTok Integration */}
			<h3
				style={{
					marginTop: "var(--spacing-xl)",
					marginBottom: "var(--spacing-md)",
				}}
			>
				TikTok Integration
			</h3>
			<div
				style={{
					padding: "var(--spacing-xl)",
					background: "var(--color-background-alt)",
					borderRadius: "var(--radius-md)",
					marginBottom: "var(--spacing-xl)",
				}}
			>
				<p style={{ marginBottom: "var(--spacing-md)" }}>
					Connect your TikTok account to automatically pull videos into the News
					section.
				</p>
				<p
					style={{
						fontSize: "0.9rem",
						color: "var(--color-text-light)",
						marginBottom: "var(--spacing-lg)",
					}}
				>
					<strong>Coming Soon:</strong> This feature is currently under
					development. You'll be able to connect your TikTok account and
					automatically import videos.
				</p>

				<label className="form-field">
					<span>TikTok Username</span>
					<input type="text" placeholder="@yourusername" disabled />
				</label>

				<label className="form-field">
					<span>Access Token</span>
					<input type="password" placeholder="TikTok Access Token" disabled />
				</label>

				<button type="button" className="btn btn-primary" disabled>
					Connect TikTok (Coming Soon)
				</button>
			</div>

			{/* Twitter/X Integration */}
			<h3
				style={{
					marginTop: "var(--spacing-xl)",
					marginBottom: "var(--spacing-md)",
				}}
			>
				Twitter (X) Integration
			</h3>
			<div
				style={{
					padding: "var(--spacing-xl)",
					background: "var(--color-background-alt)",
					borderRadius: "var(--radius-md)",
					marginBottom: "var(--spacing-xl)",
				}}
			>
				<p style={{ marginBottom: "var(--spacing-md)" }}>
					Connect your Twitter/X account to automatically pull tweets into the News
					section.
				</p>
				<p
					style={{
						fontSize: "0.9rem",
						color: "var(--color-text-light)",
						marginBottom: "var(--spacing-lg)",
					}}
				>
					<strong>Coming Soon:</strong> This feature is currently under
					development. You'll be able to connect your Twitter/X account and
					automatically import tweets.
				</p>

				<label className="form-field">
					<span>Twitter/X Username</span>
					<input type="text" placeholder="@yourusername" disabled />
				</label>

				<label className="form-field">
					<span>API Key</span>
					<input type="password" placeholder="Twitter API Key" disabled />
				</label>

				<label className="form-field">
					<span>API Secret</span>
					<input type="password" placeholder="Twitter API Secret" disabled />
				</label>

				<label className="form-field">
					<span>Access Token</span>
					<input type="password" placeholder="Twitter Access Token" disabled />
				</label>

				<label className="form-field">
					<span>Access Token Secret</span>
					<input type="password" placeholder="Twitter Access Token Secret" disabled />
				</label>

				<button type="button" className="btn btn-primary" disabled>
					Connect Twitter/X (Coming Soon)
				</button>
			</div>
		</div>
	);
}

export default Admin;
