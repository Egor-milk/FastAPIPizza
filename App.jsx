import React, { useState, useEffect } from 'react';
import {
  fetchOrders,
  createOrder,
  fetchMenuItems,
  createMenuItem,
  fetchInventory,
  fetchKDS,
  fetchCustomers,
  createCustomer,
  getDeliveryETA,
} from './api.js';

export default function App() {
  const [orders, setOrders] = useState([]);
  const [phone, setPhone] = useState('');
  const [items, setItems] = useState([{ menu_item_id: 1, quantity: 1 }]);

  const [menu, setMenu] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [kds, setKds] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuPrice, setNewMenuPrice] = useState('0');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [eta, setEta] = useState(null);

  useEffect(() => {
    fetchOrders().then(setOrders).catch(() => {});
    fetchMenuItems().then(setMenu).catch(()=>{});
  }, []);

  const handleCreate = () => {
    createOrder({ customer_phone: phone, items })
      .then((o) => {
        setOrders([o, ...orders]);
        setPhone('');
      })
      .catch((err) => console.error(err));
  };

  const loadInventory = () => fetchInventory().then(setInventory).catch(console.error);
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

  const checkEta = () => {
    getDeliveryETA(5).then((r) => setEta(r.eta_minutes)).catch(console.error);
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
        <h3>Inventory</h3>
        <button onClick={loadInventory}>Refresh inventory</button>
        <ul>
          {inventory.map(i => <li key={i.id}>{i.name}: {i.quantity}</li>)}
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

      <div className="section">
        <h3>Delivery</h3>
        <button onClick={checkEta}>Get ETA (5 km)</button>
        {eta !== null && <div>ETA: {eta} minutes</div>}
      </div>

      <h3>Orders</h3>
      <ul>
        {orders.map((o) => (
          <li key={o.id}>
            #{o.id} status:{o.status} total:{o.total}
          </li>
        ))}
      </ul>
    </div>
  );
}
