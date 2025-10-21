'use client';

import { useMemo, Suspense, useEffect, useCallback, createContext, useState } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter, useSearchParams } from 'src/routes/hooks';

import { getStorage, useLocalStorage } from 'src/hooks/use-local-storage';

import { PRODUCT_CHECKOUT_STEPS } from 'src/_mock/_product';

import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

export const CheckoutContext = createContext(undefined);

export const CheckoutConsumer = CheckoutContext.Consumer;

const STORAGE_KEY = 'app-checkout';

const initialState = {
  items: [],
  subtotal: 0,
  total: 0,
  discount: 0,
  shipping: 0,
  billing: null,
  totalItems: 0,
};

// ----------------------------------------------------------------------

export function CheckoutProvider({ children }) {
  return <Container>{children}</Container>;
}

// ----------------------------------------------------------------------

function Container({ children }) {
  const router = useRouter();

  const searchParams = useSearchParams();

  const activeStep = Number(searchParams.get('step'));

  // Extract storeId from URL if we're in a store context
  const [storeId, setStoreId] = useState(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const storeIdMatch = pathname.match(/\/stores\/([^\/]+)\/checkout/);
      setStoreId(storeIdMatch ? storeIdMatch[1] : null);
    }
  }, []);

  const { state, setState, setField, canReset, resetState } = useLocalStorage(
    STORAGE_KEY,
    initialState
  );

  const completed = activeStep === PRODUCT_CHECKOUT_STEPS.length;

  const updateTotalField = useCallback(() => {
    const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);

    const subtotal = state.items.reduce((total, item) => total + item.quantity * item.price, 0);

    setField('subtotal', subtotal);
    setField('totalItems', totalItems);
    setField('total', state.subtotal - state.discount + state.shipping);
  }, [setField, state.discount, state.items, state.shipping, state.subtotal]);

  useEffect(() => {
    const restoredValue = getStorage(STORAGE_KEY);
    if (restoredValue) {
      updateTotalField();
    }
  }, [updateTotalField]);

  const initialStep = useCallback(() => {
    if (!activeStep) {
      const href = createUrl('go', 0, storeId);
      router.push(href);
    }
  }, [activeStep, router, storeId]);

  const onBackStep = useCallback(() => {
    const href = createUrl('back', activeStep, storeId);
    router.push(href);
  }, [activeStep, router, storeId]);

  const onNextStep = useCallback(() => {
    const href = createUrl('next', activeStep, storeId);
    router.push(href);
  }, [activeStep, router, storeId]);

  const onGotoStep = useCallback(
    (step) => {
      const href = createUrl('go', step, storeId);
      router.push(href);
    },
    [router, storeId]
  );

  const onAddToCart = useCallback(
    (newItem) => {
      const updatedItems = state.items.map((item) => {
        if (item.id === newItem.id) {
          const colorsAdded = [...item.colors, ...newItem.colors];

          const colors = colorsAdded.filter((color, index) => colorsAdded.indexOf(color) === index);

          return { ...item, colors, quantity: item.quantity + 1 };
        }
        return item;
      });

      if (!updatedItems.some((item) => item.id === newItem.id)) {
        updatedItems.push(newItem);
      }

      setField('items', updatedItems);
    },
    [setField, state.items]
  );

  const onDeleteCart = useCallback(
    (itemId) => {
      const updatedItems = state.items.filter((item) => item.id !== itemId);

      setField('items', updatedItems);
    },
    [setField, state.items]
  );

  const onIncreaseQuantity = useCallback(
    (itemId) => {
      const updatedItems = state.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });

      setField('items', updatedItems);
    },
    [setField, state.items]
  );

  const onDecreaseQuantity = useCallback(
    (itemId) => {
      const updatedItems = state.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });

      setField('items', updatedItems);
    },
    [setField, state.items]
  );

  const onCreateBilling = useCallback(
    (address) => {
      setField('billing', address);
      setField('completed', true);
    },
    [setField]
  );

  const onApplyDiscount = useCallback(
    (discount) => {
      setField('discount', discount);
    },
    [setField]
  );

  const onApplyShipping = useCallback(
    (shipping) => {
      setField('shipping', shipping);
    },
    [setField]
  );

  const onUpdateVariant = useCallback(
    (itemId, updates) => {
      const updatedItems = state.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, ...updates };
        }
        return item;
      });

      setField('items', updatedItems);
    },
    [setField, state.items]
  );

  // Reset
  const onReset = useCallback(() => {
    if (completed) {
      resetState();
      // Redirect back to store if we're in store context, otherwise to product root
      const redirectPath = storeId ? `/stores/${storeId}` : paths.product.root;
      router.push(redirectPath);
    }
  }, [completed, resetState, router, storeId]);

  const memoizedValue = useMemo(
    () => ({
      ...state,
      canReset,
      onReset,
      onUpdate: setState,
      onUpdateField: setField,
      //
      completed,
      //
      onAddToCart,
      onDeleteCart,
      //
      onIncreaseQuantity,
      onDecreaseQuantity,
      //
      onCreateBilling,
      onApplyDiscount,
      onApplyShipping,
      onUpdateVariant,
      //
      activeStep,
      initialStep,
      onBackStep,
      onNextStep,
      onGotoStep,
    }),
    [
      state,
      onReset,
      canReset,
      setField,
      completed,
      setState,
      activeStep,
      onBackStep,
      onGotoStep,
      onNextStep,
      initialStep,
      onAddToCart,
      onDeleteCart,
      onApplyDiscount,
      onApplyShipping,
      onCreateBilling,
      onUpdateVariant,
      onDecreaseQuantity,
      onIncreaseQuantity,
    ]
  );

  return <CheckoutContext.Provider value={memoizedValue}>{children}</CheckoutContext.Provider>;
}

// ----------------------------------------------------------------------

function createUrl(type, activeStep, storeId = null) {
  const step = { back: activeStep - 1, next: activeStep + 1, go: activeStep }[type];

  const stepParams = new URLSearchParams({ step: `${step}` }).toString();

  // Use store-specific checkout URL if storeId is provided
  const baseUrl = storeId ? `/stores/${storeId}/checkout` : paths.product.checkout;
  
  return `${baseUrl}?${stepParams}`;
}