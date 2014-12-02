using System;
using Xamarin.Forms;
using Xamarin.Forms.Platform.iOS;
using MonoTouch.Foundation;
using MonoTouch.UIKit;
using ChartPerformance;
using ChartPerformance.iOS;

[assembly: ExportRenderer (typeof (BaseUrlWebView), typeof (BaseUrlWebViewRenderer))]

namespace ChartPerformance.iOS
{
    public class BaseUrlWebViewRenderer : WebViewRenderer 
    {
        public override void LoadHtmlString (string s, NSUrl baseUrl) 
        {
            if (baseUrl == null) {
                baseUrl = new NSUrl (NSBundle.MainBundle.BundlePath, true);
            }
            base.LoadHtmlString (s, baseUrl);
        }
    }
}
