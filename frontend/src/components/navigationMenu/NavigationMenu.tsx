import { Divider } from "@mui/material";
import styles from "./navigationMenu.module.css";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useState } from "react";
import Logout from "../profille/Logout";

const NavigationMenu = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  const isTabActive = (tabName: string) => {
    const linkParts = window.location.pathname.split('/');
    console.log(linkParts)
    return linkParts.includes(tabName)
  }

  return (
    <div style={{ display: "flex", padding: "20px" }}>
      <div className={styles.startForm}>
        <div className={styles.tabsWrapper}>
          <div className={styles.tabs}>
            <a
              href="/tables"
              className={
                styles.tab + " " + (isTabActive("table") && styles.active)
              }
            >
              Таблицы
            </a>
            <a
              href="/analyse"
              className={
                styles.tab + " " + (isTabActive("analyse") && styles.active)
              }
            >
              Анализ
            </a>
          </div>
          <Divider></Divider>
        </div>
      </div>
      <div className={styles.avatar} onClick={toggleMenu}>
        <AccountCircleOutlinedIcon fontSize="large" />
        {menuOpen && (
          <div className={styles.dropdownMenu}>
            <div className={styles.menuItem}>
              <Logout />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default NavigationMenu;
