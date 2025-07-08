import React from "react";
import { FaCcVisa, FaCcMastercard, FaCcAmex, FaCcDiscover } from "react-icons/fa";

const CARD_TYPES = [
  { label: "Visa", value: "Visa", icon: <FaCcVisa color="#1a1f71" size={36} /> },
  { label: "MasterCard", value: "MasterCard", icon: <FaCcMastercard color="#eb001b" size={36} /> },
  { label: "Discover", value: "Discover", icon: <FaCcDiscover color="#f76b1c" size={36} /> },
  { label: "AMEX", value: "AMEX", icon: <FaCcAmex color="#2e77bb" size={36} /> },
];

export default function CardTypeSelector({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 18, margin: "12px 0" }}>
      {CARD_TYPES.map((card) => (
        <label
          key={card.value}
          style={{
            cursor: "pointer",
            border: value === card.value ? "2px solid #1976d2" : "2px solid #eee",
            borderRadius: 8,
            padding: "6px 14px",
            display: "flex",
            alignItems: "center",
            background: value === card.value ? "#e3f0fc" : "#fff",
            transition: "border .2s",
          }}
        >
          <input
            type="radio"
            name="cardType"
            value={card.value}
            checked={value === card.value}
            onChange={onChange}
            style={{ marginRight: 8 }}
          />
          {card.icon}
          <span style={{ marginLeft: 8, fontWeight: "bold" }}>{card.label}</span>
        </label>
      ))}
    </div>
  );
}
