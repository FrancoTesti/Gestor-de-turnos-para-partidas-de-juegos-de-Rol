import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ItemsPage from './components/objetos/ItemsPage';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UsersPage from './pages/UsersPage';
import ModulePage from './pages/ModulePage';
import ProfilesPage from './pages/ProfilesPage';
import NotFoundPage from './pages/NotFoundPage';
import ClassesPage from './pages/ClassesPage';     // clases: Alejandro Ciesco
import CharactersPage from './pages/CharactersPage'; // personajes: Alejandro Ciesco
import ShopsPage from './pages/ShopsPage';   // tiendas: Octavio Gudiño
import SessionsPage from './pages/SessionsPage';
import MissionsPage from './pages/MissionsPage';

import './App.css';

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/objects" element={<ItemsPage />} />

              {/* Clases — Alejandro Ciesco */}
              <Route path="/classes" element={<ClassesPage />} />

              {/* Tiendas — Octavio Gudiño */}
              <Route path="/stores" element={<ShopsPage />} />

              {/* Partidas y sesiones usan el flujo unificado de ModulePage. */}
              <Route path="/games" element={<ModulePage key="partidas" resource="partidas" />} />
              <Route path="/partidas" element={<Navigate to="/games" replace />} />

              {/* Personajes — Alejandro Ciesco */}
              <Route path="/characters" element={<CharactersPage />} />

              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/missions" element={<MissionsPage />} />
              <Route path="/inventory" element={<ModulePage key="inventarios" resource="inventarios" />} />
              <Route path="/profiles" element={<ProfilesPage />} />
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  );
}
