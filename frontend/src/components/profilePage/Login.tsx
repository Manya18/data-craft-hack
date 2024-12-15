import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./startPage.module.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
    const navigate = useNavigate();
    const [isRedirecting, setIsRedirecting] = useState(false); 

    const login = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const emailField = document.getElementById('email') as HTMLInputElement;
        const passwordField = document.getElementById('password') as HTMLInputElement;
        const email = emailField.value;
        const password = passwordField.value;

        const data = { email, password };

        if (event.currentTarget.checkValidity()) {
            try {
                const response = await fetch('http://localhost:8080/api/authorize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    emailField.style.border = "2px solid red";
                    passwordField.style.border = "2px solid red";
                    const err = document.getElementById("error") as HTMLDivElement;
                    err.hidden = false;

                    toast.error("Ошибка входа. Проверьте данные и попробуйте снова.");
                } else {
                    const res = await response.json();
                    sessionStorage.setItem('userID', `${res.id}`);
                    
                    setIsRedirecting(true);

                    toast.success("Вход выполнен успешно!", {
                        onClose: () => navigate('/home') 
                    });
                }
            } catch (error) {
                console.error("Ошибка авторизации:", error);
                toast.error("Произошла ошибка при авторизации. Попробуйте позже.");
            }
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
            
            {isRedirecting && <div className={styles.loader}>Перенаправление...</div>}

            <form onSubmit={login}>
                <div className={styles.info}>
                    <div>
                        <div className={styles.name}>Почта</div>
                        <input id="email" type="email" required />
                    </div>
                    <div>
                        <div className={styles.name}>Пароль</div>
                        <input id="password" type="password" required />
                    </div>
                    <div id="error" className={styles.error} hidden>Ошибка входа</div>
                </div>
                <button className="primary-button" type="submit" disabled={isRedirecting}>
                    Вход
                </button>
            </form>
        </>
    );
}

export default Login;
