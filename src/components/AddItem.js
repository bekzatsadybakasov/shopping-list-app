import React, { useState } from 'react';
import './AddItem.css';

const AddItem = ({ item, onSave, onCancel }) => {
  const [name, setName] = useState(item?.name || '');
  const [quantity, setQuantity] = useState(item?.quantity?.toString() || '');
  const [measure, setMeasure] = useState(item?.measure || 'pcs');

  React.useEffect(() => {
    if (item) {
      setName(item.name || '');
      setQuantity(item.quantity?.toString() || '');
      setMeasure(item.measure || 'pcs');
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !quantity.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const newItem = {
      id: item?.id || Date.now(),
      name: name.trim(),
      quantity: parseInt(quantity) || 1,
      measure: measure,
      resolved: item?.resolved || false
    };

    onSave(newItem);
    if (!item) {
      setName('');
      setQuantity('');
      setMeasure('pcs');
    }
  };

  return (
    <div className="add-item">
      <div className="header">
        <div className="page-title-container">
          <h1 className="page-title">
            {item ? '✏️ EDIT ITEM' : '+ ADD ITEM'}
          </h1>
        </div>
      </div>

      <form className="add-item-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="field-label">NAME:</label>
          <input
            type="text"
            className="field-input"
            placeholder="write here..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label className="field-label">Quantity:</label>
          <input
            type="number"
            className="field-input"
            placeholder="write here..."
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            min="1"
          />
        </div>

        <div className="form-field">
          <label className="field-label">Measure:</label>
          <input
            type="text"
            className="field-input"
            placeholder="pcs/liters/kg"
            value={measure}
            onChange={(e) => setMeasure(e.target.value)}
            required
          />
        </div>
      </form>

      <div className="action-buttons">
        <button className="save-btn" onClick={handleSubmit}>
          SAVE CHANGES
        </button>
        <button className="cancel-btn" onClick={onCancel}>
          CANCEL
        </button>
      </div>
    </div>
  );
};

export default AddItem;

