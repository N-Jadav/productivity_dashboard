import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { useApp } from "../../context/AppContext";

const EMOJI_OPTIONS = [
  "🏋️",
  "📚",
  "🧘",
  "💧",
  "🚫",
  "🌅",
  "🍎",
  "💊",
  "✍️",
  "🎵",
  "🚴",
  "🌿",
  "💪",
  "🧹",
  "💤",
  "🧠",
];
const COLOR_OPTIONS = [
  "#10b981",
  "#6366f1",
  "#f59e0b",
  "#06b6d4",
  "#ec4899",
  "#ef4444",
  "#8b5cf6",
  "#f97316",
  "#14b8a6",
  "#a855f7",
];

const EMOJI_DEFAULTS: Record<string, string> = {
  "🏋️": "Workout",
  "📚": "Read Books",
  "🧘": "Meditate",
  "💧": "Drink Water",
  "🚫": "Limit Screentime",
  "🌅": "Wake Up Early",
  "🍎": "Eat Healthy",
  "💊": "Take Vitamins",
  "✍️": "Journaling",
  "🎵": "Practice Music",
  "🚴": "Cycling",
  "🌿": "Water Plants",
  "💪": "Exercise",
  "🧹": "Clean Room",
  "💤": "Sleep Early",
  "🧠": "Study",
};

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekStart: string;
}

const AddHabitModal: React.FC<AddHabitModalProps> = ({
  isOpen,
  onClose,
  weekStart,
}) => {
  const { addHabit } = useApp();
  const [emoji, setEmoji] = useState("🏋️");
  const [name, setName] = useState(EMOJI_DEFAULTS["🏋️"] || "");
  const [isNameEdited, setIsNameEdited] = useState(false);
  const [color, setColor] = useState("#10b981");
  const [type, setType] = useState<"boolean" | "number">("boolean");
  const [targetValue, setTargetValue] = useState<number>(10);
  const [unit, setUnit] = useState<string>("pages");
  const [comparison, setComparison] = useState<"lte" | "gte" | "eq">("lte");

  // Reset modal state when it is opened
  useEffect(() => {
    if (isOpen) {
      setEmoji("🏋️");
      setName(EMOJI_DEFAULTS["🏋️"] || "");
      setIsNameEdited(false);
      setColor("#10b981");
      setType("boolean");
      setTargetValue(10);
      setUnit("pages");
      setComparison("lte");
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addHabit(
      {
        name: name.trim(),
        emoji,
        color,
        type,
        targetValue: type === "number" ? targetValue : undefined,
        unit: type === "number" ? unit : undefined,
        comparison: type === "number" ? comparison : undefined,
      },
      weekStart,
    );
    setEmoji("🏋️");
    setName(EMOJI_DEFAULTS["🏋️"] || "");
    setIsNameEdited(false);
    setColor("#10b981");
    setType("boolean");
    setTargetValue(10);
    setUnit("pages");
    setComparison("lte");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Habit">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label className="form-label">Pick an Emoji</label>
          <div className="emoji-grid">
            {EMOJI_OPTIONS.map((e) => (
              <button
                key={e}
                type="button"
                className={`emoji-btn ${emoji === e ? "active" : ""}`}
                onClick={() => {
                  setEmoji(e);
                  if (!isNameEdited || !name.trim()) {
                    setName(EMOJI_DEFAULTS[e] || "");
                    setIsNameEdited(false);
                  }
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Habit Type</label>
          <div className="type-toggle-group">
            <button
              type="button"
              className={`type-btn ${type === "boolean" ? "active" : ""}`}
              onClick={() => setType("boolean")}
            >
              Checkbox
            </button>
            <button
              type="button"
              className={`type-btn ${type === "number" ? "active" : ""}`}
              onClick={() => setType("number")}
            >
              Numeric
            </button>
          </div>
        </div>

        {type === "number" && (
          <div className="form-row" style={{ justifyContent: "stretch" }}>
            <div className="form-group flex-1">
              <label className="form-label">Target Goal</label>
              <input
                className="form-input"
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                placeholder="e.g. 15"
                required
              />
            </div>
            <div className="form-group flex-1">
              <label className="form-label">Unit</label>
              <input
                className="form-input"
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. pages, mins"
                required
              />
            </div>
          </div>
        )}

        {type === "number" && (
          <div className="form-group">
            <label className="form-label">Completion Logic</label>
            <div className="type-toggle-group">
              <button
                type="button"
                className={`type-btn ${comparison === "lte" ? "active" : ""}`}
                onClick={() => setComparison("lte")}
                title="Mark complete when value is LESS THAN OR EQUAL to target"
              >
                ≤ Limit
              </button>
              <button
                type="button"
                className={`type-btn ${comparison === "gte" ? "active" : ""}`}
                onClick={() => setComparison("gte")}
                title="Mark complete when value is GREATER THAN OR EQUAL to target"
              >
                ≥ Goal
              </button>
              <button
                type="button"
                className={`type-btn ${comparison === "eq" ? "active" : ""}`}
                onClick={() => setComparison("eq")}
                title="Mark complete when value EQUALS target"
              >
                = Exact
              </button>
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Habit Name</label>
          <input
            className="form-input"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setIsNameEdited(true);
            }}
            placeholder="e.g. Morning Run"
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="color-grid">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                className={`color-swatch ${color === c ? "active" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>

        <div className="form-row">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!name.trim()}
          >
            Add Habit
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddHabitModal;
