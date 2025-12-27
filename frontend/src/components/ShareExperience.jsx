import React, { useState } from 'react';

export default function ShareExperience({ open, onClose, onAdded }) {
	const [user, setUser] = useState('');
	const [message, setMessage] = useState('');
	const [rating, setRating] = useState(0);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	if (!open) return null;

	const submit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		if (!message.trim()) { setError('Please enter feedback'); return; }
		if (rating < 1) { setError('Please select a rating'); return; }
		setSubmitting(true);
		try {
			const res = await fetch('http://localhost:5000/api/experiences', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ user: user.trim() || 'Anonymous', message: message.trim(), rating })
			});
			const bodyText = await res.text().catch(()=>'');
			let json;
			try { json = bodyText ? JSON.parse(bodyText) : null; } catch { json = null; }

			if (res.ok) {
				setSuccess('Feedback submitted successfully.');
				setUser(''); setMessage(''); setRating(0);
				if (onAdded) onAdded();
				// keep success visible briefly then close
				setTimeout(() => {
					setSuccess('');
					if (onClose) onClose();
				}, 900);
			} else {
				const serverMsg = (json && (json.message || json.error)) || bodyText || 'Submit failed';
				setError(serverMsg);
			}
		} catch (err) {
			console.error('Network error:', err);
			setError('Network error - cannot reach server');
		} finally {
			setSubmitting(false);
		}
	};

	// simple colored modal styles
	const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
	const boxStyle = { background: '#fff', padding: 20, borderRadius: 12, width: 420, boxShadow: '0 8px 30px rgba(0,0,0,0.2)' };
	const headerStyle = { marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
	const btnPrimary = { background: '#28a745', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' };
	const btnSecondary = { background: '#f0f0f0', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' };

	return (
		<div style={overlayStyle}>
			<form onSubmit={submit} style={boxStyle}>
				<div style={headerStyle}>
					<h3 style={{ margin: 0 }}>Share your experience</h3>
					<button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
				</div>

				<label style={{ display: 'block', marginBottom: 8 }}>
					<span style={{ fontSize: 13, color: '#333' }}>Name (optional)</span>
					<input value={user} onChange={e => setUser(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 6, border: '1px solid #ddd' }} />
				</label>

				<label style={{ display: 'block', marginBottom: 8 }}>
					<span style={{ fontSize: 13, color: '#333' }}>Feedback</span>
					<textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} style={{ width: '100%', padding: 8, marginTop: 6, borderRadius: 6, border: '1px solid #ddd' }} />
				</label>

				<label style={{ display: 'block', marginBottom: 12 }}>
					<span style={{ fontSize: 13, color: '#333' }}>Rating</span>
					<div style={{ marginTop: 6 }}>
						{[1, 2, 3, 4, 5].map(n => (
							<button
								type="button"
								key={n}
								onClick={() => setRating(n)}
								style={{
									border: 'none',
									background: 'transparent',
									fontSize: 24,
									cursor: 'pointer',
									color: n <= rating ? '#f5b301' : '#ddd',
									marginRight: 6
								}}
								aria-label={`Rate ${n}`}
							>★</button>
						))}
					</div>
				</label>

				{error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
				{success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}

				<div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
					<button type="button" onClick={onClose} disabled={submitting} style={btnSecondary}>Cancel</button>
					<button type="submit" disabled={submitting} style={btnPrimary}>{submitting ? 'Submitting...' : 'Submit'}</button>
				</div>
			</form>
		</div>
	);
}