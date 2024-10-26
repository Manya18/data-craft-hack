import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./startPage.module.css";

function Registration() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, files } = event.target;
        setFormData(prev => ({
            ...prev,
            [id]: files ? files[0] : value,
        }));
    };

    const createUser = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/api/registrate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                setError(true);
            } else {
                const res = await response.json();
                sessionStorage.setItem('userID', `${res.id}`);
                navigate('/tables');
            }
        } catch (e) {
            console.error(e);
            setError(true);
        }
    };

    return (
        <form id="registration" onSubmit={createUser}>
            <div className={styles.info}>
                <div className={styles.name}>
                    Почта
                    <input id="email" type="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div className={styles.name}>
                    Пароль
                    <input id="password" type="password" value={formData.password} onChange={handleChange} minLength={4} required />
                </div>
                {error && <div className={styles.error} id="error">Ошибка регистрации</div>}
            </div>
            <button className={styles.authoButton} type="submit">Зарегистрироваться</button>
        </form>
    );
}

export default Registration;
