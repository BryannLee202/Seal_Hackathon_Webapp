import { AnimatePresence, motion } from "framer-motion";
import { useState, type FormEvent, type ReactNode } from "react";

export interface WizardStep {
  title: string;
  content: ReactNode;
  /** Return an error message to block moving forward, or null/undefined if the step is valid. */
  validate?: () => string | null | undefined;
}

export function Wizard({
  steps,
  onSubmit,
  submitLabel = "Hoàn tất",
  submitting = false,
}: {
  steps: WizardStep[];
  onSubmit: () => void | Promise<void>;
  submitLabel?: string;
  submitting?: boolean;
}) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isLast = step === steps.length - 1;

  function goNext() {
    const err = steps[step].validate?.();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleFormSubmit(e: FormEvent) {
    e.preventDefault();
    const err = steps[step].validate?.();
    if (err) {
      setError(err);
      return;
    }
    if (isLast) {
      setError(null);
      await onSubmit();
    } else {
      goNext();
    }
  }

  return (
    <div className="wizard">
      <div className="wizard-progress">
        {steps.map((s, i) => (
          <div className="wizard-progress-item" key={s.title}>
            <div className={`wizard-dot ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`wizard-dot-label ${i === step ? "active" : ""}`}>{s.title}</span>
            {i < steps.length - 1 && <div className={`wizard-connector ${i < step ? "done" : ""}`} />}
          </div>
        ))}
      </div>

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleFormSubmit}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {steps[step].content}
          </motion.div>
        </AnimatePresence>

        <div className="wizard-actions">
          {step > 0 ? (
            <button type="button" className="btn secondary" onClick={goBack} disabled={submitting}>
              Quay lại
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className="btn" disabled={submitting}>
            {isLast ? (submitting ? "Đang gửi..." : submitLabel) : "Tiếp tục"}
          </button>
        </div>
      </form>
    </div>
  );
}
