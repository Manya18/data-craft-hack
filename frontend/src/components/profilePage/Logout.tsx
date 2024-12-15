import React from "react";
import styles from "./startPage.module.css";

function Logout() {
  const logOut = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        localStorage.removeItem("userID");
        sessionStorage.removeItem("userID");

        window.location.href = "/signin/autorizate";
      } else {
        console.error("Ошибка выхода");
      }
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  return (
    <button className={styles.logoutButton} onClick={logOut}>
      Выйти
    </button>
  );
}

export default Logout;
