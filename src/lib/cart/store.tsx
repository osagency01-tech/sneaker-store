"use client";

import {
  createContext, useContext, useEffect, useMemo, useReducer, useCallback,
} from "react";
import type { CartLine, CartState } from "./types";

const KEY = "vantom.cart.v1";

type Action =
  | { type: "hydrate"; state: CartState }
  | { type: "add"; line: CartLine }
  | { type: "setQty"; variantId: string; quantity: number }
  | { type: "remove"; variantId: string }
  | { type: "clear" };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "add": {
      const existing = state.lines.find((l) => l.variantId === action.line.variantId);
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            l.variantId === action.line.variantId
              ? { ...l, quantity: Math.min(20, l.quantity + action.line.quantity) }
              : l
          ),
        };
      }
      return { lines: [...state.lines, action.line] };
    }
    case "setQty":
      return {
        lines: state.lines
          .map((l) =>
            l.variantId === action.variantId
              ? { ...l, quantity: Math.max(0, Math.min(20, action.quantity)) }
              : l
          )
          .filter((l) => l.quantity > 0),
      };
    case "remove":
      return { lines: state.lines.filter((l) => l.variantId !== action.variantId) };
    case "clear":
      return { lines: [] };
  }
}

type CartCtx = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (line: CartLine) => void;
  setQty: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { lines: [] });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) dispatch({ type: "hydrate", state: JSON.parse(raw) });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const add = useCallback((line: CartLine) => dispatch({ type: "add", line }), []);
  const setQty = useCallback(
    (variantId: string, quantity: number) => dispatch({ type: "setQty", variantId, quantity }),
    []
  );
  const remove = useCallback((variantId: string) => dispatch({ type: "remove", variantId }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);

  const value = useMemo<CartCtx>(() => {
    const count = state.lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = state.lines.reduce((s, l) => s + l.price * l.quantity, 0);
    return { lines: state.lines, count, subtotal, add, setQty, remove, clear };
  }, [state, add, setQty, remove, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart doit être utilisé dans <CartProvider>");
  return ctx;
}
