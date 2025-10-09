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

        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Error al registrarse");

            setSuccess("Usuario registrado con éxito. Ya puedes iniciar sesión.");
            setUsername("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            setTimeout(onRegistered, 1500); // cambia a login después de 1.5s
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Crear cuenta</h2>
            <form onSubmit={handleRegister}>
                <input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
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
                />
                <input
                    type="password"
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                {error && <p className="error">{error}</p>}
                {success && <p className="form-success">{success}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Registrando..." : "Crear cuenta"}
                </button>
            </form>
            <p style={{ marginTop: "1rem" }}>
                ¿Ya tienes cuenta?{" "}
                <button
                    onClick={onRegistered}
                    style={{
                        color: "#4f46e5",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                    }}
                >
                    Iniciar sesión
                </button>
            </p>
        </div>
    );
}

export default RegisterForm;

