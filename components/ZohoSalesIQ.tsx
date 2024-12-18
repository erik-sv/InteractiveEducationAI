"use client";

import Script from "next/script";

import styles from "../styles/zoho.module.css";

export default function ZohoSalesIQ() {
  return (
    <>
      <div className={styles.container}>
        <Script
          dangerouslySetInnerHTML={{
            __html: `
              window.$zoho=window.$zoho || {};
              $zoho.salesiq=$zoho.salesiq||{widgetcode:"siq1951a9a1046c82c92cba80620c196025e6a665230f0421ea1a08fd48e421c096",values:{},ready:function(){}};
              var d=document;
              s=d.createElement("script");
              s.type="text/javascript";
              s.id="zsiqscript";
              s.defer=true;
              s.src="https://salesiq.zohopublic.com/widget";
              t=d.getElementsByTagName("script")[0];
              t.parentNode.insertBefore(s,t);

              $zoho.salesiq.ready = function() {
                $zoho.salesiq.floatwindow.visible("hide");
                $zoho.salesiq.floatbutton.visible("hide");
                $zoho.salesiq.soundnotification.enable("disable");
                $zoho.salesiq.visitor.trigger("hide");
                $zoho.salesiq.visitor.info("hide");
                $zoho.salesiq.visitor.chat("hide");
              };
            `,
          }}
          strategy="afterInteractive"
        />
      </div>
    </>
  );
}
