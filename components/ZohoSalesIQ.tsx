"use client";

import Script from "next/script";

import styles from "../styles/zoho.module.css";

export default function ZohoSalesIQ() {
  return (
    <>
      <div className={styles.container}>
        <Script
          dangerouslySetInnerHTML={{
            __html: `window.$zoho=window.$zoho || {};$zoho.salesiq=$zoho.salesiq||{ready:function(){}}`,
          }}
          strategy="afterInteractive"
        />
        <Script
          id="zsiqscript"
          src="https://salesiq.zohopublic.com/widget?wc=siq1951a9a1046c82c92cba80620c196025e6a665230f0421ea1a08fd48e421c096"
          strategy="afterInteractive"
        />
      </div>
    </>
  );
}
