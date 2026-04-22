import React, { useState, useEffect } from 'react';
import { fetchOrders, createOrder } from './api.js';

export default function App() {
  const [orders, setOrders] = useState([]);
  const [phone, setPhone] = useState('');
  const [items, setItems] = useState([{ menu_item_id: 1, quantity: 1 }]);

  useEffect(() => {
    fetchOrders().then(setOrders).catch(() => {});
  }, []);

  const handleCreate = () => {
    createOrder({ customer_phone: phone, items })
      .then((o) => {
        setOrders([o, ...orders]);
        setPhone('');
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="container">
      <h1>Simple Pizza POS</h1>

      <div className="new-order">
        <h3>New order</h3>
        <input
          placeholder="customer phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <button onClick={handleCreate}>Create order</button>
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
