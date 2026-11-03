import { useMemo, useState } from 'react';
import projectData from '../../config/projectData.js';
import storage from '../../services/storageService.js';
import Icon from '../ui/Icon.jsx';
import Modal from '../ui/Modal.jsx';
import { Badge, EmptyState } from '../ui/Primitives.jsx';

const { statuses, fields } = projectData.crm;
const statusOf = (id) => statuses.find((s) => s.id === id) || statuses[0];
const sectorOf = (id) => projectData.sectors.find((s) => s.id === id);

function ContactForm({ contact, onSaved, onClose }) {
  const [form, setForm] = useState(() => ({ status: statuses[0].id, sector: projectData.sectors[0].id, ...contact }));
  const [error, setError] = useState('');
  const set = (id) => (e) => setForm((f) => ({ ...f, [id]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const missing = fields.find((f) => f.required && !String(form[f.id] || '').trim());
    if (missing) return setError(`Le champ « ${missing.label} » est requis.`);
    await storage.upsertContact(form);
    onSaved();
    return onClose();
  };

  return (
    <form onSubmit={submit} className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.id} className={f.type === 'textarea' || f.id === 'company' ? 'sm:col-span-2' : ''}>
          <label className="label" htmlFor={`crm-${f.id}`}>{f.label}{f.required && <span className="ml-1 text-amber-400">*</span>}</label>
          {f.type === 'textarea' ? (
            <textarea id={`crm-${f.id}`} rows={3} className="input" value={form[f.id] || ''} onChange={set(f.id)} />
          ) : f.type === 'sector' ? (
            <select id={`crm-${f.id}`} className="input" value={form[f.id] || ''} onChange={set(f.id)}>
              {projectData.sectors.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          ) : f.type === 'status' ? (
            <select id={`crm-${f.id}`} className="input" value={form[f.id] || ''} onChange={set(f.id)}>
              {statuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          ) : (
            <input id={`crm-${f.id}`} type={f.type === 'email' ? 'email' : 'text'} className="input" value={form[f.id] || ''} onChange={set(f.id)} />
          )}
        </div>
      ))}
      {error && <p role="alert" className="text-sm text-red-400 sm:col-span-2">{error}</p>}
      <div className="flex justify-end gap-2 sm:col-span-2">
        <button type="button" className="btn-ghost" onClick={onClose}>Annuler</button>
        <button type="submit" className="btn-primary">Enregistrer</button>
      </div>
    </form>
  );
}

export default function CrmPanel({ contacts, onChanged }) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState(null); // null | {} (nouveau) | contact

  const counts = useMemo(() => Object.fromEntries(statuses.map((s) => [s.id, contacts.filter((c) => c.status === s.id).length])), [contacts]);
  const rows = useMemo(() => {
    const t = query.trim().toLowerCase();
    return contacts.filter((c) => (statusFilter === 'all' || c.status === statusFilter) && (!t || JSON.stringify(c).toLowerCase().includes(t)));
  }, [contacts, query, statusFilter]);

  const changeStatus = async (c, status) => { await storage.upsertContact({ ...c, status }); onChanged(); };
  const remove = async (c) => {
    if (!window.confirm(`Supprimer « ${c.company} » du CRM ?`)) return;
    await storage.deleteContact(c.id);
    onChanged();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter('all')} className={`rounded-full border px-3 py-1 text-xs font-medium ${statusFilter === 'all' ? 'border-slate-400 bg-slate-800 text-white' : 'border-slate-700 text-slate-400 hover:bg-slate-800/60'}`}>
          Tous · {contacts.length}
        </button>
        {statuses.map((s) => (
          <button key={s.id} onClick={() => setStatusFilter(s.id)} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusFilter === s.id ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/60'}`} style={{ borderColor: statusFilter === s.id ? s.color : '#334155' }}>
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.label} · {counts[s.id]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Icon name="Search" size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input className="input pl-9" placeholder="Rechercher un contact…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Rechercher" />
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary" disabled={!rows.length} onClick={() => storage.downloadFile(`crm-contacts-${storage.stamp()}.csv`, storage.contactsToCSV(rows), 'text/csv')}>
            <Icon name="FileSpreadsheet" size={16} /> Export CSV
          </button>
          <button className="btn-primary" onClick={() => setEditing({})}><Icon name="Plus" size={16} /> Nouveau contact</button>
        </div>
      </div>

      {!rows.length ? (
        <EmptyState icon="Users" title="Aucun contact">Ajoutez un contact ou modifiez le filtre. Les contacts de départ se configurent dans `crm.seedContacts`.</EmptyState>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="th">Organisation</th><th className="th">Contact</th><th className="th">Secteur</th>
                <th className="th">Statut</th><th className="th">Prochaine action</th><th className="th" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {rows.map((c) => {
                const st = statusOf(c.status);
                const sec = sectorOf(c.sector);
                return (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="td font-medium text-slate-100">{c.company}{c.source && <span className="block text-xs font-normal text-slate-500">{c.source}</span>}</td>
                    <td className="td">
                      {c.name || '—'}{c.role && <span className="block text-xs text-slate-500">{c.role}</span>}
                      {c.email && <a href={`mailto:${c.email}`} className="block text-xs text-amber-400 hover:underline">{c.email}</a>}
                    </td>
                    <td className="td"><Badge style={{ color: sec?.color, borderColor: `${sec?.color}55` }}>{sec?.short || '—'}</Badge></td>
                    <td className="td">
                      <select aria-label="Statut" className="rounded-md border bg-slate-950 px-2 py-1 text-xs font-medium" style={{ color: st.color, borderColor: `${st.color}66` }} value={c.status} onChange={(e) => changeStatus(c, e.target.value)}>
                        {statuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="td">{c.nextAction || '—'}</td>
                    <td className="td whitespace-nowrap text-right">
                      <button className="btn-ghost px-2" onClick={() => setEditing(c)} aria-label="Modifier"><Icon name="Pencil" size={15} /></button>
                      <button className="btn-ghost px-2 hover:text-red-300" onClick={() => remove(c)} aria-label="Supprimer"><Icon name="Trash2" size={15} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? 'Modifier le contact' : 'Nouveau contact'} onClose={() => setEditing(null)} wide>
          <ContactForm contact={editing} onSaved={onChanged} onClose={() => setEditing(null)} />
        </Modal>
      )}
    </div>
  );
}

