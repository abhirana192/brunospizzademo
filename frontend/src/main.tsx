import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { CartProvider } from "./context/CartContext";
import { OrderTypeProvider } from "./context/OrderTypeContext";
import { ToastProvider } from "./context/ToastContext";
import { MenuDataProvider } from "./context/MenuDataContext";
import { AuthProvider } from "./context/AuthContext";
import { CustomerAuthProvider } from "./context/CustomerAuthContext";
import { SmoothScrollProvider } from "./components/SmoothScrollProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <CustomerAuthProvider>
              <MenuDataProvider>
                <OrderTypeProvider>
                  <CartProvider>
                    <SmoothScrollProvider>
                      <App />
                    </SmoothScrollProvider>
                  </CartProvider>
                </OrderTypeProvider>
              </MenuDataProvider>
            </CustomerAuthProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
