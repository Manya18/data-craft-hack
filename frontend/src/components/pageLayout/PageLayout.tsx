import NavigationMenu from "../navigationMenu/NavigationMenu"
import styles from './pageLayout.module.css'

const PageLayout = ({tab, children} : {tab: string, children: React.ReactNode}) => {
    return (
        <div className={styles.pageLayout}>
            <NavigationMenu/>
            {children}
        </div>
    )
}
export default PageLayout;