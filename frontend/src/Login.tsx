import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function Login() {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!username.trim()) return;
        sessionStorage.setItem('username', username);

        navigate('/chat');
    }
  return (

      <form onSubmit={handleSubmit}>
          <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Skriv ditt namn..."
          />
          <button type="submit">Gå till chatten</button></form>
  );
}

export default Login;