import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./startPage.module.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Auth() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [id]: value,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        const url = 'http://localhost:8080/api/registrate';
        const data = { email: formData.email, password: formData.password };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                setError(true);
                toast.error("Ошибка регистрации. Попробуйте снова");
                setLoading(false);
                return;
            }

            const res = await response.json();
            sessionStorage.setItem('userID', `${res.id}`);
            toast.success("Регистрация успешна!");

            navigate('/home');
        } catch (e) {
            console.error(e);
            setError(true);
            toast.error("Произошла ошибка. Попробуйте позже.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            {loading && <div className={styles.loader}>Перенаправление...</div>}

            <form onSubmit={handleSubmit}>
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
                <button className="primary-button" type="submit">Зарегистрироваться</button>
            </form>
        </>
    );
}

export default Auth;
