import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Alert, Modal, Table, Form, Loading } from '../components/ui';
import type { FormField } from '../components/ui/Form';
import type { Usuario, Jugador, Anfitrion } from '../interfaces';
import './UsersPage.css';

type ViewMode = 'list' | 'form' | 'detail';

export default function UsersPage() {
  const { usuarios, jugadores, anfitriones, registrarUsuario, mensaje, limpiarMensaje, rolDe, usuarioLogueado } =
    useUser();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    nickname: '',
    contrasena: '',
    tipo: 'jugador' as 'jugador' | 'anfitrion',
  });

  const handleNewUser = () => {
    setFormData({ nombreUsuario: '', nickname: '', contrasena: '', tipo: 'jugador' });
    setSelectedUser(null);
    setViewMode('form');
  };

  const handleEdit = (user: Usuario) => {
    // Solo jugadores y anfitriones pueden editar usuarios
    if (!usuarioLogueado || rolDe(usuarioLogueado.idUsuario) === 'usuario') {
      alert('No tienes permisos para editar usuarios');
      return;
    }
    setSelectedUser(user);
    setFormData({
      nombreUsuario: user.nombreUsuario,
      nickname: user.nickname,
      contrasena: user.contrasena,
      tipo: rolDe(user.idUsuario) === 'jugador' ? 'jugador' : 'anfitrion',
    });
    setViewMode('form');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular delay de red
    setTimeout(() => {
      if (!selectedUser) {
        registrarUsuario(
          formData.nombreUsuario,
          formData.nickname,
          formData.contrasena,
          formData.tipo
        );
      }
      // En una app real, acá iría una llamada a la API para editar
      setIsLoading(false);
      setViewMode('list');
      setTimeout(() => limpiarMensaje(), 3000);
    }, 500);
  };

  const handleDeleteClick = (user: Usuario) => {
    // Solo jugadores y anfitriones pueden eliminar usuarios
    if (!usuarioLogueado || rolDe(usuarioLogueado.idUsuario) === 'usuario') {
      alert('No tienes permisos para eliminar usuarios');
      return;
    }
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    // En una app real, acá iría una llamada a la API para eliminar
    setShowDeleteModal(false);
    setTimeout(() => {
      alert(`Usuario ${userToDelete?.nickname} sería eliminado (feature no implementada aún)`);
      setUserToDelete(null);
    }, 300);
  };

  const handleViewDetail = (user: Usuario) => {
    setSelectedUser(user);
    setViewMode('detail');
  };

  const formFields: FormField[] = [
    {
      name: 'nombreUsuario',
      label: 'Nombre y Apellido',
      type: 'text',
      required: true,
      placeholder: 'Juan Pérez',
      value: formData.nombreUsuario,
      onChange: (e) => setFormData({ ...formData, nombreUsuario: e.target.value }),
    },
    {
      name: 'nickname',
      label: 'Nickname',
      type: 'text',
      required: true,
      placeholder: 'juanperez123',
      value: formData.nickname,
      onChange: (e) => setFormData({ ...formData, nickname: e.target.value }),
    },
    {
      name: 'contrasena',
      label: 'Contraseña',
      type: 'password',
      required: true,
      placeholder: '••••••••',
      value: formData.contrasena,
      onChange: (e) => setFormData({ ...formData, contrasena: e.target.value }),
    },
    {
      name: 'tipo',
      label: 'Tipo de Cuenta',
      type: 'select',
      required: true,
      value: formData.tipo,
      onChange: (e) => setFormData({ ...formData, tipo: e.target.value as 'jugador' | 'anfitrion' }),
      options: [
        { value: 'jugador', label: 'Jugador' },
        { value: 'anfitrion', label: 'Anfitrión' },
      ],
    },
  ];

  const tableColumns = [
    { key: 'nickname' as const, label: 'Nickname' },
    { key: 'nombreUsuario' as const, label: 'Nombre Completo' },
    {
      key: 'idUsuario' as const,
      label: 'Rol',
      render: (value: unknown, item: Usuario) => (
        <span className={`badge badge-${rolDe(item.idUsuario)}`}>{rolDe(item.idUsuario)}</span>
      ),
    },
    {
      key: 'idUsuario' as const,
      label: 'Estado',
      render: () => <span className="badge badge-active">Activo</span>,
    },
  ];

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        {/* Solo Anfitriones pueden crear usuarios */}
        {usuarioLogueado && rolDe(usuarioLogueado.idUsuario) == 'anfitrion' && (
          <button className="btn btn-primary" onClick={handleNewUser}>
            + Nuevo Usuario
          </button>
        )}
      </div>

      {mensaje && (
        <Alert
          type="success"
          message={mensaje}
          onClose={limpiarMensaje}
        />
      )}

      {viewMode === 'list' && (
        <div className="list-view">
          <div className="stats">
            <div className="stat-card">
              <p className="stat-label">Total Usuarios</p>
              <p className="stat-value">{usuarios.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Jugadores</p>
              <p className="stat-value">{jugadores.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Anfitriones</p>
              <p className="stat-value">{anfitriones.length}</p>
            </div>
          </div>

          {usuarios.length === 0 ? (
            <div className="empty-state">
              <p>No hay usuarios registrados</p>
              {usuarioLogueado && rolDe(usuarioLogueado.idUsuario) !== 'usuario' && (
                <button className="btn btn-primary" onClick={handleNewUser}>
                  Crear el primer usuario
                </button>
              )}
            </div>
          ) : (
            <Table<Usuario>
              columns={tableColumns}
              data={usuarios}
              keyField="idUsuario"
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              canEdit={(user) => user.idUsuario === usuarioLogueado?.idUsuario}
              canDelete={(user) => user.idUsuario === usuarioLogueado?.idUsuario}
            />
          )}
        </div>
      )}

      {viewMode === 'form' && (
        <div className="form-view">
          <div className="form-container">
            <h2>{selectedUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
            {isLoading ? (
              <Loading message="Guardando usuario..." />
            ) : (
              <Form
                fields={formFields}
                onSubmit={handleFormSubmit}
                submitText={selectedUser ? 'Actualizar' : 'Crear Usuario'}
                onCancel={() => setViewMode('list')}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      )}

      {viewMode === 'detail' && selectedUser && (
        <div className="detail-view">
          <button
            className="btn btn-secondary btn-back"
            onClick={() => setViewMode('list')}
          >
            ← Volver
          </button>
          <div className="detail-card">
            <h2>{selectedUser.nombreUsuario}</h2>
            <div className="detail-grid">
              <div className="detail-row">
                <label>Nickname:</label>
                <span>{selectedUser.nickname}</span>
              </div>
              <div className="detail-row">
                <label>ID:</label>
                <span>{selectedUser.idUsuario}</span>
              </div>
              <div className="detail-row">
                <label>Rol:</label>
                <span className={`badge badge-${rolDe(selectedUser.idUsuario)}`}>
                  {rolDe(selectedUser.idUsuario)}
                </span>
              </div>
              <div className="detail-row">
                <label>Estado:</label>
                <span className="badge badge-active">Activo</span>
              </div>
            </div>
            <div className="detail-actions">
              <button className="btn btn-primary" onClick={() => handleEdit(selectedUser)}>
                Editar
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteClick(selectedUser)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={showDeleteModal}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar a ${userToDelete?.nickname}?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="confirm"
      />
    </div>
  );
}
