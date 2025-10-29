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
                throw new Error("Credenciales incorrectas");
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
        return <RegisterForm API_URL={API_URL} onRegistered={() => setShowRegister(false)} />;
    }

    return (
        <div className="login-container">
            <h2>Iniciar sesión (Admin)</h2>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? "Entrando..." : "Ingresar"}
                </button>
            </form>
            <p style={{ marginTop: "1rem" }}>
                ¿No tienes cuenta?{" "}
                <button
                    onClick={() => setShowRegister(true)}
                    style={{ color: "#4f46e5", border: "none", background: "none", cursor: "pointer" }}
                >
                    Crear una
                </button>
            </p>
        </div>
    );
}

export default LoginForm;
