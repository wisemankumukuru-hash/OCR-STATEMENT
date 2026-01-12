
import React, { useState } from 'react';
import { Transaction } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
  onExport: () => void;
  onUpdateTransaction: (index: number, updated: Transaction) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onExport, onUpdateTransaction }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Transaction | null>(null);

  if (transactions.length === 0) return null;

  const handleEditClick = (index: number, transaction: Transaction) => {
    setEditingIndex(index);
    setEditValues({ ...transaction });
  };

  const handleSave = (index: number) => {
    if (editValues) {
      onUpdateTransaction(index, editValues);
      setEditingIndex(null);
      setEditValues(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditValues(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editValues) return;
    const { name, value } = e.target;
    setEditValues({
      ...editValues,
      [name]: name === 'amount' ? (isNaN(parseFloat(value)) ? value : parseFloat(value)) : value
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Extracted Transactions</h3>
          <p className="text-sm text-slate-500">{transactions.length} items found. Click edit to correct data.</p>
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all shadow-sm active:scale-95"
        >
          <i className="fa-solid fa-file-csv"></i>
          Export to CSV
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-3 border-b">Date</th>
              <th className="px-6 py-3 border-b">Description</th>
              <th className="px-6 py-3 border-b text-right">Amount</th>
              <th className="px-6 py-3 border-b">Notes</th>
              <th className="px-6 py-3 border-b text-center w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((t, idx) => {
              const isEditing = editingIndex === idx;
              return (
                <tr key={idx} className={`transition-colors ${isEditing ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                    {isEditing ? (
                      <input
                        name="date"
                        value={editValues?.date}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    ) : t.date}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-900 max-w-md truncate">
                    {isEditing ? (
                      <input
                        name="description"
                        value={editValues?.description}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    ) : (
                      <span title={t.description}>{t.description}</span>
                    )}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-bold ${typeof t.amount === 'number' && t.amount < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {isEditing ? (
                      <input
                        name="amount"
                        type="number"
                        step="0.01"
                        value={editValues?.amount}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-right"
                      />
                    ) : (
                      typeof t.amount === 'number' ? t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) : t.amount
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500 italic">
                    {isEditing ? (
                      <input
                        name="notes"
                        value={editValues?.notes}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    ) : (
                      t.notes || '-'
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                    {isEditing ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleSave(idx)}
                          className="text-emerald-600 hover:text-emerald-700 p-1"
                          title="Save Changes"
                        >
                          <i className="fa-solid fa-check"></i>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-rose-500 hover:text-rose-600 p-1"
                          title="Cancel"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(idx, t)}
                        className="text-slate-400 hover:text-blue-600 p-1 transition-colors"
                        title="Edit Row"
                      >
                        <i className="fa-solid fa-pen-to-square"></i>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
