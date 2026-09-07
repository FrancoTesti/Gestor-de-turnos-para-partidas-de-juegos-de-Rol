import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ObjetosPage from './components/objetos/ObjetosPage';
import { UserProvider } from './context/UserContext';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UsersPage from './pages/UsersPage';
import ModulePage from './pages/ModulePage';
import ProfilesPage from './pages/ProfilesPage';
import './App.css';

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/objects" element={<ObjetosPage />} />
            <Route path="/classes" element={<ModulePage key="clases" resource="clases" />} />
            <Route path="/stores" element={<ModulePage key="tiendas" resource="tiendas" />} />
            <Route path="/games" element={<ModulePage key="partidas" resource="partidas" />} />
            <Route path="/characters" element={<ModulePage key="personajes" resource="personajes" />} />
            <Route path="/sessions" element={<ModulePage key="sesiones" resource="sesiones" />} />
            <Route path="/missions" element={<ModulePage key="misiones" resource="misiones" />} />
            <Route path="/inventory" element={<ModulePage key="inventarios" resource="inventarios" />} />
            <Route path="/profiles" element={<ProfilesPage />} />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
