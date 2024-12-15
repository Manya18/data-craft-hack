import styles from "./HeaderBar.module.css";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { useState } from "react";
import Logout from "../profilePage/Logout";

const HeaderBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className={styles.content}>
      <div className={styles.avatar} onClick={toggleMenu}>
        <AccountCircleOutlinedIcon fontSize="large" />
        {menuOpen && (
          <div className={styles.dropdownMenu}>
            <Logout />
          </div>
        )}
      </div>
    </div>
  );
};
export default HeaderBar;
