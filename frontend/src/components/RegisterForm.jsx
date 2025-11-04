import { useState } from "react";

function RegisterForm({ API_URL, onRegistered }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        // Validar coincidencia de contraseñas
        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        // Validar longitud de contraseña
        if (password.length < 4) {
            setError("La contraseña debe tener al menos 4 caracteres");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Error al registrarse");

            setSuccess("Usuario registrado con éxito. Redirigiendo...");
            setUsername("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setTimeout(onRegistered, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h2>Crear cuenta</h2>
                <p style={{ color: 'var(--gray-600)', marginTop: '0.5rem' }}>
                    Únete al panel de administración
                </p>
            </div>

            <form onSubmit={handleRegister}>
                <div>
                    <input
                        type="text"
                        placeholder="Nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                        minLength={3}
                    />
                </div>
                <div>
                    <input
                        type="email"
                        placeholder="Correo electrónico (opcional)"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        minLength={4}
                    />
                </div>
                <div>
                    <input
                        type="password"
                        placeholder="Repite la contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        minLength={4}
                    />
                </div>

                {error && <div className="error">{error}</div>}
                {success && <div className="success">{success}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? "Registrando..." : "Crear cuenta"}
                </button>
            </form>

            <div className="login-footer">
                <p>
                    ¿Ya tienes cuenta?{" "}
                    <button onClick={onRegistered}>Iniciar sesión aquí</button>
                </p>
            </div>

            <div style={{
                marginTop: '2rem',
                padding: '1rem',
                background: 'var(--gray-100)',
                borderRadius: 'var(--radius-md)',
                border: '2px solid var(--gray-300)',
                fontSize: '0.8125rem',
                color: 'var(--gray-600)'
            }}>
                <p style={{ margin: 0 }}>
                    Tu información está segura. Las contraseñas son encriptadas.
                </p>
            </div>
        </div>
    );
}

export default RegisterForm;

