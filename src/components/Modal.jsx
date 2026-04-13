import "./Modal.css";

/**
 * Accessible modal overlay. Closes on backdrop click or the × button.
 * Callers are responsible for open/close state — see useModal hook.
 * Children render inside the scrollable white content pane.
 */
const Modal = ({ isOpen, onClose, labelId, maxWidth = "700px", children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
    >
      <div
        className="modal-content"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
