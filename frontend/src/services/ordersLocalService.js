'use client';

// A lightweight front-only orders store backed by localStorage

const STORAGE_KEY = 'app-orders';

function readAll() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read orders from storage', err);
    return [];
  }
}

function writeAll(orders) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.error('Failed to write orders to storage', err);
  }
}

function generateOrderId(existing) {
  // Create an incrementing human-friendly id like #6001
  const numericIds = existing
    .map((o) => (typeof o.id === 'string' ? o.id.replace('#', '') : `${o.id}`))
    .map((s) => parseInt(s, 10))
    .filter((n) => !Number.isNaN(n));
  const next = (numericIds.length ? Math.max(...numericIds) + 1 : 6001);
  return `#${next}`;
}

export function addOrder(orderInput) {
  const orders = readAll();
  const id = orderInput.id || generateOrderId(orders);
  const createdAt = new Date();

  const newOrder = {
    id,
    date: createdAt.toISOString(),
    time: createdAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    status: 'pending',
    ...orderInput,
  };

  orders.unshift(newOrder);
  writeAll(orders);
  return newOrder;
}

export function getOrders() {
  return readAll();
}

export function getOrderById(id) {
  const orders = readAll();
  const targetId = id.startsWith('#') ? id : `#${id}`;
  return orders.find((o) => o.id === targetId) || null;
}

export function clearOrders() {
  writeAll([]);
}


