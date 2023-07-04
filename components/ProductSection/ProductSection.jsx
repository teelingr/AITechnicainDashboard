import React, { useState, useEffect } from "react";
import styles from "./ProductSection.module.css";

import ProductPanel from "./ProductPanel";
import Searchbar from "./Searchbar";

const ProductSection = () => {
  const [productInfo, setProductInfo] = React.useState({}); // becomes a json object where each key is a product info field and each value is the value of that field

  // From the child component Searchbar.jsx, we get the serial number and set it to the state selectedSerialNumber.
  const [selectedSerialNumber, setSelectedSerialNumber] = useState(""); // when a serial number is selected from the dropdown, save it to memory
  const [isProductInfo, setIsProductInfo] = useState(false); // when this is true, the product information area will appear

  // handles the selection of a serial number (called in the return section of this component)
  const handleSerialNumberSelect = (selectedSerialNumber) => {
    setSelectedSerialNumber(selectedSerialNumber); // this set's the state of selectedSerialNumber to the selected serial number (appears in the heading)
    console.log("Lifted serial number:", selectedSerialNumber);
    fetchProductInformation(selectedSerialNumber); // soon to be the primary function for fetching all product information
    setIsProductInfo(true);
  };

  const fetchProductInformation = async (serialNumber) => {
    console.log("Fetching product information from: ", serialNumber);

    if (serialNumber.trim() !== "") {
      fetch(`http://127.0.0.1:5000/api/get-serial-number-info`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serialNumber }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data); // Log the received product information
          setProductInfo(data); // Set the productInfo object
        })
        .catch((error) =>
          console.error("Error fetching product information:", error)
        );
    }
  };

  const fetchPDF = async (fileName) => {
    const response = await fetch(
      `http://127.0.0.1:5000/api/get-pdf/${fileName}`
    );
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    return url;
  };

  useEffect(() => {
    // This code runs after every render, including the first render.
    if (selectedSerialNumber.trim() !== "") {
      // It also updates if the state of selectedSerialNumber changes.
      console.log("Lifted serial number:", selectedSerialNumber);
      fetchProductInformation(selectedSerialNumber); // soon to be the primary function for fetching all product information
      console.log("Product information:", productInfo);
    }
  }, [selectedSerialNumber]);

  return (
    <div
      styles={{
        height: isProductInfo ? "360px" : "200px",
        opacity: isProductInfo ? 100 : 0,
      }}
      className={styles.productSection}
    >
      <div className={styles.productSectionHeader}>
        <h2>Serial Lookup</h2>
        <p>
          {selectedSerialNumber ? `Product Information for ${selectedSerialNumber}` : "Please enter serial number and then select it from the drop-down."}
        </p>

      </div>
      <Searchbar onSerialNumberSelect={handleSerialNumberSelect} />
      <div
        style={{
          height: isProductInfo ? "360px" : "0px",
          opacity: isProductInfo ? 100 : 0,
        }}
        className={styles.productSectionMain}
      >
        <div
          style={{ height: isProductInfo ? "360px" : "0px" }}
          className={styles.productSectionColumn}
        >
          <h2>Machine Info</h2>
          <div>
            <li>{productInfo.designation}
            </li>
            <li>{productInfo.model_code}</li>
            <li>{productInfo.case_reports + " Previous Case Reports Found"}</li>
          </div>
        </div>
        <div
          style={{ height: isProductInfo ? "360px" : "0px" }}
          className={`${styles.productSectionColumn}  ${styles.verticalLine}`}
        >
          <h2>Company Info</h2>
          <div>
            <li>{productInfo.company}
            </li>
            <li>{productInfo.phone_number}</li>
            <li>{productInfo.address}</li>
          </div>
        </div>
        <div
          style={{ height: isProductInfo ? "360px" : "0px" }}
          className={`${styles.productSectionColumn} ${styles.verticalLine}`}
        >
          <h2>PDF Documents</h2>
          <ProductPanel
            description="Manual"
            hasIcon={true}
            src="/svg/download.svg"
            alt="download icon"
            downloadLink="Manual_R37DRN90L4.pdf"
            fetchPDF={fetchPDF}
          />
          <ProductPanel
            description="Dimensions"
            hasIcon={true}
            src="/svg/download.svg"
            alt="download icon"
            downloadLink="Dimensions_R37DRN90L4.pdf"
            fetchPDF={fetchPDF}
          />
          <ProductPanel
            description="Installation"
            hasIcon={true}
            src="/svg/download.svg"
            alt="download icon"
            downloadLink="Installation_R37DRN90L4.pdf"
            fetchPDF={fetchPDF}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductSection;
