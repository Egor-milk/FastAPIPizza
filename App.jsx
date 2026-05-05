import React, { useState, useEffect } from 'react';
import {
  fetchOrders,
  createOrder,
  fetchMenuItems,
  createMenuItem,
  fetchKDS,
  fetchCustomers,
  createCustomer,
  fetchOrder,
} from './api.js';

export default function App() {
  const [orders, setOrders] = useState([]);
  const [phone, setPhone] = useState('');
  const [items, setItems] = useState([]);
  const [selectedMenuId, setSelectedMenuId] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);

  const [menu, setMenu] = useState([]);

  const [kds, setKds] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuPrice, setNewMenuPrice] = useState('0');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [currentTab, setCurrentTab] = useState('create');

  useEffect(() => {
    fetchOrders().then(setOrders).catch(() => {});
    fetchMenuItems().then(setMenu).catch(()=>{});
    fetchKDS().then(setKds).catch(()=>{});
  }, []);

  const handleAddItem = () => {
    const id = parseInt(selectedMenuId, 10);
    const qty = parseInt(selectedQty, 10) || 1;
    if (!id) return;
    setItems([...items, { menu_item_id: id, quantity: qty }]);
    setSelectedMenuId('');
    setSelectedQty(1);
  };

  const handleCreate = () => {
    if (items.length === 0) {
      alert('Add at least one item');
      return;
    }
    createOrder({ customer_phone: phone, items })
      .then((o) => {
        const enriched = { ...o, phone };
        setOrders((prev) => [enriched, ...prev]);
        // add to KDS if active
        if (enriched.status && ['new','preparing'].includes(enriched.status)) {
          setKds((prev) => [enriched, ...prev.filter(k => k.id !== enriched.id)]);
        }
        setPhone('');
        setItems([]);
      })
      .catch((err) => console.error(err));
  };



  const loadCustomers = () => fetchCustomers().then(setCustomers).catch(console.error);

  // auto-load customers when customers tab is opened (lazy load)
  React.useEffect(() => {
    if (currentTab === 'customers' && customers.length === 0) {
      loadCustomers();
    }
  }, [currentTab]);

  const handleCreateMenu = () => {
    const price = parseFloat(newMenuPrice) || 0;
    createMenuItem({ name: newMenuName, price })
      .then((m) => {
        setMenu([m, ...menu]);
        setNewMenuName('');
        setNewMenuPrice('0');
      })
      .catch(console.error);
  };

  const handleCreateCustomer = () => {
    createCustomer({ name: newCustomerName, phone: newCustomerPhone })
      .then((c) => {
        setCustomers([c, ...customers]);
        setNewCustomerName('');
        setNewCustomerPhone('');
      })
      .catch(console.error);
  };

  const closeModal = () => { setModalOpen(false); setSelectedOrderDetails(null); };

  const showOrderDetails = (id) => {
    const oid = Number(id);
    // fetch itemized order rows (backend returns list of items for order)
    fetchOrder(oid)
      .then((itemsData) => {
        // also fetch orders list to get metadata (status, total, customer)
        fetchOrders()
          .then((ordersList) => {
            const meta = ordersList.find(o => Number(o.id) === oid) || {};
            setSelectedOrderDetails({
              id: oid,
              status: meta.status || 'unknown',
              total: meta.total ?? null,
              customer_phone: meta.phone || meta.customer_phone || (meta.customer ? meta.customer.phone : null) || null,
              items: Array.isArray(itemsData) ? itemsData : [],
            });
            setModalOpen(true);
          })
          .catch((err) => {
            // still show items if metadata fetch fails
            setSelectedOrderDetails({ id: oid, items: Array.isArray(itemsData) ? itemsData : [] });
            setModalOpen(true);
          });
      })
      .catch((e) => {
        console.error(e);
        alert('Failed to load order details');
      });
  };

  return (
    <div className="container">
      <h1>Simple Pizza POS</h1>

      <div className="tabs" style={{marginBottom:12}}>
        <button onClick={()=>setCurrentTab('create')} className={currentTab==='create' ? 'tab-active' : ''}>Create Order</button>
        <button onClick={()=>setCurrentTab('orders')} className={currentTab==='orders' ? 'tab-active' : ''}>Orders</button>
        <button onClick={()=>setCurrentTab('menu')} className={currentTab==='menu' ? 'tab-active' : ''}>Menu</button>
        <button onClick={()=>setCurrentTab('customers')} className={currentTab==='customers' ? 'tab-active' : ''}>Customers</button>
      </div>

      {currentTab === 'create' && (
        <div className="section">
          <h3>New order</h3>
          <input
            placeholder="customer phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div style={{marginTop:8}}>
            <select value={selectedMenuId} onChange={(e)=>setSelectedMenuId(e.target.value)}>
              <option value="">-- select item --</option>
              {menu.map(m => <option key={m.id} value={m.id}>{m.name} — {m.price}</option>)}
            </select>
            <input type="number" min="1" value={selectedQty} style={{width:60}} onChange={(e)=>setSelectedQty(e.target.value)} />
            <button onClick={handleAddItem}>Add item</button>
          </div>
          <div style={{marginTop:8}}>
            <strong>Items:</strong>
            <ul>
              {items.map((it, idx) => {
                const m = menu.find(x=>x.id===it.menu_item_id) || {};
                return <li key={idx}>{m.name||it.menu_item_id} x {it.quantity}</li>;
              })}
            </ul>
          </div>
          <button onClick={handleCreate}>Create order</button>
        </div>
      )}

      {currentTab === 'orders' && (
        <>
          <div className="section">
            <h3>KDS (active orders)</h3>
            <ul>
              {kds.map(o => (
                <li key={o.id}>
                  #{o.id} status:{o.status} total:{o.total}
                  {(o.phone || o.customer_phone || (o.customer && o.customer.phone)) && <span style={{marginLeft:8}}>phone: {o.phone || o.customer_phone || (o.customer && o.customer.phone)}</span>}
                  <button style={{marginLeft:8}} onClick={()=>showOrderDetails(o.id)}>Details</button>
                </li>
              ))}
            </ul>
          </div>
          <ul>
            {orders
              .filter(o => !kds.some(k => k.id === o.id))
              .map((o) => (
                <li key={o.id}>
                  #{o.id} status:{o.status} total:{o.total}
                  {(o.phone || o.customer_phone || (o.customer && o.customer.phone)) && <span style={{marginLeft:8}}>phone: {o.phone || o.customer_phone || (o.customer && o.customer.phone)}</span>}
                  <button style={{marginLeft:8}} onClick={()=>showOrderDetails(o.id)}>Details</button>
                </li>
              ))}
          </ul>
        </>
      )}

      {currentTab === 'menu' && (
        <div className="section">
          <h3>Menu</h3>
          <div>
            <input placeholder="name" value={newMenuName} onChange={(e)=>setNewMenuName(e.target.value)} />
            <input placeholder="price" value={newMenuPrice} onChange={(e)=>setNewMenuPrice(e.target.value)} />
            <button onClick={handleCreateMenu}>Create menu item</button>
          </div>
          <ul>
            {menu.map(m => <li key={m.id}>{m.name} — {m.price}</li>)}
          </ul>
        </div>
      )}

      {currentTab === 'customers' && (
        <div className="section">
          <h3>Customers</h3>
          <div>
            <input placeholder="name" value={newCustomerName} onChange={(e)=>setNewCustomerName(e.target.value)} />
            <input placeholder="phone" value={newCustomerPhone} onChange={(e)=>setNewCustomerPhone(e.target.value)} />
            <button onClick={handleCreateCustomer}>Create customer</button>
          </div>
          <ul>
            {customers.map(c => <li key={c.id}>{c.name} — {c.phone} (pts:{c.points})</li>)}
          </ul>
        </div>
      )}

      {modalOpen && selectedOrderDetails && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e)=>e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>
            <h3>Order #{selectedOrderDetails.id} details</h3>
            <div>Status: {selectedOrderDetails.status}</div>
            <div>Total: {selectedOrderDetails.total}</div>
            <div>Customer phone: {selectedOrderDetails.customer_phone}</div>
            <div>
              Items:
              <ul>
                {(selectedOrderDetails.items||[]).map((it, idx)=> (
                  <li key={idx}>{it.name || it.menu_item_id} x {it.quantity} {it.price ? ` — ${it.price}` : ''}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
