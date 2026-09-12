import { useEffect, useState } from "react";
import OwnerNavigation from "../components/OwnerNavigation";
import { apiRequest } from "../services/api";
import "./Resources.css";

function Resources() {
  const [businesses, setBusinesses] = useState([]);
  const [tenantId, setTenantId] = useState("");
  const [resources, setResources] = useState([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadResources = async (id) => {
    if (!id) return setResources([]);
    const data = await apiRequest(`/api/tenants/${id}/resources/`);
    setResources(data.results || data);
  };

  useEffect(() => {
    async function load() {
      try {
        const data = await apiRequest("/api/tenants/");
        const tenantList = data.results || data;
        setBusinesses(tenantList);
        const firstId = tenantList[0]?.id;
        if (firstId) {
          setTenantId(String(firstId));
          await loadResources(firstId);
        }
      } catch (err) {
        setError(err.message || "Failed to load resources.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const changeTenant = async (event) => {
    const id = event.target.value;
    setTenantId(id);
    setEditing(null);
    setName("");
    try {
      setError("");
      await loadResources(id);
    } catch (err) {
      setError(err.message || "Failed to load resources.");
    }
  };

  const saveResource = async (event) => {
    event.preventDefault();
    if (!name.trim() || !tenantId) return;
    try {
      setSaving(true);
      setError("");
      const saved = editing
        ? await apiRequest(`/api/resources/${editing.id}/`, { method: "PATCH", body: JSON.stringify({ name: name.trim() }) })
        : await apiRequest(`/api/tenants/${tenantId}/resources/`, { method: "POST", body: JSON.stringify({ name: name.trim() }) });
      setResources((current) => editing
        ? current.map((resource) => resource.id === editing.id ? saved : resource)
        : [...current, saved]);
      setName("");
      setEditing(null);
    } catch (err) {
      setError(err.message || "Failed to save resource.");
    } finally {
      setSaving(false);
    }
  };

  const toggleResource = async (resource) => {
    try {
      setError("");
      const saved = await apiRequest(`/api/resources/${resource.id}/`, {
        method: "PATCH", body: JSON.stringify({ is_active: !resource.is_active }),
      });
      setResources((current) => current.map((item) => item.id === resource.id ? saved : item));
    } catch (err) {
      setError(err.message || "Failed to update resource.");
    }
  };

  if (loading) return <div className="resources-page"><OwnerNavigation /><p>Loading resources…</p></div>;

  return (
    <div className="resources-page owner-page">
      <OwnerNavigation />
      <header><h1>Resources</h1><p>Physical resources are shared by every service in this business.</p></header>
      {error && <p className="resources-error">{error}</p>}
      {!businesses.length ? <div className="empty-resources"><h2>No business yet</h2><p>Create a business before adding resources.</p></div> : <>
        <label className="business-selector">Business
          <select value={tenantId} onChange={changeTenant}>{businesses.map((business) => <option key={business.id} value={business.id}>{business.business_name}</option>)}</select>
        </label>
        <form className="resource-form" onSubmit={saveResource}>
          <h2>{editing ? "Edit resource" : "Add resource"}</h2>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Pitch 1" required />
          <button disabled={saving}>{saving ? "Saving…" : editing ? "Update" : "Add resource"}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setName(""); }}>Cancel</button>}
        </form>
        {!resources.length ? <div className="empty-resources"><h2>No resources yet</h2><p>Add a pitch, room, table, or other bookable resource.</p></div> : <div className="resources-list">
          {resources.map((resource) => <article className="resource-card" key={resource.id}>
            <div><h3>{resource.name}</h3><span className={resource.is_active ? "resource-active" : "resource-inactive"}>{resource.is_active ? "Active" : "Inactive"}</span></div>
            <div className="resource-actions"><button type="button" onClick={() => { setEditing(resource); setName(resource.name); }}>Edit</button><button type="button" onClick={() => toggleResource(resource)}>{resource.is_active ? "Deactivate" : "Activate"}</button></div>
          </article>)}
        </div>}
      </>}
    </div>
  );
}

export default Resources;
