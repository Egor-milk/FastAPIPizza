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

  useEffect(() => {
    fetchOrders().then(setOrders).catch(() => {});
    fetchMenuItems().then(setMenu).catch(()=>{});
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
        setOrders([o, ...orders]);
        setPhone('');
        setItems([]);
      })
      .catch((err) => console.error(err));
  };


  const loadKds = () => fetchKDS().then(setKds).catch(console.error);
  const loadCustomers = () => fetchCustomers().then(setCustomers).catch(console.error);
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
    fetchOrder(id)
      .then((data) => {
        setSelectedOrderDetails(data);
        setModalOpen(true);
      })
      .catch((e) => {
        console.error(e);
        alert('Failed to load order details');
      });
  };

  return (
    <div className="container">
      <h1>Simple Pizza POS</h1>

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



      <div className="section">
        <h3>KDS (active orders)</h3>
        <button onClick={loadKds}>Refresh KDS</button>
        <ul>
          {kds.map(o => <li key={o.id}>#{o.id} status:{o.status} total:{o.total}</li>)}
        </ul>
      </div>

      <div className="section">
        <h3>Customers</h3>
        <div>
          <input placeholder="name" value={newCustomerName} onChange={(e)=>setNewCustomerName(e.target.value)} />
          <input placeholder="phone" value={newCustomerPhone} onChange={(e)=>setNewCustomerPhone(e.target.value)} />
          <button onClick={handleCreateCustomer}>Create customer</button>
          <button onClick={loadCustomers}>Load customers</button>
        </div>
        <ul>
          {customers.map(c => <li key={c.id}>{c.name} — {c.phone} (pts:{c.points})</li>)}
        </ul>
      </div>



      <h3>Orders</h3>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            #{o.id} status:{o.status} total:{o.total}
            <button style={{marginLeft:8}} onClick={()=>showOrderDetails(o.id)}>Details</button>
          </li>
        ))}
      </ul>

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
