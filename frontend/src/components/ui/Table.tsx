import React from 'react';
import './Table.css';

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  canEdit?: (item: T) => boolean;
  canDelete?: (item: T) => boolean;
  keyField?: keyof T;
}

export default function Table<T extends Record<string, unknown>>({
  columns,
  data,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
  keyField = 'id' as keyof T,
}: TableProps<T>) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)}>{col.label}</th>
            ))}
            {(onEdit || onDelete) && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="empty">
                No hay datos
              </td>
            </tr>
          ) : (
            data.map((item) => {
              const canEditItem = canEdit ? canEdit(item) : true;
              const canDeleteItem = canDelete ? canDelete(item) : true;

              return (
                <tr key={String(item[keyField])}>
                  {columns.map((col) => (
                    <td key={String(col.key)}>
                      {col.render ? col.render(item[col.key], item) : String(item[col.key])}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="actions">
                      {onEdit && canEditItem && (
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => onEdit(item)}
                          aria-label="Editar"
                        >
                          ✏️
                        </button>
                      )}
                      {onDelete && canDeleteItem && (
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => onDelete(item)}
                          aria-label="Eliminar"
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
