import React from 'react';

export default function AddressForm({
  type,
  form,
  onChange,
  onSubmit,
  onCancel,
  isEditing
}) {
  if (!isEditing) return null;

  return (
    <form onSubmit={onSubmit} style={{ marginTop: 18, border: "1px solid #ddd", borderRadius: 6, padding: 14 }}>
      <h4>{form._id ? `Edit ${type} Address` : `Add ${type} Address`}</h4>
      <input name="label" placeholder="Label" value={form.label} onChange={onChange} style={{ marginBottom: 6 }} />
      <input name="recipient" placeholder="Recipient" value={form.recipient} onChange={onChange} style={{ marginBottom: 6 }} />
      <input name="address" placeholder="Address" value={form.address} onChange={onChange} style={{ marginBottom: 6 }} required />
      <input name="city" placeholder="City" value={form.city} onChange={onChange} style={{ marginBottom: 6 }} required />
      <input name="postalCode" placeholder="Postal Code" value={form.postalCode} onChange={onChange} style={{ marginBottom: 6 }} required />
      <input name="country" placeholder="Country" value={form.country} onChange={onChange} style={{ marginBottom: 6 }} required />
      <div>
        <label>
          <input
            type="checkbox"
            name="isDefault"
            checked={form.isDefault}
            onChange={onChange}
          />
          {type === 'shipping' ? "Default Shipping" : "Default Billing"}
        </label>
      </div>  
      <div style={{ marginTop: 8 }}>
        <button type="submit">{form._id ? "Save" : "Add"}</button>
        <button type="button" onClick={onCancel} style={{ marginLeft: 8 }}>Cancel</button>
      </div>
    </form>
  );
}
