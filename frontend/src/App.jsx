import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', birthdate: '', salary: ''
  });

  // editTarget holds the employee being edited (null = not editing)
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: '', last_name: '', email: '', birthdate: '', salary: ''
  });

  const load = async () => {
    const res = await api.get('/employees');
    setEmployees(res.data);
  };

  useEffect(() => { load(); }, []);

  // --- Add form handlers ---
  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    await api.post('/employees', {
      ...form,
      salary: form.salary === '' ? null : Number(form.salary)
    });
    setForm({ first_name: '', last_name: '', email: '', birthdate: '', salary: '' });
    await load();
  };

  // --- Edit handlers ---
  const handleEditClick = (emp) => {
    setEditTarget(emp.employee_id);
    setEditForm({
      first_name: emp.first_name || '',
      last_name:  emp.last_name  || '',
      email:      emp.email      || '',
      birthdate:  emp.birthdate  ? emp.birthdate.slice(0, 10) : '',
      salary:     emp.salary     != null ? emp.salary : ''
    });
  };

  const onEditChange = (e) =>
    setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleEditSave = async (id) => {
    await api.put(`/employees/${id}`, {
      ...editForm,
      salary: editForm.salary === '' ? null : Number(editForm.salary)
    });
    setEditTarget(null);
    await load();
  };

  const handleEditCancel = () => setEditTarget(null);

  // --- Delete handler ---
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    await api.delete(`/employees/${id}`);
    await load();
  };

  return (
    <div style={{ margin: 20 }}>
      <h1>Employees</h1>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th><th>First</th><th>Last</th>
            <th>Email</th><th>Birthdate</th><th>Salary</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            editTarget === emp.employee_id ? (
              // Inline edit row
              <tr key={emp.employee_id}>
                <td>{emp.employee_id}</td>
                <td><input name="first_name" value={editForm.first_name} onChange={onEditChange} /></td>
                <td><input name="last_name"  value={editForm.last_name}  onChange={onEditChange} /></td>
                <td><input name="email"      value={editForm.email}      onChange={onEditChange} /></td>
                <td><input name="birthdate"  type="date" value={editForm.birthdate} onChange={onEditChange} /></td>
                <td><input name="salary"     type="number" step="0.01" value={editForm.salary} onChange={onEditChange} /></td>
                <td>
                  <button onClick={() => handleEditSave(emp.employee_id)}>Save</button>
                  {' '}
                  <button onClick={handleEditCancel}>Cancel</button>
                </td>
              </tr>
            ) : (
              // Normal read row
              <tr key={emp.employee_id}>
                <td>{emp.employee_id}</td>
                <td>{emp.first_name || '-'}</td>
                <td>{emp.last_name  || '-'}</td>
                <td>{emp.email      || '-'}</td>
                <td>{emp.birthdate  ? new Date(emp.birthdate).toLocaleDateString() : '-'}</td>
                <td>{emp.salary     != null ? Number(emp.salary).toFixed(2) : '-'}</td>
                <td>
                  <button onClick={() => handleEditClick(emp)}>Edit</button>
                  {' '}
                  <button onClick={() => handleDelete(emp.employee_id)}
                          style={{ color: 'red' }}>Delete</button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>

      <hr />

      <h2>Add Employee</h2>
      <form onSubmit={onSubmit} style={{ marginBottom: 20 }}>
        <input name="first_name" value={form.first_name} onChange={onChange} placeholder="First name" />
        <input name="last_name"  value={form.last_name}  onChange={onChange} placeholder="Last name" />
        <input name="email"      value={form.email}      onChange={onChange} placeholder="Email" />
        <input name="birthdate"  type="date" value={form.birthdate} onChange={onChange} />
        <input name="salary"     type="number" step="0.01" value={form.salary} onChange={onChange} placeholder="Salary" />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}