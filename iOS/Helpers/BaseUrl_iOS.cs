using System;

using Xamarin.Forms;
using MonoTouch.Foundation;
using ChartPerformance.iOS.Helpers;


[assembly: Dependency (typeof (BaseUrl_iOS))]
namespace ChartPerformance.iOS.Helpers
{
    public class BaseUrl_iOS : IBaseUrl {
        public string Get () {
            return NSBundle.MainBundle.BundlePath;
        }
    }
}

