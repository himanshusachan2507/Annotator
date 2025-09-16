import React, { useEffect, useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const res = await API.get('/pdfs');
      setFiles(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(()=>{ load(); }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Select a file');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await API.post('/pdfs/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' }});
      alert('Uploaded: ' + res.data.originalName);
      setFile(null);
      load();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  const openFile = (uuid) => { navigate('/viewer/' + uuid); };
  const delFile = async (uuid) => {
    if (!confirm('Delete this file?')) return;
    try {
      await API.delete('/pdfs/' + uuid);
      load();
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h2>My Library</h2>
        <div>
          <button className="btn" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="controls">
        <form onSubmit={upload}>
          <input type="file" accept="application/pdf" onChange={e=>setFile(e.target.files[0])} />
          <button className="btn" style={{marginLeft:8}}>Upload</button>
        </form>
      </div>

      <ul className="file-list">
        {files.map(f => (
          <li key={f.uuid}>
            <div>{f.originalName} <small>({new Date(f.createdAt).toLocaleString()})</small></div>
            <div>
              <button className="btn" onClick={()=>openFile(f.uuid)}>Open</button>
              <button className="btn danger" style={{marginLeft:8}} onClick={()=>delFile(f.uuid)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
