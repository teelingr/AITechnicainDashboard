import React from "react";
import Image from "next/image";
import styles from "./ProductPanel.module.css";

function ProductPanel({name, description, hasIcon, src, alt, isLinked, downloadLink, fetchPDF, isHeader }) {

    const handleIconClick = async () => {
        if(fetchPDF && downloadLink) {
            const url = await fetchPDF(downloadLink);
            window.open(url, "_blank");
        }
    };

    return (
        <div className={`${styles.product} ${isHeader ? styles.headerProduct : ''}`}
        onClick={handleIconClick}>
            <li> {name} </li>
            <li>{description}</li>
            {hasIcon && <a onClick={handleIconClick}><Image src={src} alt={alt} height={20} width={20} className={styles["productImage"]}/></a>}
            {isLinked && <div className={styles.tag}>API &#x2713;</div>} {/* &#x2713; is the checkmark symbol */}
        </div>
    );
}

ProductPanel.defaultProps = {  
    hasIcon: false,
    isHeader: false
}

export default ProductPanel;