import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ItemDetails from './pages/ItemDetails';
import AddItem from './pages/AddItem';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import LostFound from './pages/LostFound';
import LostFoundPost from './pages/LostFoundPost';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/items/:id" element={<ItemDetails />} />
            <Route path="/sell" element={
              <ProtectedRoute>
                <AddItem />
              </ProtectedRoute>
            } />
            <Route path="/lost-found" element={<LostFound />} />
            <Route path="/lost-found/new" element={
              <ProtectedRoute>
                <LostFoundPost />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
