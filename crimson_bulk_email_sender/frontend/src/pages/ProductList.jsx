import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Tag } from 'lucide-react';
import { useInvoice } from '../context/InvoiceContext';
import Dropdown from '../components/Dropdown';
import { productService } from '../services/productService';

export default function ProductList() {
  const { masterProducts, setMasterProducts } = useInvoice();

  // Form states for adding a new product
  const [newProduct, setNewProduct] = useState({
    description: '',
    size: '',
    price: '',
    gstRate: 18
  });

  // State for tracking which product ID is currently being edited
  const [editingId, setEditingId] = useState(null);
  const [editProduct, setEditProduct] = useState({
    description: '',
    size: '',
    price: '',
    gstRate: 18
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.description.trim()) {
      alert('Description is required.');
      return;
    }

    try {
      const added = await productService.createProduct({
        description: newProduct.description,
        size: newProduct.size,
        price: parseFloat(newProduct.price) || 0,
        gstRate: parseFloat(newProduct.gstRate) || 0,
        image: ''
      });
      setMasterProducts([...masterProducts, added]);
      setNewProduct({
        description: '',
        size: '',
        price: '',
        gstRate: 18
      });
    } catch (err) {
      alert('Failed to save product in database: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product from the master list?')) {
      try {
        await productService.deleteProduct(id);
        setMasterProducts(masterProducts.filter(p => p.id !== id));
        if (editingId === id) {
          setEditingId(null);
        }
      } catch (err) {
        alert('Failed to delete product from database: ' + err.message);
      }
    }
  };

  const handleStartEdit = (p) => {
    setEditingId(p.id);
    setEditProduct({
      description: p.description,
      size: p.size,
      price: p.price.toString(),
      gstRate: p.gstRate
    });
  };

  const handleSaveEdit = async (id) => {
    if (!editProduct.description.trim()) {
      alert('Description is required.');
      return;
    }

    try {
      const updated = await productService.updateProduct(id, {
        description: editProduct.description,
        size: editProduct.size,
        price: parseFloat(editProduct.price) || 0,
        gstRate: parseFloat(editProduct.gstRate) || 0,
        image: masterProducts.find(p => p.id === id)?.image || ''
      });
      setMasterProducts(masterProducts.map(p => p.id === id ? updated : p));
      setEditingId(null);
    } catch (err) {
      alert('Failed to update product in database: ' + err.message);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <header style={{ marginBottom: '24px' }}>
        <h1>Product Catalog Management</h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Left Column: Add Product */}
        <div className="card">
          <div className="card-title">
            <Tag size={16} />
            Add New Product
          </div>
          <form onSubmit={handleAddProduct}>
            <div className="form-group">
              <label>Description / Specifications</label>
              <textarea
                rows="3"
                className="invoice-form-item-input"
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '10px', fontSize: '13px' }}
                placeholder="e.g. Jackfruit Chips (Matte Metalised finish)"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Pack Size / Dimension</label>
              <input
                type="text"
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '10px', fontSize: '13px' }}
                placeholder="e.g. 200 gm"
                value={newProduct.size}
                onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Default Price / pc (₹)</label>
              <input
                type="number"
                step="0.01"
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-primary)', padding: '10px', fontSize: '13px' }}
                placeholder="e.g. 150.00"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>GST Rate (%)</label>
              <Dropdown
                options={[
                  { value: 0, label: '0%' },
                  { value: 5, label: '5%' },
                  { value: 12, label: '12%' },
                  { value: 18, label: '18%' },
                  { value: 28, label: '28%' }
                ]}
                value={newProduct.gstRate}
                onChange={(val) => setNewProduct({ ...newProduct, gstRate: Number(val) })}
                searchable={false}
              />
            </div>
            <button type="submit" className="btn-add-item-row" style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }}>
              <Plus size={16} />
              Add Product
            </button>
          </form>
        </div>

        {/* Right Column: Products Table */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-title">
            Product Database List
          </div>
          {masterProducts.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No products found in the catalog. Add some using the form!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="invoice-form-items-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ width: '40%', padding: '12px 8px', textAlign: 'left' }}>Description</th>
                    <th style={{ width: '20%', padding: '12px 8px', textAlign: 'left' }}>Size</th>
                    <th style={{ width: '15%', padding: '12px 8px', textAlign: 'left' }}>Price (₹)</th>
                    <th style={{ width: '10%', padding: '12px 8px', textAlign: 'left' }}>GST%</th>
                    <th style={{ width: '15%', padding: '12px 8px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {masterProducts.map((p) => {
                    const isEditing = editingId === p.id;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px dashed var(--border)' }}>
                        <td style={{ padding: '12px 8px' }}>
                          {isEditing ? (
                            <textarea
                              rows="2"
                              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', padding: '6px' }}
                              value={editProduct.description}
                              onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                            />
                          ) : (
                            <span style={{ fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>{p.description}</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          {isEditing ? (
                            <input
                              type="text"
                              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', padding: '6px' }}
                              value={editProduct.size}
                              onChange={(e) => setEditProduct({ ...editProduct, size: e.target.value })}
                            />
                          ) : (
                            <span style={{ color: 'var(--text-secondary)' }}>{p.size}</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.01"
                              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-primary)', padding: '6px' }}
                              value={editProduct.price}
                              onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                            />
                          ) : (
                            <span>₹{Number(p.price).toFixed(2)}</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          {isEditing ? (
                             <Dropdown
                               options={[
                                 { value: 0, label: '0%' },
                                 { value: 5, label: '5%' },
                                 { value: 12, label: '12%' },
                                 { value: 18, label: '18%' },
                                 { value: 28, label: '28%' }
                               ]}
                               value={editProduct.gstRate}
                               onChange={(val) => setEditProduct({ ...editProduct, gstRate: Number(val) })}
                               searchable={false}
                               selectStyle={{ padding: '6px' }}
                             />
                          ) : (
                            <span>{p.gstRate}%</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                className="btn-delete-item-row"
                                style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)', padding: '4px 8px' }}
                                onClick={() => handleSaveEdit(p.id)}
                                title="Save"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                type="button"
                                className="btn-delete-item-row"
                                style={{ padding: '4px 8px' }}
                                onClick={() => setEditingId(null)}
                                title="Cancel"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                className="btn-delete-item-row"
                                style={{ background: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa', borderColor: 'rgba(37, 99, 235, 0.4)', padding: '4px 8px' }}
                                onClick={() => handleStartEdit(p)}
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                className="btn-delete-item-row"
                                style={{ padding: '4px 8px' }}
                                onClick={() => handleDeleteProduct(p.id)}
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
