import { Divider } from "@mui/material";
import styles from "./navigationMenu.module.css";

const NavigationMenu = () => {
    const isTabActive = (tabName: string) => {
        const linkParts = window.location.pathname.split('/');
        return linkParts.includes(tabName)
    }

  return (
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
  );
};
export default NavigationMenu;
