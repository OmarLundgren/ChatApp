import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function Login() {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('user');
    const navigate = useNavigate();
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!username.trim()) return;
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('role', role);


        navigate('/chat');
    }
  return (

      <form onSubmit={handleSubmit}>
          <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Skriv ditt namn..."
          />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Välj roll...</option>
              <option value="teacher">Teacher</option>
              <option value="user">User</option>
          </select>

          <button type="submit">Gå till chatten</button></form>
  );
}

export default Login;