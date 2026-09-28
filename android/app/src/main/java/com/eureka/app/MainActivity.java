package com.eureka.app;

import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        disableOverScroll();
    }

    @Override
    public void onResume() {
        super.onResume();
        disableOverScroll();
    }

    private void disableOverScroll() {
        if (this.bridge != null && this.bridge.getWebView() != null) {
            final WebView webView = this.bridge.getWebView();
            webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
            webView.setVerticalScrollBarEnabled(false);
            webView.setHorizontalScrollBarEnabled(false);
            webView.post(new Runnable() {
                @Override
                public void run() {
                    webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
                }
            });
        }
    }
}
