import React from "react";
import styles from "./startPage.module.css";
import { t } from "i18next";

function Logout() {
    const logOut = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                sessionStorage.removeItem('userID');
                window.location.href = '/login';
            } else {
                console.error("Ошибка выхода");
            }
        } catch (error) {
            console.error("Ошибка:", error);
        }
    }

    return (
        <button className={styles.authoButton} onClick={logOut}>{t(`profile.getout`)}</button>
    );
}

export default Logout;
