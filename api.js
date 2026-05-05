// api.js — wrappers for backend endpoints
// Uses absolute backend origin; change API_BASE if backend runs on another port.
const API_BASE = 'http://localhost:8000';

async function checkJson(res, errMsg) {
  if (!res.ok) {
    const txt = await res.text().catch(()=>null);
    throw new Error(txt || errMsg);
  }
  return res.json();
}

export async function fetchOrders() {
  const res = await fetch(`${API_BASE}/orders`);
  return checkJson(res, 'Failed to fetch orders');
}

export async function createOrder(payload) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return checkJson(res, 'Failed to create order');
}

export async function fetchMenuItems() {
  const res = await fetch(`${API_BASE}/menu_items`);
  return checkJson(res, 'Failed to fetch menu items');
}

export async function createMenuItem(payload) {
  const res = await fetch(`${API_BASE}/menu_items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return checkJson(res, 'Failed to create menu item');
}

export async function fetchInventory() {
  const res = await fetch(`${API_BASE}/inventory`);
  return checkJson(res, 'Failed to fetch inventory');
}

export async function fetchKDS() {
  const res = await fetch(`${API_BASE}/kds`);
  return checkJson(res, 'Failed to fetch KDS');
}

export async function fetchCustomers() {
  const res = await fetch(`${API_BASE}/crm/customers`);
  return checkJson(res, 'Failed to fetch customers');
}

export async function createCustomer(payload) {
  const res = await fetch(`${API_BASE}/crm/customers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return checkJson(res, 'Failed to create customer');
}

export async function fetchOrder(id) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}`);
  return checkJson(res, 'Failed to fetch order');
}

export async function getDeliveryETA(distance_km = 5) {
  const res = await fetch(`${API_BASE}/delivery/eta?distance_km=${encodeURIComponent(distance_km)}`);
  return checkJson(res, 'Failed to get delivery ETA');
}
