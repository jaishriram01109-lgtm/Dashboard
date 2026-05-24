'use client';
import { useState, useMemo } from 'react';
import { useApp } from '@/lib/lv/context';
import type { Product } from '@/lib/lv/types';
import { Search, Plus, Grid, List, Upload, Star, Edit2, Eye, MoreHorizontal, X, Package, IndianRupee, Tag, Trash2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

const CATEGORIES = ['All', 'Men', 'Women', 'Ethnic', 'Formal', 'Casual'];

export default function ProductsPage() {
  const { state, dispatch, logAction } = useApp();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [showNewProduct, setShowNewProduct] = useState(false);

  const products = useMemo(() => {
    let p = [...state.products];
    if (category !== 'All') p = p.filter(x => x.category === category || x.collection === category);
    if (search) p = p.filter(x => x.name.toLowerCase().includes(search.toLowerCase()) || x.sku.toLowerCase().includes(search.toLowerCase()));
    switch (sortBy) {
      case 'price-asc': p.sort((a, b) => a.price - b.price); break;
      case 'price-desc': p.sort((a, b) => b.price - a.price); break;
      case 'stock': p.sort((a, b) => a.stock - b.stock); break;
      case 'rating': p.sort((a, b) => b.rating - a.rating); break;
      default: p.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return p;
  }, [state.products, category, search, sortBy]);

  const confirmDelete = (id: string) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
    logAction('PRODUCT_DELETED', `Product ID: ${id}`);
    setShowDelete(null);
  };

  const stockColor = (stock: number, threshold: number = 5) => {
    if (stock === 0) return 'var(--danger)';
    if (stock <= threshold) return 'var(--warning)';
    return 'var(--success)';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex-between" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Products ({state.products.length})</h1>
          <p className="page-subtitle">Manage your product catalog</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="lv-btn lv-btn-ghost"><Upload size={15} /> Bulk Import CSV</button>
          <button className="lv-btn lv-btn-gold" onClick={() => setShowNewProduct(true)}><Plus size={16} /> Add Product</button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="lv-input" style={{ paddingLeft: 36 }} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`lv-btn lv-btn-sm ${category === c ? 'lv-btn-gold' : 'lv-btn-ghost'}`}>
              {c}
            </button>
          ))}
        </div>
        {/* Sort */}
        <select className="lv-select" style={{ width: 160 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating">Best Rated</option>
          <option value="stock">Low Stock First</option>
        </select>
        {/* View Toggle */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 4 }}>
          <button className={`lv-btn lv-btn-sm lv-btn-icon ${view === 'grid' ? 'lv-btn-gold' : 'lv-btn-ghost'}`} onClick={() => setView('grid')}><Grid size={15} /></button>
          <button className={`lv-btn lv-btn-sm lv-btn-icon ${view === 'list' ? 'lv-btn-gold' : 'lv-btn-ghost'}`} onClick={() => setView('list')}><List size={15} /></button>
        </div>
      </div>

      {/* Products Grid */}
      {view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {products.map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="product-card">
              {/* Image Area */}
              <div style={{ position: 'relative', paddingTop: '100%', background: 'var(--bg-surface-2)' }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={40} color="var(--text-muted)" />
                </div>
                {product.badge && (
                  <div style={{ position: 'absolute', top: 10, left: 10, background: 'var(--gold)', color: '#0A0A0A', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4, letterSpacing: '0.06em' }}>
                    {product.badge}
                  </div>
                )}
                {product.stock <= (product.lowStockThreshold || 5) && (
                  <div style={{ position: 'absolute', top: 10, right: 10, background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>
                    LOW STOCK
                  </div>
                )}
                {/* Hover overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', opacity: 0, transition: 'opacity var(--t)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0'; }}>
                  <button className="lv-btn lv-btn-ghost lv-btn-sm" onClick={() => setEditProduct(product)}><Edit2 size={14} /> Edit</button>
                </div>
              </div>
              {/* Info */}
              <div style={{ padding: '14px 14px' }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}>{product.sku}</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(product.price)}</span>
                  <span style={{ fontSize: 12, color: stockColor(product.stock, product.lowStockThreshold) }}>Stock: {product.stock}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}>
                  <Star size={13} fill="var(--gold)" color="var(--gold)" />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{product.rating}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({product.reviews})</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="lv-btn lv-btn-ghost lv-btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setEditProduct(product)}>
                    <Edit2 size={13} /> Edit
                  </button>
                  <button className="lv-btn lv-btn-danger lv-btn-icon lv-btn-sm" onClick={() => setShowDelete(product.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="lv-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="lv-table">
            <thead>
              <tr>
                <th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>MRP</th><th>Stock</th><th>Rating</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Package size={18} color="var(--text-muted)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{p.name}</div>
                        {p.badge && <span style={{ fontSize: 10, background: 'var(--gold)', color: '#0A0A0A', padding: '1px 6px', borderRadius: 3, fontWeight: 700 }}>{p.badge}</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{p.sku}</td>
                  <td><span className="lv-badge badge-regular">{p.category}</span></td>
                  <td style={{ fontWeight: 600 }}>{fmt(p.price)}</td>
                  <td style={{ color: 'var(--text-secondary)', textDecoration: 'line-through', fontSize: 13 }}>{fmt(p.mrp)}</td>
                  <td><span style={{ color: stockColor(p.stock, p.lowStockThreshold), fontWeight: 500 }}>{p.stock}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={13} fill="var(--gold)" color="var(--gold)" />
                      <span style={{ fontSize: 13 }}>{p.rating}</span>
                    </div>
                  </td>
                  <td><span className={`lv-badge badge-${p.status === 'active' ? 'active' : 'inactive'}`}>{p.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="lv-btn lv-btn-ghost lv-btn-icon lv-btn-sm" onClick={() => setEditProduct(p)}><Edit2 size={14} /></button>
                      <button className="lv-btn lv-btn-danger lv-btn-icon lv-btn-sm" onClick={() => setShowDelete(p.id)}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Product Drawer */}
      <AnimatePresence>
        {(editProduct || showNewProduct) && (
          <>
            <motion.div className="lv-drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setEditProduct(null); setShowNewProduct(false); }} />
            <motion.div className="lv-drawer" style={{ width: 680 }} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.3 }}>
              <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <h2 style={{ fontWeight: 700, fontSize: 18 }}>{editProduct ? `Edit: ${editProduct.name}` : 'Add New Product'}</h2>
                <button className="lv-btn lv-btn-ghost lv-btn-icon" onClick={() => { setEditProduct(null); setShowNewProduct(false); }}><X size={18} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
                <ProductForm product={editProduct} onSave={(p) => {
                  if (editProduct) {
                    dispatch({ type: 'UPDATE_PRODUCT', payload: p });
                    logAction('PRODUCT_UPDATED', `Updated: ${p.name}`);
                  } else {
                    dispatch({ type: 'ADD_PRODUCT', payload: p });
                    logAction('PRODUCT_CREATED', `Created: ${p.name}`);
                  }
                  setEditProduct(null);
                  setShowNewProduct(false);
                }} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {showDelete && (
          <motion.div className="lv-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="lv-modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} style={{ maxWidth: 400 }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--danger-bg)', border: '2px solid var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Trash2 size={24} color="var(--danger)" />
                </div>
                <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Delete Product?</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>This action cannot be undone.</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="lv-label">Enter password to confirm</label>
                <input className="lv-input" type="password" placeholder="Your password" />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="lv-btn lv-btn-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowDelete(null)}>Cancel</button>
                <button className="lv-btn lv-btn-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => confirmDelete(showDelete)}>Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductForm({ product, onSave }: { product: Product | null; onSave: (p: Product) => void }) {
  const [form, setForm] = useState<Partial<Product>>(product || {
    name: '', sku: '', category: 'Men', price: 0, mrp: 0, costPrice: 0,
    stock: 0, status: 'active', rating: 0, reviews: 0, images: [],
    tags: [], gstRate: 12, hsnCode: '', lowStockThreshold: 5, createdAt: new Date().toISOString().split('T')[0]
  });
  const [tagInput, setTagInput] = useState('');
  const [activeSection, setActiveSection] = useState('basic');

  const margin = form.price && form.costPrice ? Math.round(((form.price - form.costPrice) / form.price) * 100) : 0;
  const discount = form.mrp && form.price ? Math.round(((form.mrp - form.price) / form.mrp) * 100) : 0;

  const handleSave = () => {
    const p: Product = {
      id: product?.id || 'P' + Date.now(),
      name: form.name || '',
      sku: form.sku || '',
      category: form.category || 'Men',
      price: form.price || 0,
      mrp: form.mrp || 0,
      costPrice: form.costPrice || 0,
      stock: form.stock || 0,
      images: [],
      rating: form.rating || 0,
      reviews: form.reviews || 0,
      status: form.status || 'active',
      tags: form.tags || [],
      gstRate: form.gstRate || 12,
      hsnCode: form.hsnCode,
      lowStockThreshold: form.lowStockThreshold || 5,
      createdAt: form.createdAt || new Date().toISOString().split('T')[0],
    };
    onSave(p);
  };

  const sections = ['basic', 'pricing', 'inventory', 'shipping'];

  return (
    <div>
      {/* Section Nav */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 28, overflowX: 'auto' }}>
        {sections.map(s => (
          <button key={s} onClick={() => setActiveSection(s)}
            className={`lv-btn lv-btn-sm ${activeSection === s ? 'lv-btn-gold' : 'lv-btn-ghost'}`}
            style={{ textTransform: 'capitalize' }}>
            {s === 'basic' ? 'Basic Info' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {activeSection === 'basic' && (
        <div className="form-section">
          <div style={{ marginBottom: 16 }}>
            <label className="lv-label">Product Title <span style={{ color: 'var(--text-muted)' }}>(max 80 chars)</span></label>
            <input className="lv-input" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value.slice(0, 80) }))} placeholder="e.g. Obsidian Slim Blazer" />
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right', marginTop: 4 }}>{(form.name || '').length}/80</div>
          </div>
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div>
              <label className="lv-label">Category</label>
              <select className="lv-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {['Men', 'Women', 'Unisex'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="lv-label">SKU</label>
              <input className="lv-input" value={form.sku || ''} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} placeholder="LV-M-BLZ-001" />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="lv-label">Description</label>
            <textarea className="lv-textarea" rows={4} value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the product…" />
          </div>
          <div>
            <label className="lv-label">Tags</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '10px 12px', background: 'var(--bg-surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              {(form.tags || []).map(t => (
                <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg-surface-3)', padding: '4px 10px', borderRadius: 99, fontSize: 13 }}>
                  {t}
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }} onClick={() => setForm(p => ({ ...p, tags: (p.tags || []).filter(x => x !== t) }))}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'var(--text-primary)', minWidth: 100, fontFamily: 'var(--font-admin)' }}
                placeholder="Add tag + Enter"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && tagInput.trim()) {
                    setForm(p => ({ ...p, tags: [...(p.tags || []), tagInput.trim()] }));
                    setTagInput('');
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {activeSection === 'pricing' && (
        <div className="form-section">
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div>
              <label className="lv-label">MRP (₹)</label>
              <input className="lv-input" type="number" value={form.mrp || ''} onChange={e => setForm(p => ({ ...p, mrp: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="lv-label">Selling Price (₹)</label>
              <input className="lv-input" type="number" value={form.price || ''} onChange={e => setForm(p => ({ ...p, price: Number(e.target.value) }))} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="lv-label">Cost Price (₹) <span style={{ color: 'var(--text-muted)' }}>(private)</span></label>
            <input className="lv-input" type="number" value={form.costPrice || ''} onChange={e => setForm(p => ({ ...p, costPrice: Number(e.target.value) }))} />
          </div>
          {(form.price || 0) > 0 && (
            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'var(--success-bg)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 16px', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Margin</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>{margin}%</div>
              </div>
              <div style={{ background: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 16px', flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Customer Discount</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gold)' }}>{discount}% OFF</div>
              </div>
            </div>
          )}
          <div className="grid-2">
            <div>
              <label className="lv-label">GST Rate</label>
              <select className="lv-select" value={form.gstRate} onChange={e => setForm(p => ({ ...p, gstRate: Number(e.target.value) }))}>
                {[0, 5, 12, 18].map(r => <option key={r} value={r}>{r === 0 ? 'Exempt' : r + '%'}</option>)}
              </select>
            </div>
            <div>
              <label className="lv-label">HSN Code</label>
              <input className="lv-input" value={form.hsnCode || ''} onChange={e => setForm(p => ({ ...p, hsnCode: e.target.value }))} placeholder="e.g. 6203" />
            </div>
          </div>
        </div>
      )}

      {activeSection === 'inventory' && (
        <div className="form-section">
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div>
              <label className="lv-label">Stock Quantity</label>
              <input className="lv-input" type="number" value={form.stock || ''} onChange={e => setForm(p => ({ ...p, stock: Number(e.target.value) }))} />
            </div>
            <div>
              <label className="lv-label">Low Stock Threshold</label>
              <input className="lv-input" type="number" value={form.lowStockThreshold || 5} onChange={e => setForm(p => ({ ...p, lowStockThreshold: Number(e.target.value) }))} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="lv-label">Status</label>
            <select className="lv-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      )}

      {activeSection === 'shipping' && (
        <div className="form-section">
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>Configure weight and dimensions for shipping rate calculation.</p>
          <div className="grid-3" style={{ marginBottom: 16 }}>
            {['Length (cm)', 'Width (cm)', 'Height (cm)'].map(d => (
              <div key={d}>
                <label className="lv-label">{d}</label>
                <input className="lv-input" type="number" placeholder="0" />
              </div>
            ))}
          </div>
          <div>
            <label className="lv-label">Weight (grams)</label>
            <input className="lv-input" type="number" placeholder="0" style={{ maxWidth: 200 }} />
          </div>
        </div>
      )}

      <div style={{ paddingTop: 20, display: 'flex', gap: 12 }}>
        <button className="lv-btn lv-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>Save as Draft</button>
        <button className="lv-btn lv-btn-gold" style={{ flex: 2, justifyContent: 'center' }} onClick={handleSave}>
          {product ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </div>
  );
}
