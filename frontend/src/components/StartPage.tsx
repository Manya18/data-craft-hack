import React, { useState } from "react";
import styles from "./startPage.module.css";
import { Divider } from "@mui/material";
import { Outlet } from "react-router-dom";
import { t } from 'i18next';

function StartPage() {
    const isTabActive = (tabName: string) => {
        const linkParts = window.location.pathname.split('/');
        console.log(linkParts)
        return linkParts.includes(tabName)
    }
    const [isLogin, setIsLogin] = useState(true);
    function changeForm(value: string) {
        if (value == "login") setIsLogin(true);
        else setIsLogin(false);
    }
    const tabs = ["table", "analys"]

    return (
        <div className={styles.startForm}>
            <div className={styles.tabsWrapper}>
                <div className={styles.tabs}>
                    {tabs.map((tab) => (
                        <a onClick={() => changeForm(tab)} key={tab} className={styles.tab + " " + (isTabActive(tab) && styles.active)} href={"/" + tab}>
                            {tab}
                        </a>
                    ))}
                </div>
                <Divider></Divider>
            </div>
            {/* {isLogin ? (
                <Login />
            ) : (
                <Registartion />
            )} */}
            <Outlet></Outlet>
        </div>
    );
}

export default StartPage;
