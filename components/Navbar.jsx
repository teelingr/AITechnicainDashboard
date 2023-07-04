import React, { useState, useEffect, useContext } from "react";
import Image from 'next/image';
import Link from 'next/link';
import styles from './Navbar.module.css';
import Notepad from './NotePad/Notepad.jsx'; // updated import
import ThemeContext from './ThemeContext'; // update with the actual path to ThemeContext.js

function Navbar () {
	// Backend Online/Offline
	const [data, setData] = useState(null);

	// Setting light/dark theme
	const [showPane, setShowPane] = useState(false);
	const { theme, toggleTheme } = useContext(ThemeContext);

	// Ping the backend to see if it is online
	const fetchData = async () => {
		try {
			const response = await fetch('http://localhost:5000/test');
			const data = await response.json();
			setData(data);
		} catch (error) {
			console.log(error);
		}
	};

	// Toggle the light/dark theme
	const togglePane = () => {
		setShowPane(!showPane);
	};

	useEffect(() => { 	// Run on every render
		fetchData(); 	// Ping the backend
	}, []);

	return (
		<nav className={`${styles.navbar} ${theme}`}>
			<div className={styles.navbar_left}>
				<div className={styles.logo}>
					<Link href='/'>
						<div className={styles.logo_img}>
							<Image src="/SEW_LOGO.png" alt="SEW-Eurodrive Logo" width={100} height={50}/>
						</div>
					</Link>
				</div >
				
			</div>
			{/* <h1>Hotline Service Dashboard</h1> */}
			<div className={styles.navbar_center}>
				<Image   src={theme === 'light-theme' ? "svg/Grey_Logo_svg.svg" : "svg/White_Logo_svg.svg"} alt="DriveAuto Logo" width={400} height={50}/>
				</div>
			<div className={styles.navbar_right}>
				<div onClick={togglePane} className={styles.svgIcon}>
					<Image
						src="/svg/notepad_white.svg" // svg to be made in white only due to persistent dark navbar
						alt="Notepad Icon"
						width={30}
						height={30}
					/>
				</div>
				{showPane && <Notepad />}
				<div onClick={toggleTheme} className={styles.svgIcon}>
					<Image
  						className={theme === 'light-theme' ? "" : styles.flip}
						src={theme === 'light-theme' ? "svg/brightness (1).svg" : "svg/brightness.svg"}
						alt="Theme toggle button"
						width={30}
						height={30}
					/>
				</div>
				{data ? <h4 style={{ color: '#03ff00'}}>{data.message}</h4> : <h4 style={{ color: '#ff0000' }}><b>RED ALERT</b></h4>} 
			</div>
		</nav>
	);
};

export default Navbar;
