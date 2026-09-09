import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Sell from "./pages/Sell";

function Placeholder({ title }) {
  return (
    <main className="placeholder-page">
      <div className="placeholder-content">
        <p>MADE IN MY INDIA</p>

        <h1>{title}</h1>

        <span>This section is coming next.</span>
      </div>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/shop" replace />}
        />

        <Route
          path="/shop"
          element={<Shop />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/sell"
          element={<Sell />}
        />

        <Route
          path="/cart"
          element={<Placeholder title="Your Cart" />}
        />

        <Route
          path="/login"
          element={<Placeholder title="Welcome Back" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;