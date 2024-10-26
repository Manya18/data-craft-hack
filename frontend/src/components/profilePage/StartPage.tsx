import { Divider } from "@mui/material";
import styles from "./startPage.module.css";
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useState } from "react";
import Logout from "./Logout";
import { Outlet } from "react-router-dom";

const startPage = () => {
    const isTabActive = (tabName: string) => {
        const linkParts = window.location.pathname.split('/');
        console.log(linkParts)
        return linkParts.includes(tabName)
    }

    return (
        <div className={styles.startForm}>
            <div className={styles.tabsWrapper}>
                <div className={styles.tabs}>
                    <a
                        href="/signin/autorizate"
                        className={
                            styles.tab + " " + (isTabActive("autorizate") && styles.active)
                        }
                    >
                        Вход
                    </a>
                    <a
                        href="/signin/registrate"
                        className={
                            styles.tab + " " + (isTabActive("analyse") && styles.active)
                        }
                    >
                        Регистрация
                    </a>
                </div>
                <Divider></Divider>
            </div>
            <Outlet></Outlet>

        </div>
    );
};
export default startPage;
