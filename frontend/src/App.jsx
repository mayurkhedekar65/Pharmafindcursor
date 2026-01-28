import { Routes, Route } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import HomePage from './pages/HomePage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import CartPage from './pages/CartPage.jsx'
import ConfirmationPage from './pages/ConfirmationPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import UserProfilePage from './pages/UserProfilePage.jsx'
import PharmacyDashboardPage from './pages/PharmacyDashboardPage.jsx'
import PharmacyProfilePage from './pages/PharmacyProfilePage.jsx'
import PharmacyStockPage from './pages/PharmacyStockPage.jsx'

function App() {
  return (
    <div className="app-root">
      <div className="app-shell">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/pharmacy/dashboard" element={<PharmacyDashboardPage />} />
            <Route path="/pharmacy/profile" element={<PharmacyProfilePage />} />
            <Route path="/pharmacy/stock" element={<PharmacyStockPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App
