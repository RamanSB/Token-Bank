import Image from "next/image";
import styles from "./Navbar.module.css";
import { roboto } from "@/app/fonts";
import logo from "../public/db-btc.webp";

const Navbar = () => {
    return <div className={styles.navbar}>
        <div className={styles.titleIconContainer}>
            <Image src={logo} width={36} height={36} alt="Token Bank Logo" objectFit="contain" />
            <h2 style={{ ...roboto.style }}>Token Bank</h2>
        </div>
    </div>
}

export default Navbar