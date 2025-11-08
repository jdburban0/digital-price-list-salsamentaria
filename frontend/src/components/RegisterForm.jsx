import { useState } from "react";

function RegisterForm({ API_URL, onRegistered }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [inviteCode, setInviteCode] = useState(""); // ← NUEVO
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden");
            return;
        }

        if (password.length < 4) {
            setError("La contraseña debe tener al menos 4 caracteres");
            return;
        }

        if (!email.trim()) {
            setError("El correo electrónico es obligatorio");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    invite_code: inviteCode
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Error al registrarse");

            setSuccess("Usuario registrado con éxito. Redirigiendo...");
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
                <input
                    type="text"
                    placeholder="Código de invitación"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                    autoComplete="off"
                />
                <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                />
                <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={4}
                />
                <input
                    type="password"
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={4}
                />

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
        </div>
    );
}

export default RegisterForm;

