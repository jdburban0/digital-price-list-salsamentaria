import { useState } from "react";
import { saveToken } from "../utils/auth";
import RegisterForm from "./RegisterForm";
import { useNavigate } from "react-router-dom";

function LoginForm({ API_URL, onLoginSuccess }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("password", password);

            const res = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData.toString(),
            });

            if (!res.ok) {
                throw new Error("❌ Credenciales incorrectas");
            }

            const data = await res.json();
            saveToken(data.access_token);
            onLoginSuccess();

            setTimeout(() => {
                navigate("/admin");
            }, 1000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (showRegister) {
        return (
            <RegisterForm
                API_URL={API_URL}
                onRegistered={() => setShowRegister(false)}
            />
        );
    }

    return (
        <div className="login-container">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div
                    style={{
                        fontSize: '3rem',
                        marginBottom: '1rem',
                    }}
                >
                    🔐
                </div>
                <h2>Iniciar sesión</h2>
                <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
                    Panel de Administración
                </p>
            </div>

            <form onSubmit={handleLogin}>
                <div>
                    <input
                        type="text"
                        placeholder="👤 Usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="🔑 Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />
                </div>

                {error && <div className="error">{error}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? "⏳ Entrando..." : "🚀 Ingresar"}
                </button>
            </form>

            <div className="login-footer">
                <p>
                    ¿No tienes cuenta?{" "}
                    <button onClick={() => setShowRegister(true)}>
                        Crear una aquí
                    </button>
                </p>
            </div>
        </div>
    );
}

export default LoginForm;